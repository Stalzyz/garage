import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const CreateProjectSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['BRAND_IDENTITY', 'WEBSITE', 'CAMPAIGN', 'MOTION', 'FULL_PACKAGE', 'CUSTOM']),
  companyId: z.string().optional(),
  managerId: z.string().min(1),
  budget: z.number().optional(),
  startDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  description: z.string().optional(),
});

const UpdateProjectSchema = CreateProjectSchema.partial().extend({
  status: z.enum(['BRIEFING', 'DISCOVERY', 'CONCEPT', 'PRODUCTION', 'REVIEW', 'DELIVERY', 'CLOSED', 'ON_HOLD']).optional(),
  completedAt: z.string().datetime().optional(),
});

export default async function projectsRouter(app: FastifyInstance) {
  // GET /api/v1/projects
  app.get('/', async (req, reply) => {
    const { status, managerId, companyId, includeFiles } = req.query as { status?: string; managerId?: string; companyId?: string; includeFiles?: string };
    const user = req.user;
    let enforcedCompanyId = companyId;

    if (user.role === 'CLIENT') {
      const clientProfile = await app.prisma.clientProfile.findUnique({
        where: { userId: user.id },
        include: { contact: true }
      });
      if (!clientProfile || !clientProfile.contact?.companyId) {
        return { data: [], total: 0 };
      }
      enforcedCompanyId = clientProfile.contact.companyId;
    }

    const projects = await app.prisma.project.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(managerId && { managerId }),
        ...(enforcedCompanyId && { companyId: enforcedCompanyId }),
      },
      include: {
        company: { select: { name: true } },
        _count: { select: { tasks: true, phases: true } },
        ...(includeFiles === 'true' && { files: { orderBy: { createdAt: 'desc' } } })
      },
      orderBy: { updatedAt: 'desc' },
    });
    return { data: projects, total: projects.length };
  });

  // GET /api/v1/projects/:id
  app.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const user = req.user;
    let companyIdLimit = null;

    if (user.role === 'CLIENT') {
      const clientProfile = await app.prisma.clientProfile.findUnique({
        where: { userId: user.id },
        include: { contact: true }
      });
      if (!clientProfile || !clientProfile.contact?.companyId) {
        return reply.forbidden('Access denied');
      }
      companyIdLimit = clientProfile.contact.companyId;
    }

    const project = await app.prisma.project.findUnique({
      where: { id },
      include: {
        company: true,
        phases: { orderBy: { sortOrder: 'asc' } },
        tasks: { orderBy: { createdAt: 'desc' } },
        files: { orderBy: { createdAt: 'desc' } },
        _count: { select: { timeLogs: true, files: true } },
      },
    });
    if (!project) return reply.notFound('Project not found');

    if (companyIdLimit && project.companyId !== companyIdLimit) {
      return reply.forbidden('Access denied');
    }

    return project;
  });

  // POST /api/v1/projects
  app.post('/', async (req, reply) => {
    const body = CreateProjectSchema.parse(req.body);
    const project = await app.prisma.project.create({
      data: {
        ...body,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      },
    });
    reply.code(201);
    return project;
  });

  // PATCH /api/v1/projects/:id
  app.patch('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = UpdateProjectSchema.parse(req.body);
    const project = await app.prisma.project.update({
      where: { id },
      data: {
        ...body,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        completedAt: body.completedAt ? new Date(body.completedAt) : undefined,
      },
    });
    return project;
  });

  // DELETE /api/v1/projects/:id
  app.delete('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    await app.prisma.project.delete({ where: { id } });
    reply.code(204);
  });

  // POST /api/v1/projects/:id/phases/:phaseId/approve
  app.post('/:id/phases/:phaseId/approve', async (req, reply) => {
    const { id, phaseId } = req.params as { id: string; phaseId: string };
    const user = req.user;

    const bodySchema = z.object({
      approvedBy: z.string().min(1),
      clientNotes: z.string().optional()
    });
    const { approvedBy, clientNotes } = bodySchema.parse(req.body);

    if (user.role === 'CLIENT') {
      const clientProfile = await app.prisma.clientProfile.findUnique({
        where: { userId: user.id },
        include: { contact: true }
      });
      if (!clientProfile || !clientProfile.contact?.companyId) {
        return reply.forbidden('Access denied');
      }
      const project = await app.prisma.project.findUnique({
        where: { id }
      });
      if (!project || project.companyId !== clientProfile.contact.companyId) {
        return reply.forbidden('Access denied');
      }
    }

    const phase = await app.prisma.projectPhase.update({
      where: { id: phaseId },
      data: {
        completedAt: new Date(),
        approvedAt: new Date(),
        approvedBy,
        clientNotes
      }
    });

    try {
      (app as any).broadcast('telemetry-event', {
        event: 'Phase Approved',
        data: {
          id: phase.id,
          name: phase.name,
          approvedBy,
          clientNotes
        }
      });
    } catch {}

    return { success: true, phase };
  });

  // POST /api/v1/projects/:id/files/:fileId/approve
  app.post('/:id/files/:fileId/approve', async (req, reply) => {
    const { id, fileId } = req.params as { id: string; fileId: string };
    const user = req.user;

    const bodySchema = z.object({
      approvedBy: z.string().min(1),
      clientNotes: z.string().optional()
    });
    const { approvedBy, clientNotes } = bodySchema.parse(req.body);

    if (user.role === 'CLIENT') {
      const clientProfile = await app.prisma.clientProfile.findUnique({
        where: { userId: user.id },
        include: { contact: true }
      });
      if (!clientProfile || !clientProfile.contact?.companyId) {
        return reply.forbidden('Access denied');
      }
      const project = await app.prisma.project.findUnique({
        where: { id }
      });
      if (!project || project.companyId !== clientProfile.contact.companyId) {
        return reply.forbidden('Access denied');
      }
    }

    const file = await app.prisma.projectFile.update({
      where: { id: fileId },
      data: {
        approvedAt: new Date(),
        approvedBy,
        clientNotes
      }
    });

    try {
      (app as any).broadcast('telemetry-event', {
        event: 'Deliverable Approved',
        data: {
          id: file.id,
          name: file.name,
          approvedBy,
          clientNotes
        }
      });
    } catch {}

    return { success: true, file };
  });
}
