import { FastifyInstance } from 'fastify';

export default async function analyticsRouter(app: FastifyInstance) {
  // GET /api/v1/academy/analytics
  app.get('/', async (req, reply) => {
    // 1. Total active students
    const totalStudents = await app.prisma.student.count({ where: { isAlumni: false } });
    
    // 2. Average XP across all students
    const xpAgg = await app.prisma.student.aggregate({ _avg: { xp: true } });
    const avgXp = Math.round(xpAgg._avg.xp || 0);

    // 3. Total Quizzes Passed vs Failed
    const totalQuizAttempts = await app.prisma.quizAttempt.count();
    const passedQuizzes = await app.prisma.quizAttempt.count({ where: { passed: true } });
    const quizPassRate = totalQuizAttempts > 0 ? Math.round((passedQuizzes / totalQuizAttempts) * 100) : 0;

    // 4. "At-Risk" Students (Low XP or hasn't completed assignments)
    // We'll define at-risk as XP < 50 for this mock
    const atRiskStudents = await app.prisma.student.findMany({
      where: { xp: { lt: 50 }, isAlumni: false },
      include: { user: { select: { firstName: true, lastName: true, email: true } } },
      take: 5
    });

    return {
      data: {
        totalStudents,
        avgXp,
        quizPassRate,
        atRiskStudents
      }
    };
  });
}
