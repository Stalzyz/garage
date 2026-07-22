import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const CreateVendorSchema = z.object({
  userId: z.string().optional(),
  vendorCode: z.string().optional(),
  type: z.enum(['CREATIVE', 'TECHNICAL', 'OPERATIONAL', 'SUPPLIER', 'FREELANCER', 'AGENCY', 'SOFTWARE', 'EQUIPMENT', 'OTHER']).optional(),
  company: z.string().optional(),
  skills: z.array(z.string()).default([]),
  dayRate: z.number().nonnegative().optional(),
  projectRate: z.number().nonnegative().optional(),
  gstin: z.string().optional(),
  
  user: z.object({
    name: z.string().optional(),
    email: z.string().email(),
  }).optional(),

  name: z.string().optional(),
  contactName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional()
});

const UpdateVendorSchema = z.object({
  company: z.string().optional(),
  type: z.enum(['CREATIVE', 'TECHNICAL', 'OPERATIONAL', 'SUPPLIER']).optional(),
  skills: z.array(z.string()).optional(),
  dayRate: z.number().nonnegative().optional(),
  projectRate: z.number().nonnegative().optional(),
  gstin: z.string().optional(),
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
    
    let userId = body.userId;
    if (!userId) {
      const email = body.email || body.user?.email;
      if (!email) {
        return reply.badRequest("Email is required when userId is not provided");
      }
      
      let userRecord = await app.prisma.user.findUnique({ where: { email } });
      if (!userRecord) {
        const fullName = body.name || body.user?.name || body.contactName || "New Vendor";
        const parts = fullName.split(" ");
        const firstName = parts[0] || "New";
        const lastName = parts.slice(1).join(" ") || "Vendor";
        const bcrypt = require('bcryptjs');
        const passwordHash = await bcrypt.hash('GrekamVendor@123', 10);
        
        userRecord = await app.prisma.user.create({
          data: {
            email,
            passwordHash,
            role: "VENDOR",
            firstName,
            lastName,
            phone: body.phone || null,
            status: "ACTIVE"
          }
        });
      }
      userId = userRecord.id;
    }

    const vendorCode = body.vendorCode || `VND-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    let type: 'CREATIVE' | 'TECHNICAL' | 'OPERATIONAL' | 'SUPPLIER' = 'TECHNICAL';
    if (body.type) {
      const t = body.type.toUpperCase();
      if (t === 'CREATIVE' || t === 'TECHNICAL' || t === 'OPERATIONAL' || t === 'SUPPLIER') {
        type = t as any;
      } else if (t === 'FREELANCER') {
        type = 'CREATIVE';
      } else if (t === 'AGENCY') {
        type = 'OPERATIONAL';
      } else if (t === 'SOFTWARE') {
        type = 'TECHNICAL';
      } else if (t === 'EQUIPMENT') {
        type = 'SUPPLIER';
      } else {
        type = 'OPERATIONAL';
      }
    }

    const vendor = await app.prisma.vendor.create({
      data: {
        userId,
        vendorCode,
        type,
        company: body.company || body.name || null,
        skills: body.skills || [],
        dayRate: body.dayRate || 0,
        projectRate: body.projectRate || 0,
        gstin: body.gstin || body.taxId || null
      }
    });
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
