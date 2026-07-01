import { FastifyInstance } from 'fastify';
import employeeRoutes from './employees.router';
import attendanceRoutes from './attendance.router';
import leavesRoutes from './leaves.router';
import payrollRoutes from './payroll.router';
import onboardingRoutes from './onboarding.router';
import documentsRoutes from './documents.router';
import timeRoutes from './time.router';
import departmentsRoutes from './departments.router';
import teamsRoutes from './teams.router';
import telemetryRoutes from './telemetry.router';
import performanceRoutes from './performance.router';
import hrAnalyticsRoutes from './analytics.router';
import hrWebhooksRoutes from './webhooks.router';

export default async function hrModule(app: FastifyInstance) {
  // app.addHook('preHandler', app.requireAuth);
  
  await app.register(employeeRoutes, { prefix: '/employees' });
  await app.register(departmentsRoutes, { prefix: '/departments' });
  await app.register(teamsRoutes, { prefix: '/teams' });
  await app.register(attendanceRoutes, { prefix: '/attendance' });
  await app.register(leavesRoutes, { prefix: '/leaves' });
  await app.register(payrollRoutes, { prefix: '/payroll' });
  await app.register(onboardingRoutes, { prefix: '/onboarding' });
  await app.register(documentsRoutes, { prefix: '/documents' });
  await app.register(timeRoutes, { prefix: '/time' });
  await app.register(telemetryRoutes, { prefix: '/telemetry' });
  await app.register(performanceRoutes, { prefix: '/performance' });
  await app.register(hrAnalyticsRoutes, { prefix: '/analytics' });
  await app.register(hrWebhooksRoutes, { prefix: '/webhooks' });
}
