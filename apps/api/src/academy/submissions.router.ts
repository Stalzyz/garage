import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { EventBus, SystemEvents } from '../automations/event-bus';

export default async function submissionsRouter(app: FastifyInstance) {

  // ───────────────────────────────────────────────────────────────────────────
  // GET /api/v1/academy/submissions?assignmentId=&studentId=
  // List submissions with version + annotation counts
  // ───────────────────────────────────────────────────────────────────────────
  app.get('/submissions', async (req, reply) => {
    const { assignmentId, studentId, status } = req.query as any;
    const where: any = {};
    if (assignmentId) where.assignmentId = assignmentId;
    if (studentId)    where.studentId    = studentId;
    if (status)       where.status       = status;

    const submissions = await app.prisma.assignmentSubmission.findMany({
      where,
      include: {
        assignment: { select: { title: true, maxScore: true } },
        versions:   { orderBy: { version: 'desc' }, take: 1 },
        annotations: { where: { resolved: false } },
        _count: { select: { versions: true, annotations: true } }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return submissions;
  });

  // ───────────────────────────────────────────────────────────────────────────
  // GET /api/v1/academy/submissions/:id — Full submission detail
  // ───────────────────────────────────────────────────────────────────────────
  app.get('/submissions/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const submission = await app.prisma.assignmentSubmission.findUnique({
      where: { id },
      include: {
        assignment: true,
        versions:   { orderBy: { version: 'asc' } },
        annotations: { orderBy: { createdAt: 'asc' } }
      }
    });
    if (!submission) return reply.notFound('Submission not found');
    return submission;
  });

  // ───────────────────────────────────────────────────────────────────────────
  // POST /api/v1/academy/submissions — Student creates or re-submits (new version)
  // ───────────────────────────────────────────────────────────────────────────
  app.post('/submissions', async (req, reply) => {
    const schema = z.object({
      assignmentId: z.string(),
      studentId:    z.string(),
      fileUrls:     z.array(z.string()).optional().default([]),
      linkUrl:      z.string().optional(),
      note:         z.string().optional(), // What changed in this version
    });
    const body = schema.parse(req.body);

    // Check for existing submission (upsert pattern)
    const existing = await app.prisma.assignmentSubmission.findFirst({
      where: { assignmentId: body.assignmentId, studentId: body.studentId },
      include: { _count: { select: { versions: true } } }
    });

    if (existing) {
      // New version of an existing submission
      const newVersion = (existing._count.versions || 0) + 1;

      await app.prisma.submissionVersion.create({
        data: {
          submissionId: existing.id,
          version:      newVersion,
          fileUrls:     body.fileUrls,
          linkUrl:      body.linkUrl,
          note:         body.note,
        }
      });

      const updated = await app.prisma.assignmentSubmission.update({
        where: { id: existing.id },
        data: {
          fileUrls:     body.fileUrls,
          linkUrl:      body.linkUrl,
          status:       'SUBMITTED',
          versionCount: newVersion,
          updatedAt:    new Date()
        }
      });

      reply.code(200);
      return { ...updated, isNewVersion: true, version: newVersion };
    } else {
      // First submission — create record + version 1
      const submission = await app.prisma.assignmentSubmission.create({
        data: {
          assignmentId: body.assignmentId,
          studentId:    body.studentId,
          fileUrls:     body.fileUrls,
          linkUrl:      body.linkUrl,
          status:       'SUBMITTED',
          versionCount: 1,
        }
      });

      await app.prisma.submissionVersion.create({
        data: {
          submissionId: submission.id,
          version:      1,
          fileUrls:     body.fileUrls,
          linkUrl:      body.linkUrl,
          note:         body.note || 'Initial submission',
        }
      });

      reply.code(201);
      return { ...submission, isNewVersion: false, version: 1 };
    }
  });

  // ───────────────────────────────────────────────────────────────────────────
  // PATCH /api/v1/academy/submissions/:id/review — Mentor reviews + sets status
  // ───────────────────────────────────────────────────────────────────────────
  app.patch('/submissions/:id/review', async (req, reply) => {
    const { id } = req.params as { id: string };
    const schema = z.object({
      status:   z.enum(['UNDER_REVIEW', 'GRADED', 'RESUBMIT_REQUESTED', 'APPROVED']),
      grade:    z.number().min(0).max(100).optional(),
      feedback: z.string().optional(),
      gradedBy: z.string().optional(),
    });
    const body = schema.parse(req.body);

    const submission = await app.prisma.assignmentSubmission.update({
      where: { id },
      data: {
        status:   body.status,
        grade:    body.grade,
        feedback: body.feedback,
        gradedBy: body.gradedBy,
        gradedAt: ['GRADED', 'APPROVED'].includes(body.status) ? new Date() : undefined,
      },
      include: {
        assignment: true,
      }
    });

    // Auto-push to portfolio when APPROVED
    if (body.status === 'APPROVED' && !submission.pushedToPortfolio) {
      // Find the student's portfolio
      const student = await app.prisma.student.findFirst({ where: { id: submission.studentId } });
      if (student) {
        let portfolio = await app.prisma.studentPortfolio.findUnique({ where: { studentId: student.id } });
        if (!portfolio) {
          portfolio = await app.prisma.studentPortfolio.create({
            data: { studentId: student.id, bio: '' }
          });
        }

        await app.prisma.portfolioProject.create({
          data: {
            portfolioId:  portfolio.id,
            title:        submission.assignment.title,
            description:  submission.feedback || 'Assignment approved by mentor',
            mediaUrls:    submission.fileUrls,
            projectUrl:   submission.linkUrl,
            category:     'ASSIGNMENT',
          }
        });

        await app.prisma.assignmentSubmission.update({
          where: { id },
          data: { pushedToPortfolio: true }
        });

        // Recalculate career score
        const newScore = await recalcCareerScore(app.prisma, student.id);
        await app.prisma.student.update({ where: { id: student.id }, data: { careerScore: newScore } });
      }
    }

    return submission;
  });

  // ───────────────────────────────────────────────────────────────────────────
  // POST /api/v1/academy/submissions/:id/annotate — Mentor adds inline note
  // ───────────────────────────────────────────────────────────────────────────
  app.post('/submissions/:id/annotate', async (req, reply) => {
    const { id } = req.params as { id: string };
    const schema = z.object({
      mentorId: z.string(),
      content:  z.string().min(1),
      position: z.string().optional(), // JSON: {x,y,page}
    });
    const body = schema.parse(req.body);

    const annotation = await app.prisma.mentorAnnotation.create({
      data: { submissionId: id, ...body }
    });

    reply.code(201);
    return annotation;
  });

  // ───────────────────────────────────────────────────────────────────────────
  // PATCH /api/v1/academy/submissions/annotations/:annotationId/resolve
  // ───────────────────────────────────────────────────────────────────────────
  app.patch('/submissions/annotations/:annotationId/resolve', async (req, reply) => {
    const { annotationId } = req.params as { annotationId: string };
    const annotation = await app.prisma.mentorAnnotation.update({
      where: { id: annotationId },
      data:  { resolved: true }
    });
    return annotation;
  });

  // ───────────────────────────────────────────────────────────────────────────
  // GET /api/v1/academy/submissions/:id/versions — Full version history
  // ───────────────────────────────────────────────────────────────────────────
  app.get('/submissions/:id/versions', async (req, reply) => {
    const { id } = req.params as { id: string };
    const versions = await app.prisma.submissionVersion.findMany({
      where:   { submissionId: id },
      orderBy: { version: 'asc' }
    });
    return versions;
  });
}

// Minimal career score recalc inline (to avoid circular import)
async function recalcCareerScore(prisma: any, studentId: string): Promise<number> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: { badges: true, skills: true, Certificate: true, portfolioProfile: { include: { projects: true } } }
  });
  if (!student) return 0;
  const skillAvg = student.skills.length
    ? student.skills.reduce((s: number, sk: any) => s + sk.rating, 0) / student.skills.length
    : 0;
  const projectCount = student.portfolioProfile?.projects?.length || 0;
  return Math.min(100,
    8 + // attendance neutral
    Math.min(20, Math.round((skillAvg / 5) * 20)) +
    Math.min(10, Math.round(projectCount * 2.5)) +
    Math.min(15, student.badges.length * 3) +
    Math.min(20, student.Certificate.length * 5) +
    Math.min(10, Math.round(student.xp / 200))
  );
}
