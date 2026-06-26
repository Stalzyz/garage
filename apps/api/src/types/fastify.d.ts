import { PrismaClient } from '@grekam/db';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}
