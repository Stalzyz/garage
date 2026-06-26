import { FastifyInstance } from 'fastify';

export default async function officeHoursRouter(app: FastifyInstance) {
  // GET /api/v1/academy/office-hours
  app.get('/', async (req, reply) => {
    // Fetch upcoming office hours
    const sessions = await app.prisma.officeHour.findMany({
      where: { scheduledFor: { gte: new Date() } },
      include: {
        mentor: { select: { firstName: true, lastName: true, avatarUrl: true } }
      },
      orderBy: { scheduledFor: 'asc' }
    });

    return { data: sessions };
  });

  // POST /api/v1/academy/office-hours
  app.post('/', async (req, reply) => {
    const { title, mentorId, meetLink, scheduledFor } = req.body as any;

    const session = await app.prisma.officeHour.create({
      data: {
        title,
        mentorId,
        meetLink,
        scheduledFor: new Date(scheduledFor)
      }
    });

    return reply.status(201).send({ success: true, data: session });
  });
}
