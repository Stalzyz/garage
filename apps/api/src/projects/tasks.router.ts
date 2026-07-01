import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const CreateTaskSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED']).optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'NORMAL', 'LOW']).optional(),
  assigneeId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

const UpdateTaskSchema = CreateTaskSchema.partial();

export default async function tasksRouter(app: FastifyInstance) {
  // GET /api/v1/projects/:projectId/tasks
  app.get('/:projectId/tasks', async (req, reply) => {
    const { projectId } = req.params as { projectId: string };
    const tasks = await app.prisma.task.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
    return { data: tasks, total: tasks.length };
  });

  // GET /api/v1/projects/tasks/user/:assigneeId
  app.get('/user/:assigneeId', async (req, reply) => {
    const { assigneeId } = req.params as { assigneeId: string };
    const tasks = await app.prisma.task.findMany({
      where: { assigneeId, status: { notIn: ['DONE'] } },
      include: { project: { select: { name: true } } },
      orderBy: { dueDate: 'asc' },
    });
    return { data: tasks, total: tasks.length };
  });

  // POST /api/v1/projects/tasks
  app.post('/tasks', async (req, reply) => {
    const body = CreateTaskSchema.parse(req.body);
    const task = await app.prisma.task.create({
      data: {
        ...body,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      },
    });
    reply.code(201);
    return task;
  });

  // PATCH /api/v1/projects/tasks/:id
  app.patch('/tasks/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = UpdateTaskSchema.parse(req.body);
    const task = await app.prisma.task.update({
      where: { id },
      data: {
        ...body,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      },
    });
    return task;
  });

  // DELETE /api/v1/projects/tasks/:id
  app.delete('/tasks/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    await app.prisma.task.delete({ where: { id } });
    reply.code(204);
  });
}
