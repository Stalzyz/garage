import { FastifyInstance } from 'fastify';
import invoicesRouter from './invoices.router';
import expensesRouter from './expenses.router';
import vendorsRouter from './vendors.router';
import subscriptionsRouter from './subscriptions.router';
import estimatesRouter from './estimates.router';
import productsRouter from './products.router';
import revenueRouter from './revenue.router';

export default async function financeModule(app: FastifyInstance) {
  await app.register(invoicesRouter);
  await app.register(expensesRouter);
  await app.register(vendorsRouter);
  await app.register(estimatesRouter);
  await app.register(subscriptionsRouter, { prefix: '/subscriptions' });
  await app.register(productsRouter, { prefix: '/products' });
  await app.register(revenueRouter, { prefix: '/revenue' });
}
