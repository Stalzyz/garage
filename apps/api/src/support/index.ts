import { FastifyInstance } from 'fastify';
import ticketsRoutes from './tickets.router';

export default async function supportModule(app: FastifyInstance) {
  await app.register(ticketsRoutes, { prefix: '/tickets' });
}
