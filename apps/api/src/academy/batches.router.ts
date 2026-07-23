import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const CreateBatchSchema = z.object({
  courseId: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(['MORNING', 'EVENING', 'WEEKEND', 'ONLINE']),
  capacity: z.number().int().positive().default(20),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  educatorId: z.string().optional(),
});

export default async function batchesRouter(app: FastifyInstance) {

  // GET /api/v1/academy/batches/sessions/upcoming
  app.get('/batches/sessions/upcoming', async (req, reply) => {
    const sessions = await app.prisma.classSession.findMany({
      where: { startTime: { gte: new Date() } },
      include: {
        batch: { select: { name: true, course: { select: { name: true } } } },
        educator: { select: { user: { select: { firstName: true, lastName: true } } } }
      },
      orderBy: { startTime: 'asc' },
      take: 20
    });
    return { data: sessions };
  });

  // GET /api/v1/academy/batches
  app.get('/batches', async (req, reply) => {
    const { isActive, courseId } = req.query as { isActive?: string; courseId?: string };
    
    let whereClause: any = {};
    if (isActive === 'true') whereClause.isActive = true;
    if (isActive === 'false') whereClause.isActive = false;
    if (courseId) whereClause.courseId = courseId;

    const batches = await app.prisma.batch.findMany({
      where: whereClause,
      include: {
        course: { select: { name: true, code: true } },
        educator: { select: { user: { select: { firstName: true, lastName: true, email: true } } } },
        _count: { select: { enrollments: true, sessions: true } },
      },
      orderBy: { startDate: 'desc' },
    });
    return { data: batches, total: batches.length };
  });

  // GET /api/v1/academy/batches/:id
  app.get('/batches/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const batch = await app.prisma.batch.findUnique({
      where: { id },
      include: {
        course: true,
        educator: { include: { user: true } },
        sessions: { orderBy: { startTime: 'asc' } },
        enrollments: { include: { student: { include: { user: true } } } },
      },
    });
    if (!batch) return reply.notFound('Batch not found');
    return batch;
  });

  // POST /api/v1/academy/batches
  app.post('/batches', async (req, reply) => {
    const body = CreateBatchSchema.parse(req.body);
    const batch = await app.prisma.batch.create({
      data: {
        ...body,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
      },
    });
    reply.code(201);
    return batch;
  });

  // POST /api/v1/academy/batches/with-course
  app.post('/batches/with-course', async (req, reply) => {
    const schema = z.object({
      courseName: z.string().min(1),
      courseCode: z.string().min(1),
      courseDuration: z.string().min(1),
      courseFee: z.number().min(0),
      batchName: z.string().min(1),
      batchType: z.enum(['MORNING', 'EVENING', 'WEEKEND', 'ONLINE']),
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
      capacity: z.number().int().positive().default(20)
    });
    const body = schema.parse(req.body);

    const result = await app.prisma.$transaction(async (tx) => {
      const course = await tx.course.create({
        data: {
          name: body.courseName,
          code: body.courseCode,
          duration: body.courseDuration,
          fee: body.courseFee,
          isPublished: true,
        }
      });

      const batch = await tx.batch.create({
        data: {
          courseId: course.id,
          name: body.batchName,
          type: body.batchType,
          startDate: new Date(body.startDate),
          endDate: new Date(body.endDate),
          capacity: body.capacity
        },
        include: { course: true }
      });

      return batch;
    });

    reply.code(201);
    return result;
  });

  // PATCH /api/v1/academy/batches/:id
  app.patch('/batches/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const schema = CreateBatchSchema.partial().extend({ isActive: z.boolean().optional() });
    const body = schema.parse(req.body);
    const batch = await app.prisma.batch.update({
      where: { id },
      data: {
        ...body,
        ...(body.startDate && { startDate: new Date(body.startDate) }),
        ...(body.endDate && { endDate: new Date(body.endDate) }),
      },
    });
    return batch;
  });

  // POST /api/v1/academy/batches/:id/sessions
  app.post('/batches/:id/sessions', async (req, reply) => {
    const { id } = req.params as { id: string };
    const SessionSchema = z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      startTime: z.string().datetime(),
      endTime: z.string().datetime(),
      educatorId: z.string().optional(),
      meetLink: z.string().url().optional(),
      location: z.string().optional(),
    });
    const body = SessionSchema.parse(req.body);

    const session = await app.prisma.batchSession.create({
      data: {
        ...body,
        batchId: id,
        startTime: new Date(body.startTime),
        endTime: new Date(body.endTime),
      },
    });
    reply.code(201);
    return session;
  });

  // GET /api/v1/academy/batches/sessions/upcoming
  app.get('/batches/sessions/upcoming', async (req, reply) => {
    // Mock getting the current student's enrollments
    const user = await app.prisma.user.findFirst({ where: { role: 'STUDENT' } });
    if (!user) return { data: [] };

    const student = await app.prisma.student.findUnique({ where: { userId: user.id } });
    if (!student) return { data: [] };

    const enrollments = await app.prisma.enrollment.findMany({
      where: { studentId: student.id },
      select: { batchId: true }
    });

    const batchIds = enrollments.map(e => e.batchId);

    const sessions = await app.prisma.batchSession.findMany({
      where: {
        batchId: { in: batchIds }
      },
      include: {
        batch: {
          include: { course: true }
        }
      },
      orderBy: { startTime: 'asc' }
    });

    return { data: sessions };
  });
}
