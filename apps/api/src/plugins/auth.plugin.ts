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

const authPlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.decorate('requireAuth', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const cookies = cookie.parse(request.headers.cookie || '');
      const token = cookies['authjs.session-token'] || cookies['__Secure-authjs.session-token'];

      if (!token) {
        return reply.code(401).send({ error: 'Unauthorized', message: 'No session token found' });
      }

      request.log.info(`[Auth] Token received. Secret length: ${process.env.AUTH_SECRET ? process.env.AUTH_SECRET.length : 0}`);
      
      const decoded = await decode({
        token,
        secret: process.env.AUTH_SECRET || "fallback-dev-secret-if-env-fails-12345",
        salt: cookies['__Secure-authjs.session-token'] ? "__Secure-authjs.session-token" : "authjs.session-token"
      });

      if (!decoded) {
        return reply.code(401).send({ error: 'Unauthorized', message: 'Invalid session token' });
      }

      request.user = decoded as any;
    } catch (err) {
      request.log.error(err);
      return reply.code(401).send({ error: 'Unauthorized', message: 'Failed to authenticate' });
    }
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
