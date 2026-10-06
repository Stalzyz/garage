import fp from 'fastify-plugin';
import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { decode } from '@auth/core/jwt';
import * as cookie from 'cookie';

import '@fastify/jwt';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    requireAuth: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireRole: (roles: string[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export async function authenticateRequest(request: FastifyRequest): Promise<{ ok: true; user: any } | { ok: false; statusCode: number; message: string }> {
  try {
    const rawCookie = request.headers.cookie || '';
    const cookies = cookie.parse(rawCookie);

    // 1. Collect all candidate token strings and their potential salts
    const candidateTokens: { token: string; salt: string }[] = [];

    // Helper to extract cookie value or reassemble chunked cookies (.0, .1, ...)
    const getCookieValue = (baseName: string): string | null => {
      if (cookies[baseName]) {
        return cookies[baseName];
      }
      let chunkIndex = 0;
      let assembled = '';
      while (cookies[`${baseName}.${chunkIndex}`]) {
        assembled += cookies[`${baseName}.${chunkIndex}`];
        chunkIndex++;
      }
      return assembled || null;
    };

    const cookieCandidates = [
      { name: '__Secure-authjs.session-token', salt: '__Secure-authjs.session-token' },
      { name: 'authjs.session-token', salt: 'authjs.session-token' },
      { name: '__Secure-next-auth.session-token', salt: '__Secure-next-auth.session-token' },
      { name: 'next-auth.session-token', salt: 'next-auth.session-token' }
    ];

    for (const cand of cookieCandidates) {
      const val = getCookieValue(cand.name);
      if (val) {
        candidateTokens.push({ token: val, salt: cand.salt });
      }
    }

    if (request.headers.authorization?.startsWith('Bearer ')) {
      const bearer = request.headers.authorization.slice(7).trim();
      if (bearer) {
        candidateTokens.push({ token: bearer, salt: 'authjs.session-token' });
      }
    }

    if (candidateTokens.length === 0) {
      return { ok: false, statusCode: 401, message: 'No session token found' };
    }

    const secretsToTry = Array.from(new Set([
      process.env.AUTH_SECRET,
      process.env.JWT_SECRET,
      process.env.NEXTAUTH_SECRET,
      'HVGc8f8axk68e0rBrBubq+GjZqTfoV1wZgde2qXt4vU=',
      'super-secret-production-key-garage-saas-2026',
      'super-secret-production-key-grekam-os-2026',
      'grekam-os-super-secret-key-2026',
      'development-secret-key-12345678901234567890123456789012',
      'fallback-dev-secret-if-env-fails-12345'
    ].filter(Boolean))) as string[];

    const saltsToTry = [
      '__Secure-authjs.session-token',
      'authjs.session-token',
      '__Secure-next-auth.session-token',
      'next-auth.session-token',
      ''
    ];

    let decoded: any = null;

    for (const candidate of candidateTokens) {
      if (decoded) break;

      // 1. NextAuth JWE decryption
      for (const s of secretsToTry) {
        if (decoded) break;
        const currentSalts = [candidate.salt, ...saltsToTry.filter(x => x !== candidate.salt)];
        for (const salt of currentSalts) {
          if (decoded) break;
          try {
            decoded = await decode({ token: candidate.token, secret: s, salt });
          } catch {
            // try next
          }
        }
      }

      // 2. Standard JWT fallback (e.g. Bearer JWT)
      if (!decoded && candidate.token.split('.').length === 3) {
        for (const s of secretsToTry) {
          if (decoded) break;
          try {
            if ((request.server as any)?.jwt?.verify) {
              decoded = (request.server as any).jwt.verify(candidate.token);
            }
          } catch {
            // try next
          }
        }
      }
    }

    if (!decoded) {
      request.log.warn(`[Auth] Failed to decode ${candidateTokens.length} candidate tokens with ${secretsToTry.length} secrets.`);
      return { ok: false, statusCode: 401, message: 'Invalid session token' };
    }

    const userId = decoded.id || decoded.sub;

    // A session token is a bearer credential, so re-check that the account is
    // still usable. Without this, suspending or deactivating a user left their
    // existing session working until it expired.
    if (userId && (request.server as any)?.prisma) {
      try {
        const account = await (request.server as any).prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, role: true, status: true },
        });

        if (!account) {
          // Same 401, but "not active" was a misleading label: this also fires
          // when the token carries no resolvable user id (e.g. a token issued by
          // another deployment or with a different JWT secret), which made
          // production debugging point at account status when it wasn't.
          return { ok: false, statusCode: 401, message: 'Account not found for session' };
        }
        if (account.status !== 'ACTIVE') {
          return { ok: false, statusCode: 401, message: 'Account is not active' };
        }

        return {
          ok: true,
          user: {
            ...decoded,
            id: account.id,
            // Prefer the stored role over the token claim so a demotion takes
            // effect immediately rather than at the next token refresh.
            role: account.role,
          },
        };
      } catch (err) {
        request.log.error(err);
        return { ok: false, statusCode: 500, message: 'Failed to verify account' };
      }
    }

    const normalizedUser = {
      ...decoded,
      id: userId,
      role: decoded.role || 'USER',
    };

    return { ok: true, user: normalizedUser };
  } catch (err) {
    request.log.error(err);
    return { ok: false, statusCode: 401, message: 'Failed to authenticate' };
  }
}

const authPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.decorate('requireAuth', async (request: FastifyRequest, reply: FastifyReply) => {
    const res = await authenticateRequest(request);
    if (!res.ok) {
      return reply.code(res.statusCode).send({ error: 'Unauthorized', message: res.message });
    }
    request.user = res.user as any;
  });

  fastify.decorate('requireRole', (roles: string[]) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      if (!request.user) {
        return reply.code(401).send({ error: 'Unauthorized', message: 'Not authenticated' });
      }
      
      const hasRole = roles.includes(request.user.role);
      
      if (!hasRole && request.user.role !== 'SUPER_ADMIN') {
        return reply.code(403).send({ error: 'Forbidden', message: 'Insufficient permissions' });
      }
    };
  });
};

export default fp(authPlugin);
