import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const HeartbeatSchema = z.object({
  employeeId: z.string().min(1),
  activeMinutes: z.number().min(0).max(60),
  idleMinutes: z.number().min(0).max(60),
  keyboardStrokes: z.number().min(0),
  mouseClicks: z.number().min(0)
});

const ScreenshotSchema = z.object({
  employeeId: z.string().min(1),
  imageUrl: z.string().url(),
  notes: z.string().optional()
});

export default async function telemetryRouter(app: FastifyInstance) {
  
  // POST /api/v1/hr/telemetry/heartbeat
  app.post('/heartbeat', async (req, reply) => {
    const body = HeartbeatSchema.parse(req.body);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const telemetry = await app.prisma.employeeTelemetry.create({
      data: {
        employeeId: body.employeeId,
        date: today,
        activeMinutes: body.activeMinutes,
        idleMinutes: body.idleMinutes,
        keyboardStrokes: body.keyboardStrokes,
        mouseClicks: body.mouseClicks
      }
    });

    reply.code(201);
    return telemetry;
  });

  // POST /api/v1/hr/telemetry/screenshot
  app.post('/screenshot', async (req, reply) => {
    const body = ScreenshotSchema.parse(req.body);

    const screenshot = await app.prisma.screenshotLog.create({
      data: {
        employeeId: body.employeeId,
        imageUrl: body.imageUrl,
        notes: body.notes
      }
    });

    reply.code(201);
    return screenshot;
  });

  // GET /api/v1/hr/telemetry/report/:employeeId
  app.get('/report/:employeeId', async (req, reply) => {
    const { employeeId } = req.params as { employeeId: string };
    
    // Default to fetching today's telemetry
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [telemetryLogs, screenshots] = await Promise.all([
      app.prisma.employeeTelemetry.findMany({
        where: { employeeId, date: today },
        orderBy: { timestamp: 'asc' }
      }),
      app.prisma.screenshotLog.findMany({
        where: { employeeId, timestamp: { gte: today } },
        orderBy: { timestamp: 'desc' }
      })
    ]);

    // Aggregate daily stats
    const dailyStats = telemetryLogs.reduce((acc: any, log: any) => {
      acc.totalActive += log.activeMinutes;
      acc.totalIdle += log.idleMinutes;
      acc.totalKeystrokes += log.keyboardStrokes;
      acc.totalClicks += log.mouseClicks;
      return acc;
    }, { totalActive: 0, totalIdle: 0, totalKeystrokes: 0, totalClicks: 0 });

    return { 
      dailyStats,
      telemetryLogs,
      screenshots
    };
  });
}
