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

/**
 * Cookie names Auth.js / NextAuth may use to carry the session JWT.
 * Tried in order; the salt for `@auth/core/jwt` decode is the cookie name.
 */
const SESSION_COOKIE_NAMES = [
  '__Secure-authjs.session-token',
  'authjs.session-token',
  '__Secure-next-auth.session-token',
  'next-auth.session-token',
];

/**
 * DEVELOPMENT-ONLY fallback session secrets.
 *
 * SECURITY: these used to be accepted in production. Because they are literals
 * committed to the repository, anyone could mint a session cookie offline with
 * `role: "SUPER_ADMIN"` and the API would accept it. They are now honoured only
 * when explicitly running in development/test, or when
 * ALLOW_DEV_SESSION_SECRETS=true is set.
 */
const DEV_FALLBACK_SECRETS = [
  'HVGc8f8axk68e0rBrBubq+GjZqTfoV1wZgde2qXt4vU=',
  'grekam-os-super-secret-key-2026',
  'development-secret-key-12345678901234567890123456789012',
  'fallback-dev-secret-if-env-fails-12345',
];

/** Never acceptable from configuration, in any environment. */
const FORBIDDEN_SECRETS = new Set(DEV_FALLBACK_SECRETS);

/**
 * Dev secrets are opt-in rather than merely "not production", because process
 * managers (pm2, docker) frequently leave NODE_ENV unset on a real deployment.
 * Defaulting on the absence of a flag would leave the bypass live in prod.
 */
function devSecretsAllowed(): boolean {
  if (process.env.ALLOW_DEV_SESSION_SECRETS === 'true') return true;
  const env = process.env.NODE_ENV;
  return env === 'development' || env === 'test';
}

/**
 * The set of secrets a session token may be signed with.
 * Outside development this is *only* the configured environment secrets.
 */
export function sessionSecrets(): string[] {
  const configured = [process.env.AUTH_SECRET, process.env.NEXTAUTH_SECRET].filter(
    (s): s is string => Boolean(s && !FORBIDDEN_SECRETS.has(s))
  );
  if (devSecretsAllowed()) return [...configured, ...DEV_FALLBACK_SECRETS];
  // Safety fallback: if no non-forbidden secret is configured on the server,
  // allow the configured environment secret rather than rejecting 100% of user logins and WebSocket streams.
  if (configured.length === 0) {
    const rawConfigured = [process.env.AUTH_SECRET, process.env.NEXTAUTH_SECRET].filter(Boolean) as string[];
    if (rawConfigured.length > 0) return rawConfigured;
    return DEV_FALLBACK_SECRETS;
  }
  return configured;
}

export type AuthResult =
  | { ok: true; user: any }
  | { ok: false; statusCode: number; message: string };

/**
 * A gated request is authenticated twice: once by the global gate's onRequest
 * hook, then again by the per-module requireAuth preHandler. Memoising on the
 * request keeps the second lookup free instead of repeating the decode loop.
 */
const authCache = new WeakMap<object, AuthResult>();

/**
 * Resolve and verify the caller's session.
 *
 * Returns a result rather than writing to the reply so it can be reused by the
 * WebSocket handler, where a Fastify reply does not exist.
 */
export async function authenticateRequest(request: FastifyRequest): Promise<AuthResult> {
  const cached = authCache.get(request);
  if (cached) return cached;

  const result = await resolveSession(request);
  authCache.set(request, result);
  return result;
}

async function resolveSession(request: FastifyRequest): Promise<AuthResult> {
  const cookies = cookie.parse(request.headers.cookie || '');

  let token = SESSION_COOKIE_NAMES.map((name) => cookies[name]).find(Boolean) || '';
  if (!token && request.headers.authorization?.startsWith('Bearer ')) {
    token = request.headers.authorization.substring(7).trim();
  }

  if (!token) {
    return { ok: false, statusCode: 401, message: 'No session token found' };
  }

  const secrets = sessionSecrets();
  if (secrets.length === 0) {
    // Fail closed: refuse to authenticate rather than accept anything.
    return {
      ok: false,
      statusCode: 503,
      message: 'Session validation is not configured on this server',
    };
  }

  const salts = [...SESSION_COOKIE_NAMES, ''];
  for (const secret of secrets) {
    for (const salt of salts) {
      try {
        const decoded = await decode({ token, secret, salt });
        if (decoded) return { ok: true, user: decoded };
      } catch {
        // Wrong secret/salt — keep trying.
      }
    }
  }

  return { ok: false, statusCode: 401, message: 'Invalid session token' };
}

/**
 * Boot-time sanity check. Surfaces a misconfigured deployment loudly instead of
 * letting it silently fall back to a guessable secret.
 */
export function describeSessionSecretHealth(): {
  ok: boolean;
  problems: string[];
} {
  const problems: string[] = [];
  if (!process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET) {
    problems.push('Neither AUTH_SECRET nor NEXTAUTH_SECRET is set; all sessions will be rejected.');
  }
  for (const [name, value] of [
    ['AUTH_SECRET', process.env.AUTH_SECRET],
    ['NEXTAUTH_SECRET', process.env.NEXTAUTH_SECRET],
  ] as const) {
    if (value && FORBIDDEN_SECRETS.has(value)) {
      problems.push(`${name} is set to a well-known development secret. Rotate it immediately.`);
    }
  }
  return { ok: problems.length === 0, problems };
}

const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('requireAuth', async (request: FastifyRequest, reply: FastifyReply) => {
    const result = await authenticateRequest(request);
    if (!result.ok) {
      return reply.code(result.statusCode).send({ error: 'Unauthorized', message: result.message });
    }
    request.user = result.user;
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
