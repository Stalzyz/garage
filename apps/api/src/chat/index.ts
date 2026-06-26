import { FastifyInstance } from 'fastify';
import messagesRoutes from './messages.router';

export default async function chatModule(app: FastifyInstance) {
  await app.register(messagesRoutes, { prefix: '/messages' });
}
