import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const CreateVendorSchema = z.object({
  userId: z.string().min(1),
  vendorCode: z.string().min(1),
  type: z.enum(['CREATIVE', 'TECHNICAL', 'OPERATIONAL', 'SUPPLIER']),
  company: z.string().optional(),
  skills: z.array(z.string()).default([]),
  dayRate: z.number().nonnegative().optional(),
  projectRate: z.number().nonnegative().optional(),
  gstin: z.string().optional(),
});

const UpdateVendorSchema = CreateVendorSchema.omit({ userId: true, vendorCode: true }).partial().extend({
  rating: z.number().min(0).max(5).optional(),
});

export default async function vendorsRouter(app: FastifyInstance) {
  // GET /api/v1/vendors
  app.get('/', async (req, reply) => {
    const { type } = req.query as { type?: string };
    const vendors = await app.prisma.vendor.findMany({
      where: { ...(type && { type: type as any }) },
      include: {
        user: { select: { name: true, email: true, avatarUrl: true } },
        _count: { select: { assignments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return { data: vendors, total: vendors.length };
  });

  // GET /api/v1/vendors/:id
  app.get('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const vendor = await app.prisma.vendor.findUnique({
      where: { id },
      include: {
        user: { select: { name: true, email: true, avatarUrl: true } },
        assignments: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!vendor) return reply.notFound('Vendor not found');
    return vendor;
  });

  // POST /api/v1/vendors
  app.post('/', async (req, reply) => {
    const body = CreateVendorSchema.parse(req.body);
    const vendor = await app.prisma.vendor.create({ data: body });
    reply.code(201);
    return vendor;
  });

  // PATCH /api/v1/vendors/:id
  app.patch('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = UpdateVendorSchema.parse(req.body);
    const vendor = await app.prisma.vendor.update({ where: { id }, data: body });
    return vendor;
  });

  // DELETE /api/v1/vendors/:id
  app.delete('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    await app.prisma.vendor.delete({ where: { id } });
    reply.code(204);
  });

  // POST /api/v1/vendors/:id/assignments — Assign vendor to a project
  app.post('/:id/assignments', async (req, reply) => {
    const { id } = req.params as { id: string };
    const AssignSchema = z.object({
      projectId: z.string().min(1),
      brief: z.string().optional(),
      deadline: z.string().datetime().optional(),
      agreedRate: z.number().nonnegative().optional(),
    });
    const body = AssignSchema.parse(req.body);
    const assignment = await app.prisma.vendorAssignment.create({
      data: {
        vendorId: id,
        ...body,
        ...(body.deadline && { deadline: new Date(body.deadline) }),
      },
    });
    reply.code(201);
    return assignment;
  });

  // PATCH /api/v1/vendors/assignments/:assignmentId — Update assignment status
  app.patch('/assignments/:assignmentId', async (req, reply) => {
    const { assignmentId } = req.params as { assignmentId: string };
    const UpdateAssignmentSchema = z.object({
      status: z.enum(['ASSIGNED', 'SUBMITTED', 'APPROVED', 'PAID']).optional(),
      rating: z.number().min(1).max(5).optional(),
      ratingNotes: z.string().optional(),
    });
    const body = UpdateAssignmentSchema.parse(req.body);
    const assignment = await app.prisma.vendorAssignment.update({
      where: { id: assignmentId },
      data: body,
    });
    return assignment;
  });
}
