import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { EventBus, SystemEvents } from '../automations/event-bus';
import { AIGradingService } from './ai-grading.service';

export default async function assignmentsRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get('/', {
    schema: {
      querystring: z.object({
        studentId: z.string().optional()
      })
    }
  }, async (req, reply) => {
    const { studentId } = req.query as { studentId?: string };

    const assignments = await server.prisma.assignment.findMany({
      include: {
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
        },
        submissions: studentId ? {
          where: { studentId }
        } : true
      }
    });
    return { assignments };
  });

  server.post('/submit', {
    schema: {
      body: z.object({
        assignmentId: z.string(),
        studentId: z.string(),
        submissionUrl: z.string().url()
      })
    }
  }, async (req, reply) => {
    const { assignmentId, studentId, submissionUrl } = req.body;

    const submission = await server.prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        studentId,
        linkUrl: submissionUrl,
        status: 'SUBMITTED'
      }
    });

    // Fetch assignment details for context
    const assignment = await server.prisma.assignment.findUnique({
      where: { id: assignmentId }
    });

    // Kick off background AI Grading process
    setImmediate(async () => {
      try {
        if (!assignment) throw new Error("Assignment not found");

        const result = await AIGradingService.evaluateSubmission(
          assignment.title,
          assignment.brief,
          submissionUrl,
          assignment.rubric
        );

        await server.prisma.assignmentSubmission.update({
          where: { id: submission.id },
          data: {
            status: 'GRADED',
            grade: result.grade,
            feedback: result.feedback,
            gradedAt: new Date(),
            gradedBy: "Matrix AI"
          }
        });

        const student = await server.prisma.student.findUnique({
          where: { id: studentId },
          include: { user: true }
        });

        if (student) {
          EventBus.emit(SystemEvents.ASSIGNMENT_GRADED, {
            studentId: student.id,
            studentName: `${student.user.firstName} ${student.user.lastName}`,
            studentEmail: student.user.email,
            courseName: assignment.title,
            score: result.grade
          });
        }

        app.log.info(`[Matrix AI] Graded submission ${submission.id} with score ${result.grade}`);
        
        // Notify via WebSocket if possible
        (app as any).broadcast?.('NOTIFICATION', {
          title: "Assignment Graded",
          message: `Matrix AI has graded your submission for "${assignment.title}". Score: ${result.grade}/100`,
          userId: student?.user.id
        });

      } catch (err) {
        app.log.error(err, "Matrix AI Evaluation failed");
      }
    });

    return reply.status(201).send({ 
      success: true, 
      submission,
      message: "Protocol submitted. Matrix AI evaluation initiated."
    });
  });

  server.get('/student/:studentId', {
    schema: {
      params: z.object({ studentId: z.string() })
    }
  }, async (req, reply) => {
    const submissions = await server.prisma.assignmentSubmission.findMany({
      where: { studentId: req.params.studentId },
      include: { assignment: true },
      orderBy: { submittedAt: 'desc' }
    });
    return { submissions };
  });

  server.get('/mock-context', async (req, reply) => {
    let student = await server.prisma.student.findFirst();
    let assignment = await server.prisma.assignment.findFirst();
    return { studentId: student?.id, assignmentId: assignment?.id, assignment };
  });

  server.patch('/submissions/:id', {
    schema: {
      params: z.object({ id: z.string() }),
      body: z.object({
        grade: z.number().optional(),
        feedback: z.string().optional(),
        status: z.enum(['GRADED', 'RESUBMIT_REQUESTED', 'FINAL']).optional()
      })
    }
  }, async (req, reply) => {
    const submission = await server.prisma.assignmentSubmission.update({
      where: { id: req.params.id },
      data: req.body
    });
    return { submission };
  });
}
