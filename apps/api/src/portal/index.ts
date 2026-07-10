import { FastifyInstance } from 'fastify';
import portalRouter from './portal.router';

export default async function portalModule(app: FastifyInstance) {
  app.register(portalRouter);
}
