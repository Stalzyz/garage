import { FastifyInstance } from 'fastify';
import { z } from 'zod';

// ─────────────────────────────────────────────────────────────────────────────
// Career Readiness Score Formula
// Attendance 15% | Assignments 15% | Projects 20% | Skills 20%
// Communication 10% | Portfolio 10% | Interview Prep 10%
// ─────────────────────────────────────────────────────────────────────────────
async function computeCareerScore(prisma: any, studentId: string): Promise<number> {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      enrollments: {
        include: {
          installments: true,
          batch: {
            include: { sessions: { include: { attendances: { where: { studentId } } } } }
          }
        }
      },
      portfolioProfile: { include: { projects: true } },
      badges: true,
      skills: true,
      Certificate: true,
    }
  });

  if (!student) return 0;

  // 1. Attendance (15%) — across all sessions
  let attendanceScore = 0;
  const allSessions = student.enrollments.flatMap((e: any) => e.batch.sessions);
  if (allSessions.length > 0) {
    const present = allSessions.filter((s: any) => s.attendances.some((a: any) => a.status === 'PRESENT')).length;
    attendanceScore = Math.round((present / allSessions.length) * 15);
  } else {
    attendanceScore = 8; // Default neutral if no sessions yet
  }

  // 2. Skills (20%) — average rating across all skills
  let skillScore = 0;
  if (student.skills.length > 0) {
    const avgRating = student.skills.reduce((s: number, sk: any) => s + sk.rating, 0) / student.skills.length;
    skillScore = Math.round((avgRating / 5) * 20);
  }

  // 3. Portfolio (10%) — based on projects submitted
  const projectCount = student.portfolioProfile?.projects?.length || 0;
  const portfolioScore = Math.min(10, Math.round(projectCount * 2.5));

  // 4. Badges as proxy for Assignments(15%), Projects(20%), Communication(10%), Interview(10%)
  const badgeCount = student.badges.length;
  const certCount = student.Certificate.length;

  const assignmentScore = Math.min(15, badgeCount * 3);
  const projectScore = Math.min(20, certCount * 5 + badgeCount * 2);
  const commScore = Math.min(10, Math.round(student.xp / 200));
  const interviewScore = Math.min(10, certCount * 3);

  const total = attendanceScore + skillScore + portfolioScore + assignmentScore + projectScore + commScore + interviewScore;
  return Math.min(100, total);
}

export default async function passportRouter(app: FastifyInstance) {

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/v1/academy/passport/:studentId — Full Digital Passport
  // ─────────────────────────────────────────────────────────────────────────
  app.get('/passport/:studentId', async (req, reply) => {
    const { studentId } = req.params as { studentId: string };

    const student = await app.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } },
        enrollments: {
          include: { batch: { include: { course: true } } }
        },
        skills: { orderBy: { rating: 'desc' } },
        badges: { include: { badge: true } },
        Certificate: { include: { course: true } },
        portfolioProfile: { include: { projects: true } },
        application: true,
      }
    });

    if (!student) return reply.notFound('Student not found');

    // Compute career score fresh
    const careerScore = await computeCareerScore(app.prisma, studentId);

    // Save it back if changed
    if (student.careerScore !== careerScore) {
      await app.prisma.student.update({ where: { id: studentId }, data: { careerScore } });
    }

    return { ...student, careerScore };
  });

  // ─────────────────────────────────────────────────────────────────────────
  // PATCH /api/v1/academy/passport/:studentId — Update profile (admin/self)
  // ─────────────────────────────────────────────────────────────────────────
  app.patch('/passport/:studentId', async (req, reply) => {
    const { studentId } = req.params as { studentId: string };
    const schema = z.object({
      bloodGroup: z.string().optional(),
      emergencyContact: z.string().optional(), // JSON string
      address: z.string().optional(),
      parentName: z.string().optional(),
      parentPhone: z.string().optional(),
      gender: z.string().optional(),
      college: z.string().optional(),
    });
    const body = schema.parse(req.body);
    const student = await app.prisma.student.update({ where: { id: studentId }, data: body });
    return student;
  });

  // ─────────────────────────────────────────────────────────────────────────
  // GET /api/v1/academy/passport/:studentId/skills — Get skill matrix
  // ─────────────────────────────────────────────────────────────────────────
  app.get('/passport/:studentId/skills', async (req, reply) => {
    const { studentId } = req.params as { studentId: string };
    const skills = await app.prisma.skillMatrix.findMany({
      where: { studentId },
      orderBy: [{ category: 'asc' }, { rating: 'desc' }]
    });
    return skills;
  });

  // ─────────────────────────────────────────────────────────────────────────
  // POST /api/v1/academy/passport/:studentId/skills — Upsert a skill rating
  // ─────────────────────────────────────────────────────────────────────────
  app.post('/passport/:studentId/skills', async (req, reply) => {
    const { studentId } = req.params as { studentId: string };
    const schema = z.object({
      skillName: z.string().min(1),
      category: z.enum(['TECHNICAL', 'SOFT', 'TOOL', 'DOMAIN']),
      rating: z.number().min(0).max(5),
      endorsedBy: z.string().optional(),
      notes: z.string().optional(),
    });
    const body = schema.parse(req.body);

    const skill = await app.prisma.skillMatrix.upsert({
      where: { studentId_skillName: { studentId, skillName: body.skillName } },
      update: { rating: body.rating, endorsedBy: body.endorsedBy, notes: body.notes, category: body.category },
      create: { studentId, ...body }
    });

    // Recalculate career score
    const newScore = await computeCareerScore(app.prisma, studentId);
    await app.prisma.student.update({ where: { id: studentId }, data: { careerScore: newScore } });

    reply.code(201);
    return { skill, careerScore: newScore };
  });

  // ─────────────────────────────────────────────────────────────────────────
  // DELETE /api/v1/academy/passport/:studentId/skills/:skillId
  // ─────────────────────────────────────────────────────────────────────────
  app.delete('/passport/:studentId/skills/:skillId', async (req, reply) => {
    const { skillId } = req.params as { studentId: string; skillId: string };
    await app.prisma.skillMatrix.delete({ where: { id: skillId } });
    reply.code(204).send();
  });
}
