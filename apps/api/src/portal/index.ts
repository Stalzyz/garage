import { FastifyInstance } from 'fastify';
import portalRouter from './portal.router';

export default async function portalModule(app: FastifyInstance) {
  app.addHook("preHandler", app.requireAuth);
  app.register(portalRouter);
}
