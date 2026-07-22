import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { auditLog } from '../utils/audit';

const EstimateItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
});

const CreateEstimateSchema = z.object({
  estimateNumber: z.string().min(1),
  projectId: z.string().optional(),
  clientName: z.string().min(1),
  clientEmail: z.string().email().optional(),
  businessUnit: z.enum(['AGENCY', 'ACADEMY']),
  validUntil: z.string().datetime().optional(),
  currency: z.string().default('INR'),
  notes: z.string().optional(),
  items: z.array(EstimateItemSchema).min(1),
});

const UpdateEstimateSchema = CreateEstimateSchema.partial().extend({
  status: z.enum(['DRAFT', 'SENT', 'VIEWED', 'ACCEPTED', 'REJECTED', 'EXPIRED']).optional(),
});

function calcTotal(items: z.infer<typeof EstimateItemSchema>[]) {
  let subtotal = 0;
  for (const item of items) {
    subtotal += item.quantity * item.unitPrice;
  }
  return { subtotal, totalAmount: subtotal };
}

export default async function estimatesRouter(app: FastifyInstance) {
  // GET /api/v1/finance/estimates
  app.get('/estimates', async (req, reply) => {
    const { status, businessUnit } = req.query as { status?: string; businessUnit?: string };
    const estimates = await app.prisma.estimate.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(businessUnit && { businessUnit: businessUnit as any }),
      },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return { data: estimates, total: estimates.length };
  });

  // GET /api/v1/finance/estimates/:id
  app.get('/estimates/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const estimate = await app.prisma.estimate.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });

    if (!estimate) return reply.notFound('Estimate not found');
    return estimate;
  });

  // POST /api/v1/finance/estimates
  app.post('/estimates', async (req, reply) => {
    const body = CreateEstimateSchema.parse(req.body);
    const totals = calcTotal(body.items);
    
    const estimate = await app.prisma.estimate.create({
      data: {
        estimateNumber: body.estimateNumber,
        projectId: body.projectId,
        clientName: body.clientName,
        clientEmail: body.clientEmail,
        businessUnit: body.businessUnit,
        validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
        currency: body.currency,
        notes: body.notes,
        ...totals,
        items: {
          create: body.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: { items: true },
    });
    reply.code(201);
    await auditLog(app.prisma as any, req, 'CREATE', 'Estimate', estimate.id, { estimateNumber: estimate.estimateNumber });
    return estimate;
  });

  // PATCH /api/v1/finance/estimates/:id
  app.patch('/estimates/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = UpdateEstimateSchema.parse(req.body);
    const { items, ...rest } = body;
    
    let totals: any;
    if (items) {
      totals = calcTotal(items);
    }

    const estimate = await app.prisma.$transaction(async (tx) => {
      if (items) {
        await tx.estimateItem.deleteMany({ where: { estimateId: id } });
        await tx.estimateItem.createMany({
          data: items.map((item) => ({
            estimateId: id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.quantity * item.unitPrice,
          })),
        });
      }
      return tx.estimate.update({
        where: { id },
        data: { 
          ...rest, 
          ...totals, 
          ...(rest.validUntil && { validUntil: new Date(rest.validUntil) }) 
        },
        include: { items: true },
      });
    });

    await auditLog(app.prisma as any, req, 'UPDATE', 'Estimate', estimate.id, { status: estimate.status });
    return estimate;
  });

  // DELETE /api/v1/finance/estimates/:id
  app.delete('/estimates/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const estimate = await app.prisma.estimate.findUnique({ where: { id }, select: { estimateNumber: true } });
    await app.prisma.estimate.delete({ where: { id } });
    await auditLog(app.prisma as any, req, 'DELETE', 'Estimate', id, { estimateNumber: estimate?.estimateNumber });
    reply.code(204).send();
  });
}
