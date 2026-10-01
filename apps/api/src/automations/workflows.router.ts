import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { 
  runStagnantTaskEscalation, 
  runLeadSlaReassignment, 
  runMorningKickoffAgenda, 
  runEodRollupDigest 
} from './cron';

export default async function workflowsRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // POST /api/v1/automations/workflows/run-autonomous-sync — Run all 4 autonomous engines on demand
  server.post('/run-autonomous-sync', async (req, reply) => {
    const [tasks, leads, kickoff, rollup] = await Promise.all([
      runStagnantTaskEscalation(),
      runLeadSlaReassignment(),
      runMorningKickoffAgenda(),
      runEodRollupDigest(),
    ]);

    return {
      success: true,
      message: 'Autonomous operations engines executed successfully.',
      timestamp: new Date().toISOString(),
      results: {
        stagnantTasks: tasks,
        leadSla: leads,
        morningKickoff: kickoff,
        eodRollup: rollup
      }
    };
  });

  server.get('/', async (req, reply) => {
    const workflows = await server.prisma.workflow.findMany({
      include: {
        steps: { orderBy: { stepOrder: 'asc' } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { workflows };
  });

  server.post('/', {
    schema: {
      body: z.object({
        name: z.string(),
        description: z.string().optional(),
        triggerType: z.string(),
        steps: z.array(z.object({
          actionType: z.string(),
          config: z.any()
        }))
      })
    }
  }, async (req, reply) => {
    const data = req.body;
    
    const workflow = await server.prisma.workflow.create({
      data: {
        name: data.name,
        description: data.description,
        triggerType: data.triggerType,
        steps: {
          create: data.steps.map((step, index) => ({
            stepOrder: index,
            actionType: step.actionType,
            config: step.config
          }))
        }
      },
      include: { steps: true }
    });
    
    return reply.status(201).send(workflow);
  });

  server.post('/:id/steps', {
    schema: {
      params: z.object({ id: z.string() }),
      body: z.object({
        actionType: z.string(),
        config: z.any()
      })
    }
  }, async (req, reply) => {
    const { id } = req.params;
    const data = req.body;

    const count = await server.prisma.workflowStep.count({ where: { workflowId: id } });

    const step = await server.prisma.workflowStep.create({
      data: {
        workflowId: id,
        actionType: data.actionType,
        config: data.config,
        stepOrder: count
      }
    });

    return reply.status(201).send(step);
  });
}
