import { FastifyInstance } from 'fastify';

export default async function alumniRouter(app: FastifyInstance) {
  // GET /api/v1/academy/alumni
  app.get('/', async (req, reply) => {
    // Fetch students who have graduated
    const alumni = await app.prisma.student.findMany({
      where: { isAlumni: true },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } }
      },
      orderBy: { graduatedAt: 'desc' }
    });

    return { data: alumni };
  });

  // GET /api/v1/academy/alumni/:id
  app.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const alumni = await app.prisma.student.findFirst({
      where: { id, isAlumni: true },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } },
        Certificate: { include: { course: true } }
      }
    });

    if (!alumni) return reply.notFound('Alumni not found');
    return { data: alumni };
  });
}
