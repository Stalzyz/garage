import { FastifyInstance } from 'fastify';
import projectsRouter from './projects.router';
import tasksRouter from './tasks.router';

export default async function projectManagementModule(app: FastifyInstance) {
  app.addHook('preHandler', app.requireAuth);
  
  await app.register(projectsRouter);
  await app.register(tasksRouter);
}
