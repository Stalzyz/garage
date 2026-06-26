import { FastifyInstance } from 'fastify';
import admissionsRouter from './admissions.router';
import studentsRouter from './students.router';
import batchesRouter from './batches.router';
import enrollRouter from './enroll.router';
import certificatesRouter from './certificates.router';
import forumsRouter from './forums.router';
import leaderboardRouter from './leaderboard.router';
import jobsRouter from './jobs.router';
import analyticsRouter from './analytics.router';
import alumniRouter from './alumni.router';
import referralsRouter from './referrals.router';
import portfolioRouter from './portfolio.router';
import officeHoursRouter from './office-hours.router';

export default async function academyModule(app: FastifyInstance) {
  await app.register(admissionsRouter);
  await app.register(studentsRouter);
  await app.register(batchesRouter);
  await app.register(enrollRouter);
  await app.register(certificatesRouter, { prefix: '/certificates' });
  await app.register(forumsRouter, { prefix: '/forums' });
  await app.register(leaderboardRouter, { prefix: '/leaderboard' });
  await app.register(jobsRouter, { prefix: '/jobs' });
  await app.register(analyticsRouter, { prefix: '/analytics' });
  await app.register(alumniRouter, { prefix: '/alumni' });
  await app.register(referralsRouter, { prefix: '/referrals' });
  await app.register(portfolioRouter, { prefix: '/portfolio' });
  await app.register(officeHoursRouter, { prefix: '/office-hours' });
}
