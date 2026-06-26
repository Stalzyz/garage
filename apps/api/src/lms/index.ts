import { FastifyInstance } from 'fastify';
import coursesRoutes from './courses.router';
import lessonsRoutes from './lessons.router';
import progressRoutes from './progress.router';
import assignmentsRoutes from './assignments.router';
import quizzesRouter from './quizzes.router';
import streamRouter from './stream.router';
import enrollmentsRoutes from './enrollments.router';
import analyticsRoutes from './analytics.router';
import badgesRoutes from './badges.router';

export default async function lmsModule(app: FastifyInstance) {
  await app.register(coursesRoutes, { prefix: '/courses' });
  await app.register(lessonsRoutes, { prefix: '/lessons' });
  await app.register(progressRoutes, { prefix: '/progress' });
  await app.register(assignmentsRoutes, { prefix: '/assignments' });
  await app.register(quizzesRouter, { prefix: '/quizzes' });
  await app.register(streamRouter); // Mounts at /api/v1/lms/stream/*
  await app.register(enrollmentsRoutes, { prefix: '/enrollments' });
  await app.register(analyticsRoutes, { prefix: '/analytics' });
  await app.register(badgesRoutes, { prefix: '/badges' });
}
