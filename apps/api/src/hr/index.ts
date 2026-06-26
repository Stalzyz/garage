import { FastifyInstance } from 'fastify';
import employeeRoutes from './employees.router';
import attendanceRoutes from './attendance.router';
import leavesRoutes from './leaves.router';
import payrollRoutes from './payroll.router';
import onboardingRoutes from './onboarding.router';
import documentsRoutes from './documents.router';
import timeRoutes from './time.router';

export default async function hrModule(app: FastifyInstance) {
  app.addHook('preHandler', app.requireAuth);
  
  await app.register(employeeRoutes, { prefix: '/employees' });
  await app.register(attendanceRoutes, { prefix: '/attendance' });
  await app.register(leavesRoutes, { prefix: '/leaves' });
  await app.register(payrollRoutes, { prefix: '/payroll' });
  await app.register(onboardingRoutes, { prefix: '/onboarding' });
  await app.register(documentsRoutes, { prefix: '/documents' });
  await app.register(timeRoutes, { prefix: '/time' });
}
