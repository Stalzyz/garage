import { FastifyInstance } from 'fastify';
import leadsRouter from './leads.router';
import contactsRouter from './contacts.router';
import proposalsRouter from './proposals.router';
import aiRouter from './ai.router';
import telemetryRouter from './telemetry.router';
import publicLeadsRouter from './public-leads.router';
import publicProposalsRouter from './public-proposals.router';
import adsWebhookRouter from './ads-webhook.router';
import telephonyRouter from './telephony.router';

export default async function crmModule(app: FastifyInstance) {
  // Public routes
  await app.register(publicLeadsRouter, { prefix: '/public' });
  await app.register(publicProposalsRouter, { prefix: '/public' });
  await app.register(adsWebhookRouter, { prefix: '/public/webhooks' });

  // Protect all other CRM routes
  app.addHook('preHandler', app.requireAuth);

  await app.register(leadsRouter);
  await app.register(contactsRouter);
  await app.register(proposalsRouter);
  await app.register(telemetryRouter);
  await app.register(telephonyRouter);
  await app.register(aiRouter, { prefix: '/ai' });
}
