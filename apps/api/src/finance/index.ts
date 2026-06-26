import { FastifyInstance } from 'fastify';
import invoicesRouter from './invoices.router';
import expensesRouter from './expenses.router';
import vendorsRouter from './vendors.router';
import subscriptionsRouter from './subscriptions.router';

export default async function financeModule(app: FastifyInstance) {
  await app.register(invoicesRouter);
  await app.register(expensesRouter);
  await app.register(vendorsRouter);
  await app.register(subscriptionsRouter, { prefix: '/subscriptions' });
}
