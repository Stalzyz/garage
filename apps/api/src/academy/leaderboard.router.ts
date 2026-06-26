import { FastifyInstance } from 'fastify';

export default async function leaderboardRouter(app: FastifyInstance) {
  // GET /api/v1/academy/leaderboard
  app.get('/', async (req, reply) => {
    // Fetch top 50 students ordered by XP
    const students = await app.prisma.student.findMany({
      orderBy: { xp: 'desc' },
      take: 50,
      include: {
        user: { select: { firstName: true, lastName: true, avatarUrl: true } }
      }
    });

    return { data: students };
  });

  // GET /api/v1/academy/leaderboard/me
  app.get('/me', async (req, reply) => {
    const user = await app.prisma.user.findFirst({ where: { role: 'STUDENT' } });
    if (!user) return reply.status(401).send({ error: 'Not authenticated' });

    const student = await app.prisma.student.findUnique({
      where: { userId: user.id },
      include: {
        user: { select: { firstName: true, lastName: true } }
      }
    });

    if (!student) return reply.status(404).send({ error: 'Student profile not found' });

    // Calculate rank
    const higherRankedCount = await app.prisma.student.count({
      where: { xp: { gt: student.xp } }
    });

    return { data: { ...student, rank: higherRankedCount + 1 } };
  });
}
