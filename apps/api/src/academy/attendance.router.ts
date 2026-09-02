import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export default async function attendanceRouter(app: FastifyInstance) {
  // ── GET /api/v1/academy/attendance ───────────────────────────────
  app.get('/', async (req, reply) => {
    const { batchId, date, search } = req.query as { batchId?: string; date?: string; search?: string };
    
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const studentWhere: any = {};
    if (batchId) {
      studentWhere.enrollments = { some: { batchId } };
    }
    if (search) {
      studentWhere.OR = [
        { studentCode: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const students = await app.prisma.student.findMany({
      where: studentWhere,
      include: {
        user: { select: { firstName: true, lastName: true, avatarUrl: true } },
        enrollments: {
          include: { batch: { select: { id: true, name: true } } },
          take: 1
        },
        attendanceRecords: {
          orderBy: { date: 'desc' },
          take: 30
        }
      }
    });

    const logs = students.map((student: any) => {
      const todayRecord = student.attendanceRecords.find((r: any) => {
        const rDate = new Date(r.date);
        rDate.setHours(0, 0, 0, 0);
        return rDate.getTime() === targetDate.getTime();
      });

      const totalLogs = student.attendanceRecords.length;
      const presentLogs = student.attendanceRecords.filter((r: any) => r.status === 'PRESENT' || r.status === 'LATE').length;
      const attendanceRate = totalLogs > 0 ? Math.round((presentLogs / totalLogs) * 100) : 100;
      const primaryEnrollment = student.enrollments?.[0];

      return {
        id: student.id,
        studentCode: student.studentCode,
        name: `${student.user?.firstName || 'Student'} ${student.user?.lastName || ''}`.trim(),
        avatar: student.user?.avatarUrl,
        batch: primaryEnrollment?.batch?.name || 'Unassigned',
        batchId: primaryEnrollment?.batchId,
        status: todayRecord ? todayRecord.status : 'ABSENT',
        checkIn: todayRecord ? new Date(todayRecord.scannedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
        attendanceRate: `${attendanceRate}%`,
        attendanceRateNum: attendanceRate
      };
    });

    return { success: true, logs };
  });

  // ── POST /api/v1/academy/attendance/batch-mark ──────────────────────────
  app.post('/batch-mark', async (req, reply) => {
    const schema = z.object({
      records: z.array(z.object({
        studentId: z.string(),
        status: z.enum(['PRESENT', 'ABSENT', 'LATE']),
        notes: z.string().optional()
      }))
    });
    const { records } = schema.parse(req.body);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const results: any[] = [];
    for (const record of records) {
      const existing = await app.prisma.studentAttendance.findUnique({
        where: { studentId_date: { studentId: record.studentId, date: today } }
      });

      if (existing) {
        const updated = await app.prisma.studentAttendance.update({
          where: { id: existing.id },
          data: { status: record.status, notes: record.notes }
        });
        results.push(updated);
      } else {
        const created = await app.prisma.studentAttendance.create({
          data: {
            studentId: record.studentId,
            date: today,
            status: record.status,
            notes: record.notes || 'Marked during live roll call'
          }
        });
        results.push(created);
      }
    }

    return { success: true, count: results.length, records: results };
  });

  // ── POST /api/v1/academy/attendance/mark ──────────────────────────────
  app.post('/mark', async (req, reply) => {
    const schema = z.object({
      studentId: z.string(),
      status: z.enum(['PRESENT', 'ABSENT', 'LATE']),
      date: z.string().optional(),
      notes: z.string().optional()
    });
    const { studentId, status, date, notes } = schema.parse(req.body);

    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const result = await app.prisma.studentAttendance.upsert({
      where: { studentId_date: { studentId, date: targetDate } },
      create: {
        studentId,
        date: targetDate,
        status,
        notes: notes || 'Manually marked by educator'
      },
      update: {
        status,
        notes: notes || 'Manually updated by educator'
      }
    });

    return { success: true, record: result };
  });

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

