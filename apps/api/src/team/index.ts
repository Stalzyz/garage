import { FastifyInstance } from 'fastify';
import teamRouter from './team.router';

export default async function teamModule(app: FastifyInstance) {
  await app.register(teamRouter);
}
