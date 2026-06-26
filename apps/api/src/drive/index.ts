import { FastifyInstance } from 'fastify';
import filesRoutes from './files.router';

export default async function driveModule(app: FastifyInstance) {
  await app.register(filesRoutes, { prefix: '/drive' });
}
