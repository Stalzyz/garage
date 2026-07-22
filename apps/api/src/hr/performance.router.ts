import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

const GoalSchema = z.object({
  employeeId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  targetDate: z.string().optional(),
  cycleId: z.string().optional()
});

const UpdateGoalSchema = z.object({
  progress: z.number().min(0).max(100).optional(),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "ACHIEVED", "MISSED"]).optional()
});

export default async function performanceRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /api/v1/hr/performance/cycles
  server.get('/cycles', async (req, reply) => {
    const cycles = await server.prisma.performanceCycle.findMany({
      include: {
        reviews: true,
        goals: true
      },
      orderBy: { startDate: 'desc' }
    });
    return { data: cycles };
  });

  // GET /api/v1/hr/performance/goals/:employeeId
  server.get('/goals/:employeeId', {
    schema: { params: z.object({ employeeId: z.string() }) }
  }, async (req, reply) => {
    const goals = await server.prisma.goal.findMany({
      where: { employeeId: req.params.employeeId },
      orderBy: { createdAt: 'desc' }
    });
    return { data: goals };
  });

  // POST /api/v1/hr/performance/goals
  server.post('/goals', async (req, reply) => {
    const body = GoalSchema.parse(req.body);
    const goal = await server.prisma.goal.create({
      data: {
        employeeId: body.employeeId,
        title: body.title,
        description: body.description,
        targetDate: body.targetDate ? new Date(body.targetDate) : undefined,
        cycleId: body.cycleId
      }
    });
    return reply.code(201).send(goal);
  });

  // PATCH /api/v1/hr/performance/goals/:id
  server.patch('/goals/:id', {
    schema: { params: z.object({ id: z.string() }) }
  }, async (req, reply) => {
    const body = UpdateGoalSchema.parse(req.body);
    const goal = await server.prisma.goal.update({
      where: { id: req.params.id },
      data: {
        ...(body.progress !== undefined && { progress: body.progress }),
        ...(body.status && { status: body.status })
      }
    });
    return goal;
  });
}
