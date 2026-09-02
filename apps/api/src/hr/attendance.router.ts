import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

// Haversine formula to calculate distance between two coordinates in meters
function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Radius of Earth in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Automatically auto-close stale un-closed shifts from previous calendar days
async function autoCloseStaleShifts(prisma: any, employeeId: string, today: Date) {
  try {
    const staleRecords = await prisma.attendance.findMany({
      where: {
        employeeId,
        clockOut: null,
        date: { lt: today }
      }
    });

    for (const record of staleRecords) {
      const eodTime = new Date(record.date);
      eodTime.setHours(23, 59, 59, 999);

      await prisma.attendance.update({
        where: { id: record.id },
        data: {
          clockOut: eodTime,
          status: record.status === 'PRESENT' ? 'EOD_CLOSED' : record.status,
          notes: record.notes ? `${record.notes} (Auto-closed at EOD)` : 'Auto-closed at end of day due to missing clock-out'
        }
      });
    }
  } catch (err) {
    console.error('[AttendanceRouter] Failed to auto-close stale shifts:', err);
  }
}

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

    // Auto-close any stale open shifts from yesterday or before
    await autoCloseStaleShifts(server.prisma, req.params.employeeId, today);

    const [todayRecord, recentLogs, employeeShift] = await Promise.all([
      server.prisma.attendance.findFirst({
        where: { employeeId: req.params.employeeId, date: today },
        include: { shift: true }
      }),
      server.prisma.attendance.findMany({
        where: { employeeId: req.params.employeeId },
        orderBy: { date: 'desc' },
        take: 5
      }),
      server.prisma.employeeShift.findFirst({
        where: {
          employeeId: req.params.employeeId,
          startDate: { lte: today },
          OR: [{ endDate: null }, { endDate: { gte: today } }]
        },
        include: { shift: true },
        orderBy: { startDate: 'desc' }
      })
    ]);

    let loggedMinutes = 0;
    if (todayRecord && todayRecord.clockIn) {
      const end = todayRecord.clockOut || new Date();
      loggedMinutes = Math.floor((end.getTime() - todayRecord.clockIn.getTime()) / 60000);
      
      // Subtract break time (even if it's ongoing)
      if (todayRecord.breakStart) {
        const breakEnd = todayRecord.breakEnd || new Date();
        const breakMins = Math.floor((breakEnd.getTime() - todayRecord.breakStart.getTime()) / 60000);
        loggedMinutes = Math.max(0, loggedMinutes - breakMins);
      }
    }

    // Determine shift hours (custom assigned shift vs 8-hour default)
    const assignedShift = todayRecord?.shift || employeeShift?.shift;
    const minShiftHours = assignedShift?.minHours || 8.0;
    const scheduledMinutes = minShiftHours * 60;
    const overtimeMinutes = Math.max(0, loggedMinutes - scheduledMinutes);

    const shiftTimingsStr = assignedShift
      ? (assignedShift.type === 'OPEN' ? 'Flexible / Open' : `${assignedShift.startTime} - ${assignedShift.endTime}`)
      : "09:00 - 17:00";

    return {
      activeShift: !!(todayRecord && !todayRecord.clockOut),
      onBreak: !!(todayRecord && todayRecord.breakStart && !todayRecord.breakEnd),
      clockInTime: todayRecord?.clockIn,
      telemetry: {
        scheduled: shiftTimingsStr,
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
          durationStr = `${Math.floor(m / 60)}h ${Math.max(0, m % 60)}m`;
        }
        return {
          id: log.id,
          date: log.date.toISOString(),
          clockIn: log.clockIn?.toISOString(),
          clockOut: log.clockOut?.toISOString(),
          status: log.status,
          duration: durationStr
        };
      })
    };
  });

  // GET /all
  server.get('/all', async (req, reply) => {
    const attendance = await server.prisma.attendance.findMany({
      include: { employee: { include: { user: true } }, shift: true },
      orderBy: { date: 'desc' }
    });
    return { attendance };
  });

  // GET /:employeeId
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
      include: { shift: true },
      orderBy: { date: 'desc' }
    });
    return { attendance };
  });

function parseTimeStringToDate(baseDate: Date, timeStr: string): Date {
  if (!timeStr) return new Date(baseDate);
  if (timeStr.includes('T') || timeStr.includes('-')) {
    const parsed = new Date(timeStr);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  const date = new Date(baseDate);
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3] ? match[3].toUpperCase() : null;
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    date.setHours(hours, minutes, 0, 0);
    return date;
  }
  return date;
}

  // POST / (Manual Entry)
  server.post('/', {
    schema: {
      body: z.object({
        employeeId: z.string(),
        status: z.string().default("PRESENT"),
        checkIn: z.string().optional(),
        checkOut: z.string().optional(),
        date: z.string().optional(),
        notes: z.string().optional()
      })
    }
  }, async (req, reply) => {
    const { employeeId, status, checkIn, checkOut, date, notes } = req.body;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    let clockInDate: Date | undefined = checkIn ? parseTimeStringToDate(targetDate, checkIn) : new Date();
    let clockOutDate: Date | undefined = checkOut ? parseTimeStringToDate(targetDate, checkOut) : undefined;

    const record = await server.prisma.attendance.upsert({
      where: { employeeId_date: { employeeId, date: targetDate } },
      create: {
        employeeId,
        date: targetDate,
        status,
        clockIn: clockInDate,
        clockOut: clockOutDate,
        notes: notes || "Manual entry marked by HR",
        isRegularized: true
      },
      update: {
        status,
        ...(clockInDate ? { clockIn: clockInDate } : {}),
        ...(clockOutDate ? { clockOut: clockOutDate } : {}),
        notes: notes || "Manual entry updated by HR",
        isRegularized: true
      }
    });

    return reply.status(200).send(record);
  });

  // POST /clock-in
  server.post('/clock-in', {
    schema: {
      body: z.object({
        employeeId: z.string(),
        photoUrl: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional()
      })
    }
  }, async (req, reply) => {
    const { employeeId, photoUrl, latitude, longitude } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Auto-close any stale un-closed shifts from previous calendar days
    await autoCloseStaleShifts(server.prisma, employeeId, today);

    // 2. Check if already clocked in today
    const existingRecord = await server.prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId, date: today } }
    });

    if (existingRecord?.clockIn) {
      return reply.status(400).send({ error: "Already clocked in for today" });
    }

    // 3. Geofence Distance Check
    let isGeofenced = false;
    if (latitude && longitude) {
      const activeGeofences = await server.prisma.geofence.findMany({ where: { isActive: true } });
      for (const gf of activeGeofences) {
        const dist = haversineMeters(latitude, longitude, gf.latitude, gf.longitude);
        if (dist <= gf.radius) {
          isGeofenced = true;
          break;
        }
      }
    }

    // 4. Shift & Late Arrival Detection
    const employeeShift = await server.prisma.employeeShift.findFirst({
      where: {
        employeeId,
        startDate: { lte: today },
        OR: [{ endDate: null }, { endDate: { gte: today } }]
      },
      include: { shift: true },
      orderBy: { startDate: 'desc' }
    });

    const shift = employeeShift?.shift;
    let computedStatus = "PRESENT";

    if (shift && shift.startTime && shift.type !== "OPEN") {
      const [shiftH, shiftM] = shift.startTime.split(':').map(Number);
      const shiftStartTime = new Date(today);
      shiftStartTime.setHours(shiftH, shiftM, 0, 0);

      // Default grace period of 15 mins
      const gracePeriodMs = 15 * 60 * 1000;
      if (new Date().getTime() > (shiftStartTime.getTime() + gracePeriodMs)) {
        computedStatus = "LATE";
      }
    }

    let record;
    if (existingRecord) {
      record = await server.prisma.attendance.update({
        where: { id: existingRecord.id },
        data: {
          clockIn: new Date(),
          clockInPhotoUrl: photoUrl,
          latitude,
          longitude,
          isGeofenced,
          shiftId: shift?.id || null,
          status: computedStatus
        }
      });
    } else {
      record = await server.prisma.attendance.create({
        data: {
          employeeId,
          date: today,
          clockIn: new Date(),
          clockInPhotoUrl: photoUrl,
          latitude,
          longitude,
          isGeofenced,
          shiftId: shift?.id || null,
          status: computedStatus
        }
      });
    }

    return reply.status(201).send(record);
  });

  // POST /clock-out
  server.post('/clock-out', {
    schema: {
      body: z.object({
        employeeId: z.string(),
        photoUrl: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional()
      })
    }
  }, async (req, reply) => {
    const { employeeId, photoUrl, latitude, longitude } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find active shift specifically for today or current open record
    const recordToClose = await server.prisma.attendance.findFirst({
      where: { employeeId, clockOut: null },
      orderBy: { date: 'desc' }
    });

    if (!recordToClose) {
      return reply.status(400).send({ error: "No active clock-in session found to clock out" });
    }

    // Geofence check on clock out
    let isGeofenced = recordToClose.isGeofenced;
    if (latitude && longitude) {
      const activeGeofences = await server.prisma.geofence.findMany({ where: { isActive: true } });
      for (const gf of activeGeofences) {
        const dist = haversineMeters(latitude, longitude, gf.latitude, gf.longitude);
        if (dist <= gf.radius) {
          isGeofenced = true;
          break;
        }
      }
    }

    const updated = await server.prisma.attendance.update({
      where: { id: recordToClose.id },
      data: {
        clockOut: new Date(),
        clockOutPhotoUrl: photoUrl,
        ...(latitude ? { latitude } : {}),
        ...(longitude ? { longitude } : {}),
        ...(isGeofenced !== undefined ? { isGeofenced } : {})
      }
    });

    return reply.status(200).send({ success: true, record: updated });
  });

  // POST /break-in
  server.post('/break-in', {
    schema: {
      body: z.object({ employeeId: z.string() })
    }
  }, async (req, reply) => {
    const { employeeId } = req.body;
    const activeRecord = await server.prisma.attendance.findFirst({
      where: { employeeId, clockOut: null },
      orderBy: { date: 'desc' }
    });

    if (!activeRecord) {
      return reply.status(400).send({ error: "Cannot start break: Employee is not clocked in" });
    }

    const record = await server.prisma.attendance.update({
      where: { id: activeRecord.id },
      data: { breakStart: new Date(), breakEnd: null }
    });

    return reply.status(200).send({ success: true, record });
  });

  // POST /break-out
  server.post('/break-out', {
    schema: {
      body: z.object({ employeeId: z.string() })
    }
  }, async (req, reply) => {
    const { employeeId } = req.body;
    const activeRecord = await server.prisma.attendance.findFirst({
      where: { employeeId, clockOut: null },
      orderBy: { date: 'desc' }
    });

    if (!activeRecord || !activeRecord.breakStart) {
      return reply.status(400).send({ error: "Cannot end break: No active break session found" });
    }

    const record = await server.prisma.attendance.update({
      where: { id: activeRecord.id },
      data: { breakEnd: new Date() }
    });

    return reply.status(200).send({ success: true, record });
  });

  // PUT /override/:id
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
