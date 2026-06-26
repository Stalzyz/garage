import { FastifyInstance } from 'fastify';
import rbacRoutes from './rbac.router';
import organizationRouter from './organization.router';
import financeSettingsRouter from './finance.router';
import integrationKeysRouter from './integrations.router';
import auditLogsRouter from './audit-logs.router';

export default async function settingsModule(app: FastifyInstance) {
  await app.register(rbacRoutes);
  await app.register(organizationRouter);
  await app.register(financeSettingsRouter);
  await app.register(integrationKeysRouter);
  await app.register(auditLogsRouter);
}
