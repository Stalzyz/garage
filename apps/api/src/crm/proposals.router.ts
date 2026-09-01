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
        contact: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, company: { select: { name: true } } } },
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
        contact: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, company: { select: { name: true } } } },
      },
    });
    
    if (!proposal) return reply.notFound('Proposal not found');

    const financeSettings = await app.prisma.financeSettings.findFirst();

    const { getBrandConfig } = await import('../utils/brand');
    const brand = await getBrandConfig(app, 'AGENCY');

    const clientName = proposal.contact ? `${proposal.contact.firstName} ${proposal.contact.lastName}` : (proposal.lead?.name || 'Valued Client');
    const clientCompany = proposal.contact?.company?.name || proposal.lead?.company || '';
    const clientEmail = proposal.contact?.email || proposal.lead?.email || '';
    const clientPhone = proposal.contact?.phone || proposal.lead?.phone || '';

    const pdfBuffer = await generateProposalPDF({
      brand,
      proposal: {
        id: proposal.id,
        title: proposal.title,
        clientName,
        clientCompany,
        clientEmail,
        clientPhone,
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

  // POST /api/v1/crm/proposals/generate — AI Proposal Architect with Website Audit & Scope Engine (Powered by Gemini 2.0 Flash)
  app.post('/proposals/generate', async (req, reply) => {
    const { 
      title, 
      websiteUrl, 
      industry, 
      clientName, 
      scopeGoal, 
      budgetTier = 'growth', 
      items 
    } = req.body as { 
      title?: string; 
      websiteUrl?: string; 
      industry?: string; 
      clientName?: string; 
      scopeGoal?: string; 
      budgetTier?: string; 
      items?: any[]; 
    };
    
    try {
      const { getGeminiApiKey, generateJsonFromGemini } = await import('../utils/gemini');

      // 1. Scrape basic website metadata if websiteUrl provided
      let websiteContext = "";
      if (websiteUrl && websiteUrl.trim()) {
        try {
          const rawUrl = websiteUrl.startsWith('http') ? websiteUrl.trim() : `https://${websiteUrl.trim()}`;
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3500);
          const siteRes = await fetch(rawUrl, {
            signal: controller.signal,
            headers: {
              "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 GrekamAuditor/1.0"
            }
          });
          clearTimeout(timeout);
          if (siteRes.ok) {
            const html = await siteRes.text();
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
                              html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
            const siteTitle = titleMatch ? titleMatch[1].trim() : "";
            const siteDesc = descMatch ? descMatch[1].trim() : "";
            websiteContext = `Target Website: ${rawUrl}\nSite Title: ${siteTitle}\nSite Description: ${siteDesc}`;
          }
        } catch (e: any) {
          websiteContext = `Target Website: ${websiteUrl} (Live scrape timed out; generate based on provided brief)`;
        }
      }

      const systemPrompt = `You are the Lead Digital Solutions Architect & Sales Director at "Grekam Agency" (part of Grekam Visuals & Grekam OS).
Grekam is an elite engineering agency known for:
- Bespoke High-Performance Web Platforms (Next.js 16, Turbopack, TailwindCSS, Headless Architecture)
- AI & CRM Automation Suites (Custom WhatsApp Bots via Grafty AI, Automated Lead Pipelines, ERP Sync)
- Ultra-Fast E-Commerce Infrastructure (Razorpay/Stripe, Sub-800ms page transitions, Luxury UI/UX)
- Notable Live Case Studies: Raaghas Luxury E-Commerce (raaghas.in), Grafty WhatsApp AI Engine (grafty.pro), Grekam FM Studio (fm.grekam.in).

Your goal: Craft a compelling, technical, high-converting enterprise proposal that diagnoses the client's current pain points, proposes a multi-phase architectural roadmap, and delivers realistic milestone line items with Indian Rupee (INR) pricing.

IMPORTANT RULES:
- Write the "content" field as clean, professional HTML. Use <h2>, <h3>, <p>, <ul>, <li>, <strong>, <em> tags only. Never use markdown.
- Be specific to the client's industry and goals. Reference real pain points.
- Each phase item should have a clear business outcome, not just technical jargon.
- Keep the tone confident, premium, and results-driven.

Return ONLY a valid JSON object matching this schema exactly:
{
  "title": "Descriptive, high-impact proposal title personalized to the client",
  "content": "<h2>1. Executive Summary & Problem Diagnosis</h2><p>...</p><h2>2. Architectural Solution & Scope</h2><p>...</p><h2>3. Deliverables & Milestones</h2><ul><li>...</li></ul><h2>4. Expected ROI & Technical SLAs</h2><p>...</p>",
  "items": [
    {
      "name": "Phase 1: Milestone Name",
      "description": "Clear explanation of deliverables and business value in this milestone",
      "quantity": 1,
      "unitPrice": 25000,
      "discountRate": 0,
      "taxRate": 18,
      "total": 29500
    }
  ],
  "timelineWeeks": 4,
  "keyMetrics": ["Metric 1", "Metric 2", "Metric 3"]
}`;

      const userPrompt = `Generate a detailed enterprise proposal for:
Client / Company Name: ${clientName || 'Valued Client'}
Industry / Niche: ${industry || 'Digital Technology & Commerce'}
Proposal Focus / Title: ${title || 'Fullstack Digital Ecosystem Overhaul'}
Client Goals & Pain Points: ${scopeGoal || 'Rebuild outdated infrastructure, automate lead pipelines, improve conversion speed, and scale digital sales.'}
Budget Tier: ${budgetTier} (Startup: ₹35,000–₹60,000 | Growth: ₹65,000–₹1,40,000 | Enterprise: ₹1,50,000+)
${websiteContext ? `\nClient Website Audit Data:\n${websiteContext}` : ''}
${items && items.length > 0 ? `\nRequested Line Items:\n${JSON.stringify(items)}` : ''}

Write a proposal with 3–4 phases that map directly to the client's goals. Make it feel bespoke, not generic.`;

      const apiKey = await getGeminiApiKey(app);
      let parsed: any;
      if (apiKey) {
        try {
          parsed = await generateJsonFromGemini(app, systemPrompt, userPrompt);
        } catch (geminiErr: any) {
          app.log.warn({ err: geminiErr?.message }, "Gemini AI API call failed; using fallback proposal generator.");
        }
      }

      if (!parsed) {
        const budgetMap: Record<string, { phase1: number; phase2: number; phase3: number }> = {
          startup:    { phase1: 15000, phase2: 25000, phase3: 10000 },
          growth:     { phase1: 25000, phase2: 45000, phase3: 15000 },
          enterprise: { phase1: 50000, phase2: 90000, phase3: 35000 },
        };
        const b = budgetMap[budgetTier] || budgetMap.growth;
        parsed = {
          title: `${clientName || 'Client'} — ${title || 'Digital Platform & Automation Overhaul'}`,
          content: `<h2>1. Executive Summary & Problem Diagnosis</h2><p>We propose a comprehensive digital transformation for <strong>${clientName || 'your business'}</strong> (${industry || 'Digital Technology'}). Our goal is to replace manual workflows and outdated infrastructure with a modern, high-converting digital platform.</p><h2>2. Architectural Solution</h2><p>Grekam will deploy an enterprise Next.js platform coupled with real-time CRM lead pipelines, automated WhatsApp customer engagement, and fast payment integrations.</p><h2>3. Deliverables & Scope</h2><ul><li><strong>Phase 1:</strong> Architecture Blueprint, UX Design & DB Schema</li><li><strong>Phase 2:</strong> High-Performance Full-Stack Engineering & API Integrations</li><li><strong>Phase 3:</strong> Production Rollout, Cloudflare CDN & 30-Day Support SLA</li></ul><h2>4. Expected Business ROI</h2><p>Our platforms deliver sub-800ms page transitions and automated lead capture, driving an estimated <strong>40–60% increase</strong> in conversion velocity.</p>`,
          items: [
            { name: "Phase 1: Architecture & Precision UX Blueprint", description: "Design system, stakeholder research, Figma wireframes & API schema", quantity: 1, unitPrice: b.phase1, discountRate: 0, taxRate: 18, total: Math.round(b.phase1 * 1.18) },
            { name: "Phase 2: Next.js & Full-Stack Platform Engineering", description: "Production frontend, Fastify API microservices, Razorpay/Stripe, WhatsApp CRM bot", quantity: 1, unitPrice: b.phase2, discountRate: 0, taxRate: 18, total: Math.round(b.phase2 * 1.18) },
            { name: "Phase 3: Production Rollout, CDN & 30-Day Support SLA", description: "Deployment, Core Web Vitals audit, SSL, analytics & post-launch warranty", quantity: 1, unitPrice: b.phase3, discountRate: 0, taxRate: 18, total: Math.round(b.phase3 * 1.18) },
          ],
          timelineWeeks: budgetTier === 'startup' ? 3 : budgetTier === 'enterprise' ? 8 : 5,
          keyMetrics: ["Sub-800ms Page Load Speed", "Automated CRM Lead Sync", "30-Day Post-Launch SLA"]
        };
      }

      return {
        title: parsed.title || title || "Digital Platform Proposal",
        content: parsed.content || "",
        items: Array.isArray(parsed.items) && parsed.items.length > 0 ? parsed.items : [
          { name: "Phase 1: Architecture & Precision UI/UX Design", description: "Figma design system, user journeys, DB schema", quantity: 1, unitPrice: 25000, discountRate: 0, taxRate: 18, total: 29500 },
          { name: "Phase 2: Next.js & Fullstack Platform Engineering", description: "API microservices, payment & CRM integration", quantity: 1, unitPrice: 45000, discountRate: 0, taxRate: 18, total: 53100 },
          { name: "Phase 3: Production Rollout, Cloudflare CDN & SLA", description: "Performance optimization, SEO audit, 30-day warranty", quantity: 1, unitPrice: 15000, discountRate: 0, taxRate: 18, total: 17700 }
        ],
        timelineWeeks: parsed.timelineWeeks || 4,
        keyMetrics: parsed.keyMetrics || ["Sub-800ms Page Load Time", "Automated Lead Sync", "30-Day Deployment SLA"]
      };
    } catch (error: any) {
      app.log.error({ err: error?.message }, "AI Proposal Generation Unexpected Error");
      // Fail-safe fallback to prevent 500 error on client UI
      return {
        title: title || "Digital Platform Proposal",
        content: `<h2>1. Executive Summary</h2><p>Custom proposals for ${clientName || 'Valued Client'}. Our team will architect a high-performance web platform tailored to your growth objectives.</p><h2>2. Scope of Work</h2><ul><li>Phase 1: UX Design & Technical Architecture</li><li>Phase 2: Fullstack Engineering & CRM Integrations</li><li>Phase 3: Production Deployment & 30-Day Warranty</li></ul>`,
        items: [
          { name: "Phase 1: Discovery & Architecture", description: "Design blueprint & DB schema", quantity: 1, unitPrice: 25000, discountRate: 0, taxRate: 18, total: 29500 },
          { name: "Phase 2: Fullstack Development", description: "Next.js platform & API services", quantity: 1, unitPrice: 45000, discountRate: 0, taxRate: 18, total: 53100 },
          { name: "Phase 3: Deployment & SLA", description: "Cloudflare CDN & warranty", quantity: 1, unitPrice: 15000, discountRate: 0, taxRate: 18, total: 17700 }
        ],
        timelineWeeks: 4,
        keyMetrics: ["Sub-800ms Page Speed", "Automated Lead Sync"]
      };
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

    const generatedToken = `prop_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const proposal = await app.prisma.proposal.create({
      data: {
        leadId: cleanLeadId,
        contactId: cleanContactId,
        publicToken: generatedToken,
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

  const updateProposalHandler = async (req: any, reply: any) => {
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
  };

  // PATCH & PUT /api/v1/crm/proposals/:id — update proposal or change status
  app.patch('/proposals/:id', updateProposalHandler);
  app.put('/proposals/:id', updateProposalHandler);

  app.post('/proposals/:id/send', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = (req.body as any) || {};
    
    // Generate token if it doesn't have one
    const [existing, financeSettings] = await Promise.all([
      app.prisma.proposal.findUnique({ 
        where: { id }, 
        include: { 
          lead: true, 
          items: true,
          contact: { include: { company: true } }
        } 
      }),
      app.prisma.financeSettings.findFirst()
    ]);
    
    if (!existing) return reply.notFound('Proposal not found');

    let targetContactId = existing.contactId || body.contactId || null;
    let targetLeadId = existing.leadId || body.leadId || null;
    let targetEmail = body.recipientEmail || existing.contact?.email || existing.lead?.email || null;

    // Auto-link unassigned proposals to matching contact or lead by email
    if (!targetContactId && !targetLeadId && targetEmail) {
      const matchedContact = await app.prisma.contact.findFirst({
        where: { email: { equals: targetEmail, mode: 'insensitive' } }
      });
      if (matchedContact) {
        targetContactId = matchedContact.id;
      } else {
        const matchedLead = await app.prisma.lead.findFirst({
          where: { email: { equals: targetEmail, mode: 'insensitive' } }
        });
        if (matchedLead) targetLeadId = matchedLead.id;
      }
    }

    const token = existing.publicToken || `prop_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const proposal = await app.prisma.proposal.update({
      where: { id },
      data: { 
        status: 'SENT',
        publicToken: token,
        ...(targetContactId ? { contactId: targetContactId } : {}),
        ...(targetLeadId ? { leadId: targetLeadId } : {}),
      },
      include: {
        contact: { include: { company: true } },
        lead: true,
        items: true
      }
    });

    const clientEmail = targetEmail || proposal.contact?.email || proposal.lead?.email;
    const clientName = proposal.contact ? `${proposal.contact.firstName} ${proposal.contact.lastName}` : (proposal.lead?.name || 'Client');
    const clientCompany = proposal.contact?.company?.name || proposal.lead?.company || '';
    const clientPhone = proposal.contact?.phone || proposal.lead?.phone || '';

    if (clientEmail) {
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
          clientName,
          clientCompany,
          clientEmail,
          clientPhone,
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
        <h2>Hello ${clientName},</h2>
        <p>A new proposal (<strong>${proposal.title}</strong>) has been prepared for you.</p>
        <p>You can view and approve the proposal using the secure link below. We have also attached a PDF copy for your convenience.</p>
        <br/>
        <a href="${link}" style="display:inline-block;background:#3b82f6;color:white;padding:12px 24px;text-decoration:none;border-radius:8px;font-weight:bold;">View Proposal</a>
        <br/><br/>
        <p style="color:#666;font-size:12px;">Powered by Grekam Visuals</p>
      `;

      await sendEmail(clientEmail, {
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
