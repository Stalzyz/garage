import { FastifyInstance } from 'fastify';

export default async function portfolioRouter(app: FastifyInstance) {
  // GET /api/v1/academy/portfolio/:studentId
  app.get('/:studentId', async (req, reply) => {
    const { studentId } = req.params as { studentId: string };

    const student = await app.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } },
        Certificate: { include: { course: { select: { name: true } } } },
        QuizAttempt: {
          where: { passed: true },
          include: { quiz: { select: { title: true } } }
        }
      }
    });

    if (!student) return reply.notFound('Student not found');

    // MOCK AI Summary generated based on their progress
    const aiSummary = `${student.user.firstName} is a highly dedicated professional with ${student.xp} XP points in the Grekam Academy. They have demonstrated mastery by passing ${student.QuizAttempt.length} rigorous assessments and earning ${student.Certificate.length} industry-recognized certificates. They are actively seeking new opportunities to apply their skills in a dynamic team environment.`;

    // MOCK AI generated skills based on their passed quizzes
    const skills = student.QuizAttempt.map(qa => qa.quiz.title.split(' ').pop() || 'Skill');
    const uniqueSkills = [...new Set(['React', 'UI/UX Design', 'TypeScript', ...skills])];

    return { 
      data: {
        ...student,
        aiSummary,
        aiSkills: uniqueSkills
      } 
    };
  });
}
