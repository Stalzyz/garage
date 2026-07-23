import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export default async function quizzesRouter(app: FastifyInstance) {
  // GET /api/v1/lms/quizzes
  app.get('/', async (req, reply) => {
    const quizzes = await app.prisma.quiz.findMany({
      include: {
        _count: {
          select: { questions: true, attempts: true }
        },
        lesson: {
          include: {
            module: {
              include: {
                lmsCourse: {
                  include: { course: true }
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { data: quizzes };
  });
  // GET /api/v1/lms/quizzes/:id
  app.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    
    const quiz = await app.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: true,
      }
    });

    if (!quiz) return reply.notFound('Quiz not found');
    return { data: quiz };
  });

  // POST /api/v1/lms/quizzes/:id/submit
  app.post('/:id/submit', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { studentId, answers } = req.body as { studentId: string; answers: Record<string, number> };

    const quiz = await app.prisma.quiz.findUnique({
      where: { id },
      include: { questions: true }
    });

    if (!quiz) return reply.notFound('Quiz not found');

    // Calculate score
    let correctCount = 0;
    quiz.questions.forEach(q => {
      if (answers[q.id] === q.correctOption) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    // Save attempt
    const attempt = await app.prisma.quizAttempt.create({
      data: {
        quizId: id,
        studentId,
        score,
        passed
      }
    });

    // Gamification: Award XP based on score
    const student = await app.prisma.student.findUnique({ where: { id: studentId } });
    if (student && passed) {
      // e.g., +20 XP for passing
      await app.prisma.student.update({
        where: { id: student.id },
        data: { xp: { increment: 20 } }
      });
    }

    return { 
      success: true, 
      score, 
      passed,
      earnedXp: passed ? 20 : 0,
      attemptId: attempt.id
    };
  });

  // PATCH /api/v1/lms/quizzes/:id
  app.patch('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const schema = z.object({
      title: z.string().optional(),
      passingScore: z.number().optional(),
    });
    const body = schema.parse(req.body);

    const updated = await app.prisma.quiz.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.passingScore !== undefined && { passingScore: body.passingScore }),
      }
    });

    return { data: updated };
  });
}
