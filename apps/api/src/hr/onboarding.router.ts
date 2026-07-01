import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function onboardingRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // Get onboarding tasks grouped by employee
  server.get('/', async (req, reply) => {
    const employeesWithTasks = await server.prisma.employee.findMany({
      where: {
        onboardingTasks: { some: {} } // only employees with onboarding tasks
      },
      include: {
        user: true,
        onboardingTasks: { orderBy: { createdAt: 'asc' } }
      }
    });

    return { data: employeesWithTasks };
  });

  server.post('/', {
    schema: {
      body: z.object({
        employeeId: z.string(),
        title: z.string(),
        category: z.string().optional()
      })
    }
  }, async (req, reply) => {
    const task = await server.prisma.onboardingTask.create({
      data: {
        employeeId: req.body.employeeId,
        title: req.body.title,
        description: req.body.category
      }
    });
    return reply.status(201).send(task);
  });

  // Complete a task
  server.patch('/:taskId/complete', {
    schema: {
      params: z.object({ taskId: z.string() })
    }
  }, async (req, reply) => {
    const task = await server.prisma.onboardingTask.update({
      where: { id: req.params.taskId },
      data: { isCompleted: true, completedAt: new Date() }
    });
    return reply.send(task);
  });

  // Delete all tasks for an employee (Delete Workflow)
  server.delete('/:employeeId', {
    schema: {
      params: z.object({ employeeId: z.string() })
    }
  }, async (req, reply) => {
    await server.prisma.onboardingTask.deleteMany({
      where: { employeeId: req.params.employeeId }
    });
    return reply.status(204).send();
  });
}
