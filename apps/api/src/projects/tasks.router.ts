import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { sendTemplatedEmail } from '../services/emailRenderer';

const CreateTaskSchema = z.object({
  projectId: z.string().optional().nullable(),
  title: z.string().min(1),
  description: z.string().optional().nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED']).optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'NORMAL', 'LOW']).optional(),
  assigneeId: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
});

const UpdateTaskSchema = CreateTaskSchema.partial();

export default async function tasksRouter(app: FastifyInstance) {
  // GET /api/v1/projects/tasks/all — Get all tasks across the company
  app.get('/tasks/all', async (req, reply) => {
    const tasks = await app.prisma.task.findMany({
      include: { project: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return { data: tasks, total: tasks.length };
  });

  // GET /api/v1/projects/tasks/ongoing — Get active/in-progress tasks for admin monitoring
  app.get('/tasks/ongoing', async (req, reply) => {
    const tasks = await app.prisma.task.findMany({
      where: { status: { in: ['IN_PROGRESS', 'TODO', 'IN_REVIEW'] } },
      include: {
        project: { select: { id: true, name: true } },
        timeLogs: { orderBy: { logDate: 'desc' }, take: 5 }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const assigneeIds = tasks.map(t => t.assigneeId).filter(Boolean) as string[];
    const employees = await app.prisma.employee.findMany({
      where: { OR: [{ id: { in: assigneeIds } }, { userId: { in: assigneeIds } }] },
      include: { user: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } } }
    });

    const empMap = new Map();
    employees.forEach(e => {
      empMap.set(e.id, e);
      if (e.userId) empMap.set(e.userId, e);
    });

    const enrichedTasks = tasks.map(t => {
      const emp = t.assigneeId ? empMap.get(t.assigneeId) : null;
      return {
        ...t,
        assigneeName: emp?.user ? `${emp.user.firstName} ${emp.user.lastName}` : 'Unassigned',
        assigneeAvatar: emp?.user?.avatarUrl || null,
        assigneeEmail: emp?.user?.email || null,
      };
    });

    return { data: enrichedTasks, total: enrichedTasks.length };
  });

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
        projectId: body.projectId,
        title: body.title,
        description: body.description || undefined,
        status: body.status || 'TODO',
        priority: body.priority || 'NORMAL',
        assigneeId: body.assigneeId || undefined,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      },
    });

    // Auto-trigger TASK_ASSIGNED email to staff if assigned
    if (task.assigneeId) {
      (async () => {
        try {
          const employee = await app.prisma.employee.findFirst({
            where: { OR: [{ id: task.assigneeId! }, { userId: task.assigneeId! }] },
            include: { user: true }
          });
          const project = task.projectId ? await app.prisma.project.findUnique({ where: { id: task.projectId } }) : null;
          const staffEmail = employee?.user?.email || (employee as any)?.email;
          const staffName = employee?.user?.firstName || (employee as any)?.firstName || 'Staff';
          if (staffEmail) {
            await sendTemplatedEmail(app, {
              code: 'TASK_ASSIGNED',
              to: staffEmail,
              data: {
                staffName,
                projectName: project?.name || 'Project',
                taskTitle: task.title,
                priority: task.priority,
                dueDate: task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A',
                taskUrl: `https://garage.grekam.in/dashboard/projects/${task.projectId}`
              }
            });
          }
        } catch (err: any) {
          app.log.warn(`Task email notify warning: ${err.message}`);
        }
      })();
    }

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
        ...(body.projectId && { projectId: body.projectId }),
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && { description: body.description || undefined }),
        ...(body.status && { status: body.status }),
        ...(body.priority && { priority: body.priority }),
        ...(body.assigneeId !== undefined && { assigneeId: body.assigneeId || undefined }),
        ...(body.dueDate !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : undefined }),
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
