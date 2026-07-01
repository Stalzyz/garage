import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function attendanceRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // Telemetry Dashboard specific route
  server.get('/telemetry/:employeeId', {
    schema: {
      params: z.object({ employeeId: z.string() })
    }
  }, async (req, reply) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayRecord, recentLogs] = await Promise.all([
      server.prisma.attendance.findFirst({
        where: { employeeId: req.params.employeeId, date: today }
      }),
      server.prisma.attendance.findMany({
        where: { employeeId: req.params.employeeId },
        orderBy: { date: 'desc' },
        take: 3
      })
    ]);

    let loggedMinutes = 0;
    if (todayRecord && todayRecord.clockIn) {
      const end = todayRecord.clockOut || new Date();
      loggedMinutes = Math.floor((end.getTime() - todayRecord.clockIn.getTime()) / 60000);
      
      // Subtract break time
      if (todayRecord.breakStart && todayRecord.breakEnd) {
        const breakMins = Math.floor((todayRecord.breakEnd.getTime() - todayRecord.breakStart.getTime()) / 60000);
        loggedMinutes -= breakMins;
      }
    }

    const scheduledMinutes = 8 * 60; // Standard 8 hour shift
    const overtimeMinutes = Math.max(0, loggedMinutes - scheduledMinutes);

    return {
      activeShift: !!(todayRecord && !todayRecord.clockOut),
      onBreak: !!(todayRecord && todayRecord.breakStart && !todayRecord.breakEnd),
      clockInTime: todayRecord?.clockIn,
      telemetry: {
        scheduled: "09:00 - 17:00",
        loggedHours: `${Math.floor(loggedMinutes / 60).toString().padStart(2, '0')}:${(loggedMinutes % 60).toString().padStart(2, '0')}`,
        overtime: `${Math.floor(overtimeMinutes / 60).toString().padStart(2, '0')}:${(overtimeMinutes % 60).toString().padStart(2, '0')}`
      },
      recentLogs: recentLogs.map(log => {
        let durationStr = "In Progress";
        if (log.clockIn && log.clockOut) {
          let m = Math.floor((log.clockOut.getTime() - log.clockIn.getTime()) / 60000);
          if (log.breakStart && log.breakEnd) {
             m -= Math.floor((log.breakEnd.getTime() - log.breakStart.getTime()) / 60000);
          }
          durationStr = `${Math.floor(m / 60)}h ${m % 60}m`;
        }
        return {
          id: log.id,
          date: log.date.toISOString(),
          clockIn: log.clockIn?.toISOString(),
          clockOut: log.clockOut?.toISOString(),
          duration: durationStr
        }
      })
    };
  });

  server.get('/all', async (req, reply) => {
    const attendance = await server.prisma.attendance.findMany({
      include: { employee: { include: { user: true } } },
      orderBy: { date: 'desc' }
    });
    return { attendance };
  });

  server.get('/:employeeId', {
    schema: {
      params: z.object({ employeeId: z.string() }),
      querystring: z.object({
        startDate: z.string().optional(),
        endDate: z.string().optional()
      })
    }
  }, async (req, reply) => {
    const { startDate, endDate } = req.query;
    const where: any = { employeeId: req.params.employeeId };
    
    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const attendance = await server.prisma.attendance.findMany({
      where,
      orderBy: { date: 'desc' }
    });
    return { attendance };
  });

  server.post('/clock-in', {
    schema: {
      body: z.object({
        employeeId: z.string(),
        photoUrl: z.string().optional()
      })
    }
  }, async (req, reply) => {
    const { employeeId, photoUrl } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingRecord = await server.prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId, date: today } }
    });

    if (existingRecord?.clockIn) {
      return reply.status(400).send({ error: "Already clocked in for today" });
    }

    const record = await server.prisma.attendance.create({
      data: {
        employeeId,
        date: today,
        clockIn: new Date(),
        clockInPhotoUrl: photoUrl,
        status: "PRESENT"
      }
    });
    return reply.status(201).send(record);
  });

  server.post('/clock-out', {
    schema: {
      body: z.object({
        employeeId: z.string(),
        photoUrl: z.string().optional()
      })
    }
  }, async (req, reply) => {
    const { employeeId, photoUrl } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await server.prisma.attendance.updateMany({
      where: { employeeId, date: today },
      data: { clockOut: new Date(), clockOutPhotoUrl: photoUrl }
    });
    return reply.status(200).send({ success: true, updated: record.count });
  });

  server.post('/break-in', {
    schema: {
      body: z.object({ employeeId: z.string() })
    }
  }, async (req, reply) => {
    const { employeeId } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await server.prisma.attendance.updateMany({
      where: { employeeId, date: today },
      data: { breakStart: new Date() }
    });
    return reply.status(200).send({ success: true, updated: record.count });
  });

  server.post('/break-out', {
    schema: {
      body: z.object({ employeeId: z.string() })
    }
  }, async (req, reply) => {
    const { employeeId } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const record = await server.prisma.attendance.updateMany({
      where: { employeeId, date: today },
      data: { breakEnd: new Date() }
    });
    return reply.status(200).send({ success: true, updated: record.count });
  });

  server.put('/override/:id', {
    schema: {
      params: z.object({ id: z.string() }),
      body: z.object({
        clockIn: z.string().optional(),
        clockOut: z.string().optional(),
        breakStart: z.string().optional(),
        breakEnd: z.string().optional(),
        status: z.string().optional(),
        notes: z.string().optional()
      })
    }
  }, async (req, reply) => {
    const data: any = {};
    if (req.body.clockIn) data.clockIn = new Date(req.body.clockIn);
    if (req.body.clockOut) data.clockOut = new Date(req.body.clockOut);
    if (req.body.breakStart) data.breakStart = new Date(req.body.breakStart);
    if (req.body.breakEnd) data.breakEnd = new Date(req.body.breakEnd);
    if (req.body.status) data.status = req.body.status;
    if (req.body.notes) data.notes = req.body.notes;

    const record = await server.prisma.attendance.update({
      where: { id: req.params.id },
      data
    });
    return reply.status(200).send(record);
  });
}
