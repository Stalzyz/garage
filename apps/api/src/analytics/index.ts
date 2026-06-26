import { FastifyInstance } from 'fastify';
import analyticsRouter from './analytics.router';

export default async function analyticsModule(app: FastifyInstance) {
  await app.register(analyticsRouter);
}
