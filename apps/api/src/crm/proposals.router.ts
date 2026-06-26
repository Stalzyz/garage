import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { auditLog } from '../utils/audit';

const ProposalItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: z.number().nonnegative(),
  unit: z.string().default('units'),
});

const CreateProposalSchema = z.object({
  leadId: z.string().optional(),
  title: z.string().min(1),
  validUntil: z.string().datetime().optional(),
  currency: z.string().default('INR'),
  notes: z.string().optional(),
  items: z.array(ProposalItemSchema).min(1),
});

const UpdateProposalSchema = CreateProposalSchema.partial().extend({
  status: z.enum(['DRAFT', 'SENT', 'VIEWED', 'APPROVED', 'REJECTED', 'EXPIRED']).optional(),
  signedAt: z.string().datetime().optional(),
  signatureUrl: z.string().url().optional(),
});

function calcTotal(items: z.infer<typeof ProposalItemSchema>[]): number {
  return items.reduce((sum, item) => {
    const subtotal = item.quantity * item.unitPrice;
    return sum + subtotal;
  }, 0);
}

export default async function proposalsRouter(app: FastifyInstance) {
  // GET /api/v1/crm/proposals
  app.get('/proposals', async (req, reply) => {
    const { status, leadId } = req.query as { status?: string; leadId?: string };
    const proposals = await app.prisma.proposal.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(leadId && { leadId }),
      },
      include: {
        items: true,
        lead: { select: { id: true, name: true, company: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
    return { data: proposals, total: proposals.length };
  });

  // GET /api/v1/crm/proposals/:id
  app.get('/proposals/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const proposal = await app.prisma.proposal.findUnique({
      where: { id },
      include: {
        items: true,
        lead: { select: { id: true, name: true, company: true, email: true, phone: true } },
      },
    });
    if (!proposal) return reply.notFound('Proposal not found');
    return proposal;
  });

  // POST /api/v1/crm/proposals — create proposal with items
  app.post('/proposals', async (req, reply) => {
    const body = CreateProposalSchema.parse(req.body);
    const totalAmount = calcTotal(body.items);

    const proposal = await app.prisma.proposal.create({
      data: {
        leadId: body.leadId,
        title: body.title,
        validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
        currency: body.currency,
        notes: body.notes,
        totalAmount,
        items: {
          create: body.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            unit: item.unit,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
      include: { items: true },
    });
    reply.code(201);
    await auditLog(app.prisma as any, req, 'CREATE', 'Proposal', proposal.id, { title: proposal.title });
    return proposal;
  });

  // PATCH /api/v1/crm/proposals/:id — update proposal or change status
  app.patch('/proposals/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = UpdateProposalSchema.parse(req.body);
    const { items, ...rest } = body;

    let totalAmount: number | undefined;
    if (items) totalAmount = calcTotal(items);

    const proposal = await app.prisma.$transaction(async (tx) => {
      if (items) {
        await tx.proposalItem.deleteMany({ where: { proposalId: id } });
        await tx.proposalItem.createMany({
          data: items.map(item => ({
            proposalId: id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            unit: item.unit,
            total: item.quantity * item.unitPrice,
          })),
        });
      }
      return tx.proposal.update({
        where: { id },
        data: {
          ...rest,
          ...(totalAmount !== undefined && { totalAmount }),
          ...(rest.signedAt && { signedAt: new Date(rest.signedAt) }),
          ...(rest.validUntil && { validUntil: new Date(rest.validUntil) }),
        },
        include: { items: true },
      });
    });
    await auditLog(app.prisma as any, req, 'UPDATE', 'Proposal', proposal.id, { status: proposal.status });
    return proposal;
  });
  app.post('/proposals/:id/send', async (req, reply) => {
    const { id } = req.params as { id: string };
    
    // Generate token if it doesn't have one
    const existing = await app.prisma.proposal.findUnique({ where: { id }, select: { publicToken: true } });
    const token = existing?.publicToken || `prop_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const proposal = await app.prisma.proposal.update({
      where: { id },
      data: { 
        status: 'SENT',
        publicToken: token
      },
    });
    await auditLog(app.prisma as any, req, 'UPDATE', 'Proposal', proposal.id, { status: 'SENT' });
    return proposal;
  });

  // POST /api/v1/crm/proposals/:id/duplicate — create v+1 copy
  app.post('/proposals/:id/duplicate', async (req, reply) => {
    const { id } = req.params as { id: string };
    const original = await app.prisma.proposal.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!original) return reply.notFound('Proposal not found');

    const duplicate = await app.prisma.proposal.create({
      data: {
        leadId: original.leadId,
        title: `${original.title} (v${original.version + 1})`,
        version: original.version + 1,
        totalAmount: original.totalAmount,
        currency: original.currency,
        notes: original.notes ?? undefined,
        items: {
          create: original.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            unit: item.unit,
            total: item.total,
          })),
        },
      },
      include: { items: true },
    });
    reply.code(201);
    return duplicate;
  });

  // DELETE /api/v1/crm/proposals/:id
  app.delete('/proposals/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    await app.prisma.proposal.delete({ where: { id } });
    await auditLog(app.prisma as any, req, 'DELETE', 'Proposal', id);
    reply.code(204);
  });
}
