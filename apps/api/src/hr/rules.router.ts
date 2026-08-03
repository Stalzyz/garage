import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function rulesRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /overtime
  server.get('/overtime', async (req, reply) => {
    let rule = await server.prisma.overtimeRule.findFirst();
    if (!rule) {
      // Seed default rule
      rule = await server.prisma.overtimeRule.create({
        data: {
          minHoursForOT: 8.0,
          otMultiplier: 1.5,
          gracePeriodMins: 15,
          isEodAutoCloseEnabled: false,
          eodAutoCloseTime: "23:59"
        }
      });
    }
    return { data: rule };
  });

  // POST /overtime
  server.post('/overtime', {
    schema: {
      body: z.object({
        minHoursForOT: z.number().default(8.0),
        otMultiplier: z.number().default(1.5),
        gracePeriodMins: z.number().default(15),
        isEodAutoCloseEnabled: z.boolean().default(false),
        eodAutoCloseTime: z.string().default("23:59")
      })
    }
  }, async (req, reply) => {
    const existing = await server.prisma.overtimeRule.findFirst();
    if (existing) {
      const updated = await server.prisma.overtimeRule.update({
        where: { id: existing.id },
        data: req.body
      });
      return updated;
    } else {
      const created = await server.prisma.overtimeRule.create({
        data: req.body
      });
      return created;
    }
  });

  // GET /scheduler
  server.get('/scheduler', async (req, reply) => {
    const schedulers = await server.prisma.reportScheduler.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { data: schedulers };
  });

  // POST /scheduler
  server.post('/scheduler', {
    schema: {
      body: z.object({
        name: z.string(),
        type: z.enum(['ATTENDANCE', 'TELEMETRY', 'PAYROLL']),
        frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
        emailRecipients: z.string(),
        time: z.string().default('08:00'),
        isActive: z.boolean().default(true)
      })
    }
  }, async (req, reply) => {
    const scheduler = await server.prisma.reportScheduler.create({
      data: req.body
    });
    return reply.status(201).send(scheduler);
  });

  // PUT /scheduler/:id
  server.put('/scheduler/:id', {
    schema: {
      params: z.object({ id: z.string() }),
      body: z.object({
        name: z.string(),
        type: z.enum(['ATTENDANCE', 'TELEMETRY', 'PAYROLL']),
        frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
        emailRecipients: z.string(),
        time: z.string(),
        isActive: z.boolean()
      })
    }
  }, async (req, reply) => {
    const { id } = req.params;
    const scheduler = await server.prisma.reportScheduler.update({
      where: { id },
      data: req.body
    });
    return scheduler;
  });

  // DELETE /scheduler/:id
  server.delete('/scheduler/:id', {
    schema: {
      params: z.object({ id: z.string() })
    }
  }, async (req, reply) => {
    const { id } = req.params;
    await server.prisma.reportScheduler.delete({
      where: { id }
    });
    return { success: true };
  });
}
