import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { auditLog } from '../utils/audit';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

  // POST /api/v1/crm/proposals/generate — AI generate proposal content
  app.post('/proposals/generate', async (req, reply) => {
    const { title, items } = req.body as { title: string, items: any[] };
    
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Write a professional executive summary and overview for a business proposal titled "${title}".
      The proposal includes the following line items:
      ${items.map((i: any) => `- ${i.title || i.name}: ${i.description}`).join('\n')}
      
      Format the response in Markdown. Include sections for Overview, Objectives, and Value Proposition.
      Do not include any introductory conversation, just the markdown content itself.`;

      const result = await model.generateContent(prompt);
      const content = result.response.text();

      return { content: content.trim() };
    } catch (error) {
      console.error("AI Generation Error:", error);
      return { 
        content: `## Overview\n\nWe are excited to propose the "${title}" project.\n\n## Objectives\n- Deliver high quality results\n- Align with your strategic goals\n\n*(Note: This is a fallback mock because the AI generation failed.)*` 
      };
    }
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
    const existing = await app.prisma.proposal.findUnique({ 
      where: { id }, 
      include: { lead: true } 
    });
    
    if (!existing) return reply.notFound('Proposal not found');

    const token = existing.publicToken || `prop_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const proposal = await app.prisma.proposal.update({
      where: { id },
      data: { 
        status: 'SENT',
        publicToken: token
      },
    });

    if (existing.lead && existing.lead.email) {
      const { sendEmail } = await import('../integrations/email.service');
      const portalUrl = process.env.PORTAL_URL || 'http://localhost:3000';
      const link = `${portalUrl}/portal/proposals/${token}`;
      
      const htmlBody = `
        <h2>Hello ${existing.lead.name},</h2>
        <p>A new proposal (<strong>${proposal.title}</strong>) has been prepared for you.</p>
        <p>You can view and approve the proposal using the secure link below:</p>
        <br/>
        <a href="${link}" style="display:inline-block;background:#3b82f6;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">View Proposal</a>
        <br/><br/>
        <p style="color:#666;font-size:12px;">Powered by Grekam Visuals</p>
      `;

      await sendEmail(existing.lead.email, {
        subject: `New Proposal: ${proposal.title}`,
        html: htmlBody
      });
    }

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
    return reply.code(204).send();
  });

  // GET /api/v1/crm/proposals/public/:token
  app.get('/proposals/public/:token', async (req, reply) => {
    const { token } = req.params as { token: string };
    const proposal = await app.prisma.proposal.findUnique({
      where: { publicToken: token },
      include: {
        items: true,
        lead: { select: { id: true, name: true, company: true } },
      },
    });
    
    if (!proposal) return reply.notFound('Proposal not found');
    
    // Auto-update status to VIEWED if it was just SENT
    if (proposal.status === 'SENT') {
      await app.prisma.proposal.update({
        where: { id: proposal.id },
        data: { status: 'VIEWED' }
      });
      proposal.status = 'VIEWED';
    }
    
    return { data: proposal };
  });

  // POST /api/v1/crm/proposals/public/:token/sign
  app.post('/proposals/public/:token/sign', async (req, reply) => {
    const { token } = req.params as { token: string };
    const { signatureData } = req.body as { signatureData: string };
    
    const existing = await app.prisma.proposal.findUnique({ where: { publicToken: token } });
    if (!existing) return reply.notFound('Proposal not found');
    
    const proposal = await app.prisma.proposal.update({
      where: { id: existing.id },
      data: {
        status: 'APPROVED',
        signedAt: new Date(),
        signatureData: signatureData
      },
      include: { lead: true }
    });

    return { success: true, data: proposal };
  });
}
