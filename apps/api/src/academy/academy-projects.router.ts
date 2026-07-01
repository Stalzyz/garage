import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export default async function academyProjectsRouter(app: FastifyInstance) {
  // GET /api/v1/academy/projects
  app.get('/projects', async (req, reply) => {
    const projects = await app.prisma.academyProject.findMany({
      include: {
        members: { include: { student: { select: { id: true, user: { select: { firstName: true, lastName: true } } } } } },
        _count: { select: { tasks: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return projects;
  });

  // POST /api/v1/academy/projects
  app.post('/projects', async (req, reply) => {
    const schema = z.object({
      title: z.string(),
      type: z.enum(['INTERNAL', 'CLIENT', 'INDUSTRY', 'HACKATHON', 'RESEARCH', 'COMPETITION', 'FREELANCE']),
      description: z.string().optional(),
      batchId: z.string().optional(),
      clientName: z.string().optional(),
    });
    const body = schema.parse(req.body);

    const project = await app.prisma.academyProject.create({
      data: body
    });

    reply.code(201);
    return project;
  });

  // GET /api/v1/academy/projects/:id
  app.get('/projects/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const project = await app.prisma.academyProject.findUnique({
      where: { id },
      include: {
        members: { include: { student: { select: { id: true, user: { select: { firstName: true, lastName: true } } } } } },
        tasks: { orderBy: { createdAt: 'desc' } }
      }
    });
    if (!project) return reply.notFound('Project not found');
    return project;
  });
}
