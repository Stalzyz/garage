import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function timeRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get('/', async (req, reply) => {
    const timeLogs = await server.prisma.timeLog.findMany({
      include: {
        project: { select: { name: true } },
        task: { select: { title: true } }
      },
      orderBy: { logDate: 'desc' }
    });
    return { timeLogs };
  });

  server.post('/', {
    schema: {
      body: z.object({
        projectId: z.string(),
        taskId: z.string().optional(),
        hours: z.number(),
        description: z.string().optional(),
        logDate: z.string().optional()
      })
    }
  }, async (req, reply) => {
    // Assuming user 1 for demo purposes
    const userId = "cuid-user-1"; 
    
    const data = req.body;
    const log = await server.prisma.timeLog.create({
      data: {
        projectId: data.projectId,
        taskId: data.taskId,
        hours: data.hours,
        description: data.description,
        userId: userId,
        logDate: data.logDate ? new Date(data.logDate) : new Date()
      }
    });
    return reply.status(201).send(log);
  });
}
