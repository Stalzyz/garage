import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function timeRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.addHook('onRequest', app.requireAuth);

  server.get('/', async (req, reply) => {
    const user = (req as any).user;
    const isPrivileged = user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER';
    
    const timeLogs = await server.prisma.timeLog.findMany({
      where: isPrivileged ? {} : { userId: user?.id },
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
    // Use actual authenticated user ID
    const userId = (req as any).user?.id; 
    
    if (!userId) {
      return reply.status(401).send({ error: "Unauthorized" });
    }
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
