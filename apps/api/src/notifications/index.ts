import { FastifyInstance } from 'fastify';
import notificationsRouter from './notifications.router';

export default async function notificationsModule(app: FastifyInstance) {
  await app.register(notificationsRouter);
}
