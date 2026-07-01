import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const CreateApplicationSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  courseId: z.string().optional(),
  portfolioUrl: z.string().optional(),
  statement: z.string().optional(),
});

const UpdateApplicationSchema = CreateApplicationSchema.partial().extend({
  status: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'ADMITTED', 'DEFERRED', 'REJECTED']).optional(),
  reviewNotes: z.string().optional(),
  reviewedBy: z.string().optional(),
});

export default async function admissionsRouter(app: FastifyInstance) {
  // GET /api/v1/academy/applications
  app.get('/applications', async (req, reply) => {
    const { status, courseId } = req.query as { status?: string; courseId?: string };
    const applications = await app.prisma.application.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(courseId && { courseId }),
      },
      include: {
        student: { select: { studentCode: true, user: { select: { firstName: true, lastName: true, email: true } } } },
        course: true
      },
      orderBy: { appliedAt: 'desc' },
    });
    return { data: applications, total: applications.length };
  });

  // GET /api/v1/academy/applications/:id
  app.get('/applications/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const application = await app.prisma.application.findUnique({
      where: { id },
      include: {
        student: { include: { user: true } },
      },
    });
    if (!application) return reply.notFound('Application not found');
    return application;
  });

  // POST /api/v1/academy/applications
  app.post('/applications', async (req, reply) => {
    const body = CreateApplicationSchema.parse(req.body);
    
    // Create User, Student, and Application in a transaction
    const application = await app.prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          role: 'STUDENT',
          passwordHash: '$2a$10$x4R4Qz4hVfQW9y4r4hVfQ.W9y4r4hVfQW9y4r4hVfQW9y4r4hVfQ', // Dummy hash for now
        }
      });

      // 2. Create Student
      const studentCode = `STU-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      const student = await tx.student.create({
        data: {
          userId: user.id,
          studentCode,
        }
      });

      // 3. Create Application
      return await tx.application.create({
        data: {
          studentId: student.id,
          courseId: body.courseId,
          portfolioUrl: body.portfolioUrl,
          statement: body.statement,
          status: 'SUBMITTED'
        },
        include: {
          student: { include: { user: true } },
          course: true
        }
      });
    });

    reply.code(201);
    return application;
  });

  // PATCH /api/v1/academy/applications/:id
  app.patch('/applications/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = UpdateApplicationSchema.parse(req.body);
    const application = await app.prisma.application.update({
      where: { id },
      data: body,
    });
    return application;
  });
}
