import { FastifyInstance } from 'fastify';
import campaignsRouter from './campaigns.router';
import emailRouter from './email.router';
import socialRouter from './social.router';

export default async function marketingModule(app: FastifyInstance) {
  app.addHook('preHandler', app.requireAuth);
  
  await app.register(campaignsRouter, { prefix: '/campaigns' });
  await app.register(emailRouter, { prefix: '/email' });
  await app.register(socialRouter);
}
