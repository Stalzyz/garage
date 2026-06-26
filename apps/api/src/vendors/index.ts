import { FastifyInstance } from 'fastify';
import vendorsRouter from './vendors.router';

export default async function vendorsModule(app: FastifyInstance) {
  await app.register(vendorsRouter);
}
