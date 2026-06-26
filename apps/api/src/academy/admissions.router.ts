import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const CreateApplicationSchema = z.object({
  studentId: z.string().min(1),
  courseId: z.string().optional(),
  portfolioUrl: z.string().url().optional(),
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
    const application = await app.prisma.application.create({
      data: body,
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
