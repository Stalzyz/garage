import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { auditLog } from '../utils/audit';
import OpenAI from 'openai';
import { generateProposalPDF } from '../finance/pdf.service';

const ProposalItemSchema = z.object({
  description: z.string().min(1),
  quantity: z.coerce.number().positive().default(1),
  unitPrice: z.coerce.number().nonnegative().default(0),
  unit: z.string().optional().default('units'),
  discountRate: z.coerce.number().nonnegative().optional().default(0),
  taxRate: z.coerce.number().nonnegative().optional().default(0),
});

const CreateProposalSchema = z.object({
  leadId: z.string().nullable().optional(),
  contactId: z.string().nullable().optional(),
  title: z.string().min(1),
  validUntil: z.string().nullable().optional(),
  currency: z.string().optional().default('INR'),
  notes: z.string().nullable().optional(),
  taxRate: z.coerce.number().nonnegative().optional().default(0),
  discountRate: z.coerce.number().nonnegative().optional().default(0),
  items: z.array(ProposalItemSchema).min(1),
});

const UpdateProposalSchema = CreateProposalSchema.partial().extend({
  status: z.enum(['DRAFT', 'SENT', 'VIEWED', 'APPROVED', 'REJECTED', 'EXPIRED']).optional(),
  signedAt: z.string().nullable().optional(),
  signatureUrl: z.string().nullable().optional(),
});

function calcItemTotal(item: z.infer<typeof ProposalItemSchema>): number {
  const base = item.quantity * item.unitPrice;
  const discount = base * ((item.discountRate || 0) / 100);
  const afterDiscount = base - discount;
  const tax = afterDiscount * ((item.taxRate || 0) / 100);
  return afterDiscount + tax;
}

function calcTotal(items: z.infer<typeof ProposalItemSchema>[]): number {
  return items.reduce((sum, item) => sum + calcItemTotal(item), 0);
}

export default async function proposalsRouter(app: FastifyInstance) {
  // GET /api/v1/crm/proposals
  app.get('/proposals', async (req, reply) => {
    const { status, leadId, page = '1', limit = '20', search, isTemplate } = req.query as { 
      status?: string; 
      leadId?: string; 
      page?: string; 
      limit?: string; 
      search?: string;
      isTemplate?: string;
    };
    
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = {
      ...(status && { status: status as any }),
      ...(leadId && { leadId }),
      ...(isTemplate !== undefined && { isTemplate: isTemplate === 'true' }),
    };

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { lead: { name: { contains: search, mode: 'insensitive' } } },
        { contact: { firstName: { contains: search, mode: 'insensitive' } } },
        { contact: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [proposals, total] = await Promise.all([
      app.prisma.proposal.findMany({
        where: whereClause,
        include: {
          items: true,
          lead: { select: { id: true, name: true, company: true } },
          contact: { select: { id: true, firstName: true, lastName: true, company: { select: { name: true } } } },
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limitNum,
      }),
      app.prisma.proposal.count({ where: whereClause })
    ]);

    return { 
      data: proposals, 
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    };
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

  // GET /api/v1/crm/proposals/:id/pdf
  app.get('/proposals/:id/pdf', async (req, reply) => {
    const { id } = req.params as { id: string };
    const proposal = await app.prisma.proposal.findUnique({
      where: { id },
      include: {
        items: true,
        lead: { select: { id: true, name: true, company: true, email: true, phone: true } },
      },
    });
    
    if (!proposal) return reply.notFound('Proposal not found');

    const financeSettings = await app.prisma.financeSettings.findFirst();

    const { getBrandConfig } = await import('../utils/brand');
    const brand = await getBrandConfig(app, 'AGENCY');

    const pdfBuffer = await generateProposalPDF({
      brand,
      proposal: {
        id: proposal.id,
        title: proposal.title,
        clientName: proposal.lead?.name || 'Client',
        clientCompany: proposal.lead?.company,
        clientEmail: proposal.lead?.email,
        clientPhone: proposal.lead?.phone,
        status: proposal.status,
        currency: financeSettings?.currencySymbol || proposal.currency,
        validUntil: proposal.validUntil ? proposal.validUntil.toISOString() : null,
        createdAt: proposal.createdAt.toISOString(),
        subtotal: proposal.subtotal,
        discountRate: proposal.discountRate,
        taxRate: proposal.taxRate,
        tax: proposal.tax,
        totalAmount: proposal.totalAmount,
        notes: proposal.notes,
        items: proposal.items,
      }
    });

    reply.header('Content-Type', 'application/pdf');
    reply.header('Content-Disposition', `attachment; filename="Proposal-${proposal.title.replace(/[^a-z0-9]/gi, '_')}.pdf"`);
    return reply.send(pdfBuffer);
  });

  // POST /api/v1/crm/proposals/generate — AI generate proposal content
  app.post('/proposals/generate', async (req, reply) => {
    const { title, items } = req.body as { title: string, items: any[] };
    
    try {
      const { getOpenAiClient } = await import('../utils/openai');
      const openai = await getOpenAiClient(app);

      const prompt = `Write a professional executive summary and overview for a business proposal titled "${title}".
      The proposal includes the following line items:
      ${items ? items.map((i: any) => `- ${i.title || i.name || 'Item'}: ${i.description || ''}`).join('\n') : ''}
      
      Format the response in basic HTML. Use tags like <h2>, <p>, <ul>, <li>, and <strong>. Include sections for Overview, Objectives, and Value Proposition.
      Do not include any introductory conversation, just the raw HTML content itself (no markdown code blocks, no \`\`\`html).`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      });

      const content = response.choices[0]?.message?.content || '';

      return { content: content.trim() };
    } catch (error: any) {
      app.log.error({ err: error }, "AI Proposal Content Generation Error");
      return reply.code(500).send({
        error: "Failed to generate AI proposal content",
        details: error?.message || "OpenAI API Key is not configured."
      });
    }
  });

  // POST /api/v1/crm/proposals — create proposal with items
  app.post('/proposals', async (req, reply) => {
    const body = CreateProposalSchema.parse(req.body);
    const subtotal = calcTotal(body.items);
    
    const overallDiscount = subtotal * ((body.discountRate || 0) / 100);
    const afterOverallDiscount = subtotal - overallDiscount;
    const tax = afterOverallDiscount * ((body.taxRate || 0) / 100);
    const totalAmount = afterOverallDiscount + tax;

    const cleanLeadId = body.leadId && body.leadId.trim() !== "" ? body.leadId.trim() : null;
    const cleanContactId = body.contactId && body.contactId.trim() !== "" ? body.contactId.trim() : null;
    const cleanValidUntil = body.validUntil && !isNaN(Date.parse(body.validUntil)) ? new Date(body.validUntil) : null;

    const proposal = await app.prisma.proposal.create({
      data: {
        leadId: cleanLeadId,
        contactId: cleanContactId,
        title: body.title,
        validUntil: cleanValidUntil,
        currency: body.currency || "INR",
        notes: body.notes || null,
        subtotal,
        discountRate: body.discountRate || 0,
        taxRate: body.taxRate || 0,
        tax,
        totalAmount,
        items: {
          create: body.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            unit: item.unit || "units",
            discountRate: item.discountRate || 0,
            taxRate: item.taxRate || 0,
            total: calcItemTotal(item),
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
    const { items, taxRate, discountRate, leadId, contactId, validUntil, signedAt, ...rest } = body;

    const cleanLeadId = leadId !== undefined ? (leadId && leadId.trim() !== "" ? leadId.trim() : null) : undefined;
    const cleanContactId = contactId !== undefined ? (contactId && contactId.trim() !== "" ? contactId.trim() : null) : undefined;
    const cleanValidUntil = validUntil !== undefined ? (validUntil && !isNaN(Date.parse(validUntil)) ? new Date(validUntil) : null) : undefined;
    const cleanSignedAt = signedAt !== undefined ? (signedAt && !isNaN(Date.parse(signedAt)) ? new Date(signedAt) : null) : undefined;

    let subtotal: number | undefined;
    let totalAmount: number | undefined;
    let newTaxRate = taxRate;
    let newDiscountRate = discountRate;
    let calculatedTax: number | undefined;

    if (items) {
      subtotal = calcTotal(items);
      const existing = await app.prisma.proposal.findUnique({ where: { id } });
      newTaxRate = taxRate !== undefined ? taxRate : (existing?.taxRate || 0);
      newDiscountRate = discountRate !== undefined ? discountRate : (existing?.discountRate || 0);
      
      const overallDiscount = subtotal * (newDiscountRate / 100);
      const afterOverallDiscount = subtotal - overallDiscount;
      calculatedTax = afterOverallDiscount * (newTaxRate / 100);
      totalAmount = afterOverallDiscount + calculatedTax;
    } else if (taxRate !== undefined || discountRate !== undefined) {
      const existing = await app.prisma.proposal.findUnique({ where: { id } });
      if (existing) {
        subtotal = existing.subtotal;
        newTaxRate = taxRate !== undefined ? taxRate : (existing.taxRate || 0);
        newDiscountRate = discountRate !== undefined ? discountRate : (existing.discountRate || 0);
        
        const overallDiscount = subtotal * (newDiscountRate / 100);
        const afterOverallDiscount = subtotal - overallDiscount;
        calculatedTax = afterOverallDiscount * (newTaxRate / 100);
        totalAmount = afterOverallDiscount + calculatedTax;
      }
    }

    const proposal = await app.prisma.$transaction(async (tx) => {
      if (items) {
        await tx.proposalItem.deleteMany({ where: { proposalId: id } });
        await tx.proposalItem.createMany({
          data: items.map(item => ({
            proposalId: id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            unit: item.unit || "units",
            discountRate: item.discountRate || 0,
            taxRate: item.taxRate || 0,
            total: calcItemTotal(item),
          })),
        });
      }
      return tx.proposal.update({
        where: { id },
        data: {
          ...rest,
          ...(cleanLeadId !== undefined && { leadId: cleanLeadId }),
          ...(cleanContactId !== undefined && { contactId: cleanContactId }),
          ...(cleanValidUntil !== undefined && { validUntil: cleanValidUntil }),
          ...(cleanSignedAt !== undefined && { signedAt: cleanSignedAt }),
          ...(taxRate !== undefined && { taxRate }),
          ...(discountRate !== undefined && { discountRate }),
          ...(calculatedTax !== undefined && { tax: calculatedTax }),
          ...(subtotal !== undefined && { subtotal }),
          ...(totalAmount !== undefined && { totalAmount }),
        },
        include: { items: true },
      });
    });
    
    // Trigger email if status changed to APPROVED
    if (rest.status === 'APPROVED') {
      const fullProposal = await app.prisma.proposal.findUnique({
        where: { id },
        include: { lead: true }
      });
      if (fullProposal?.lead?.email) {
        const { sendEmail, EmailTemplates } = await import('../integrations/email.service');
        await sendEmail(fullProposal.lead.email, EmailTemplates.proposalApproved(fullProposal.lead.name || 'Client', fullProposal.title));
      }
    }

    await auditLog(app.prisma as any, req, 'UPDATE', 'Proposal', proposal.id, { status: proposal.status });
    return proposal;
  });
  app.post('/proposals/:id/send', async (req, reply) => {
    const { id } = req.params as { id: string };
    
    // Generate token if it doesn't have one
    const [existing, financeSettings] = await Promise.all([
      app.prisma.proposal.findUnique({ 
        where: { id }, 
        include: { lead: true, items: true } 
      }),
      app.prisma.financeSettings.findFirst()
    ]);
    
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
      const { generateProposalPDF } = await import('../finance/pdf.service');
      
      const portalUrl = process.env.PORTAL_URL || process.env.AUTH_URL || 'https://garage.grekam.in';
      const link = `${portalUrl}/portal/proposals/${token}`;
      
      const { getBrandConfig } = await import('../utils/brand');
      const brand = await getBrandConfig(app, 'AGENCY');

      const pdfBuffer = await generateProposalPDF({
        brand,
        proposal: {
          id: existing.id,
          title: existing.title,
          clientName: existing.lead.name,
          clientCompany: existing.lead.company,
          clientEmail: existing.lead.email,
          clientPhone: existing.lead.phone,
          status: existing.status,
          currency: financeSettings?.currencySymbol || existing.currency,
          validUntil: existing.validUntil ? existing.validUntil.toISOString() : null,
          createdAt: existing.createdAt.toISOString(),
          subtotal: existing.subtotal,
          discountRate: existing.discountRate,
          taxRate: existing.taxRate,
          tax: existing.tax,
          totalAmount: existing.totalAmount,
          notes: existing.notes,
          items: existing.items,
        }
      });
      
      const htmlBody = `
        <h2>Hello ${existing.lead.name},</h2>
        <p>A new proposal (<strong>${proposal.title}</strong>) has been prepared for you.</p>
        <p>You can view and approve the proposal using the secure link below. We have also attached a PDF copy for your convenience.</p>
        <br/>
        <a href="${link}" style="display:inline-block;background:#3b82f6;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">View Proposal</a>
        <br/><br/>
        <p style="color:#666;font-size:12px;">Powered by Grekam Visuals</p>
      `;

      await sendEmail(existing.lead.email, {
        subject: `New Proposal: ${proposal.title}`,
        html: htmlBody,
        attachments: [{
          filename: `Proposal-${proposal.title.replace(/[^a-z0-9]/gi, '_')}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }]
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
        discountRate: original.discountRate,
        taxRate: original.taxRate,
        tax: original.tax,
        items: {
          create: original.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            unit: item.unit,
            discountRate: item.discountRate,
            taxRate: item.taxRate,
            total: item.total,
          })),
        },
      },
      include: { items: true },
    });
    reply.code(201);
    return duplicate;
  });

  // POST /api/v1/crm/proposals/:id/template — mark as template
  app.post('/proposals/:id/template', async (req, reply) => {
    const { id } = req.params as { id: string };
    const proposal = await app.prisma.proposal.update({
      where: { id },
      data: { isTemplate: true },
    });
    return proposal;
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

    if (proposal.lead?.email) {
      const { sendEmail, EmailTemplates } = await import('../integrations/email.service');
      await sendEmail(proposal.lead.email, EmailTemplates.proposalApproved(proposal.lead.name || 'Client', proposal.title));
    }

    return { success: true, data: proposal };
  });
}
