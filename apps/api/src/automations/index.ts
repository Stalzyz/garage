import { FastifyInstance } from 'fastify';
import workflowsRoutes from './workflows.router';

export default async function automationsModule(app: FastifyInstance) {
  await app.register(workflowsRoutes, { prefix: '/workflows' });
}
