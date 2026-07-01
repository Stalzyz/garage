import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export default async function attendanceRouter(app: FastifyInstance) {
  // ── POST /api/v1/academy/attendance/scan ───────────────────────────────
  app.post('/scan', async (req, reply) => {
    const schema = z.object({
      studentCode: z.string(),
      location: z.string().default('Main Campus')
    });
    const { studentCode, location } = schema.parse(req.body);

    const student = await app.prisma.student.findUnique({
      where: { studentCode },
      include: {
        user: { select: { firstName: true, lastName: true, avatarUrl: true } }
      }
    });

    if (!student) {
      return reply.code(404).send({ success: false, message: 'Invalid Student ID Card' });
    }

    // Check if already marked today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await app.prisma.studentAttendance.findFirst({
      where: {
        studentId: student.id,
        date: { gte: today }
      }
    });

    if (existing) {
      return { 
        success: true, 
        message: 'Already marked present today.',
        student: {
          name: `${student.user.firstName} ${student.user.lastName}`,
          avatar: student.user.avatarUrl,
          careerScore: student.careerScore,
          xp: student.xp
        },
        alreadyMarked: true
      };
    }

    // Mark present
    await app.prisma.studentAttendance.create({
      data: {
        studentId: student.id,
        date: new Date(),
        status: 'PRESENT',
        location,
        notes: `Scanned at ${location}`
      }
    });

    // Award 10 XP for attendance
    await app.prisma.student.update({
      where: { id: student.id },
      data: { xp: { increment: 10 } }
    });

    return {
      success: true,
      message: 'Attendance marked successfully!',
      student: {
        name: `${student.user.firstName} ${student.user.lastName}`,
        avatar: student.user.avatarUrl,
        careerScore: student.careerScore,
        xp: student.xp + 10
      },
      alreadyMarked: false
    };
  });
}
