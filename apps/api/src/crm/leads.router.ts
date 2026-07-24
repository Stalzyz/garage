import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { EventBus, SystemEvents } from '../automations/event-bus';

const LeadStatusValues = ['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST', 'ENQUIRY', 'COUNSELLING', 'TRIAL', 'ENROLLED_ACADEMY', 'DROPPED'] as const;
const LeadSourceValues = ['WEBSITE', 'WHATSAPP', 'REFERRAL', 'COLD_OUTREACH', 'INSTAGRAM', 'LINKEDIN', 'ACADEMY_ALUMNI', 'OTHER'] as const;

const CreateLeadSchema = z.object({
  name: z.string().min(1),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  phone: z.union([z.string(), z.literal("")]).optional(),
  company: z.string().optional(),
  source: z.enum(LeadSourceValues).optional().default('WEBSITE'),
  status: z.enum(LeadStatusValues).optional(),
  estimatedBudget: z.number().optional(),
  projectType: z.string().optional(),
  notes: z.string().optional(),
  assignedToId: z.union([z.string(), z.literal("")]).optional().transform(val => val === "" ? undefined : val),
  businessUnit: z.enum(['AGENCY', 'ACADEMY']).optional(),
  courseInterest: z.string().optional(),
  batchId: z.string().optional(),
});

const UpdateLeadSchema = CreateLeadSchema.partial().extend({
  status: z.enum(LeadStatusValues).optional(),
  lostReason: z.string().optional(),
});

const AddActivitySchema = z.object({
  type: z.enum(['CALL', 'EMAIL', 'WHATSAPP', 'MEETING', 'NOTE']),
  content: z.string().min(1),
});

// Simple lead scoring: budget × 0.4 + source × 0.3 + projectType × 0.3
function calculateScore(budget?: number, source?: string, projectType?: string, businessUnit?: string): number {
  let score = 0;
  if (businessUnit === 'ACADEMY') {
    const highValueSources = ['REFERRAL', 'ACADEMY_ALUMNI'];
    if (source && highValueSources.includes(source)) score += 40;
    else if (source) score += 20;
    score += 40; // baseline for academy interest
    return Math.min(score, 100);
  }
  if (budget) {
    if (budget >= 500000) score += 40;
    else if (budget >= 100000) score += 30;
    else if (budget >= 50000) score += 20;
    else score += 10;
  }
  const highValueSources = ['REFERRAL', 'ALUMNI', 'EVENT', 'ACADEMY_ALUMNI'];
  if (source && highValueSources.includes(source)) score += 30;
  else if (source) score += 15;
  if (projectType) score += 30;
  return Math.min(score, 100);
}

export default async function leadsRouter(app: FastifyInstance) {
  // GET /api/v1/crm/leads — list all leads with optional filters
  app.get('/leads', async (req, reply) => {
    const { status, assignedToId, search, businessUnit } = req.query as {
      status?: string;
      assignedToId?: string;
      search?: string;
      businessUnit?: string;
    };

    const leads = await app.prisma.lead.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(assignedToId && { assignedToId }),
        ...(businessUnit && { businessUnit }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
            { company: { contains: search, mode: 'insensitive' } },
            { courseInterest: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        activities: { orderBy: { createdAt: 'desc' }, take: 3 },
        proposals: { select: { id: true, status: true, totalAmount: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return { data: leads, total: leads.length };
  });

  // GET /api/v1/crm/leads/:id — get single lead with full history
  app.get('/leads/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const lead = await app.prisma.lead.findUnique({
      where: { id },
      include: {
        activities: { orderBy: { createdAt: 'desc' } },
        proposals: { include: { items: true } },
      },
    });
    if (!lead) return reply.notFound('Lead not found');
    return lead;
  });

  // POST /api/v1/crm/leads — create lead
  app.post('/leads', async (req, reply) => {
    const body = CreateLeadSchema.parse(req.body);

    const cleanEmail = body.email && body.email.trim() !== '' ? body.email.trim() : undefined;
    const cleanPhone = body.phone && body.phone.trim() !== '' ? body.phone.trim() : undefined;

    const score = calculateScore(body.estimatedBudget, body.source, body.projectType, body.businessUnit);

    const lead = await app.prisma.lead.create({
      data: { 
        ...body, 
        email: cleanEmail,
        phone: cleanPhone,
        source: body.source || 'WEBSITE',
        status: body.status || (body.businessUnit === 'ACADEMY' ? 'ENQUIRY' : 'NEW'),
        score 
      },
    });
    
    // Autopilot Trigger
    if (lead.businessUnit === 'ACADEMY') {
      EventBus.emit(SystemEvents.ACADEMY_ENQUIRY_RECEIVED, lead);
    } else {
      EventBus.emit(SystemEvents.LEAD_CREATED, lead);
    }
    
    reply.code(201);
    return lead;
  });

  // PATCH /api/v1/crm/leads/:id — update lead / move stage
  app.patch('/leads/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    
    const originalLead = await app.prisma.lead.findUnique({ where: { id } });
    if (!originalLead) return reply.notFound('Lead not found');

    const body = UpdateLeadSchema.parse(req.body);
    const score = calculateScore(
      body.estimatedBudget ?? originalLead.estimatedBudget ?? undefined,
      body.source ?? originalLead.source,
      body.projectType ?? originalLead.projectType ?? undefined,
      body.businessUnit ?? originalLead.businessUnit
    );

    const lead = await app.prisma.lead.update({
      where: { id },
      data: { ...body, score },
    });

    // Check if status changed
    if (body.status && body.status !== originalLead.status) {
      if (lead.businessUnit === 'ACADEMY') {
        if (body.status === 'TRIAL') {
          EventBus.emit(SystemEvents.ACADEMY_TRIAL_SCHEDULED, lead);
        }
      }
    }
    return lead;
  });

  // DELETE /api/v1/crm/leads/:id
  app.delete('/leads/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    await app.prisma.lead.delete({ where: { id } });
    reply.code(204);
  });

  // POST /api/v1/crm/leads/:id/activities — log activity
  app.post('/leads/:id/activities', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = AddActivitySchema.parse(req.body);

    const activity = await app.prisma.leadActivity.create({
      data: {
        leadId: id,
        type: body.type,
        content: body.content,
        userId: req.user?.id || 'system',
      },
    });
    reply.code(201);
    return activity;
  });

  // GET /api/v1/crm/leads/stats — pipeline stats
  app.get('/leads/stats', async (req, reply) => {
    const { businessUnit } = req.query as { businessUnit?: string };
    const grouped = await app.prisma.lead.groupBy({
      by: ['status'],
      where: {
        ...(businessUnit && { businessUnit }),
      },
      _count: { id: true },
      _sum: { estimatedBudget: true },
    });
    return grouped.map(g => ({
      status: g.status,
      count: g._count.id,
      totalBudget: g._sum.estimatedBudget ?? 0,
    }));
  });

  // POST /api/v1/crm/leads/import — import leads from CSV
  app.post('/leads/import', async (req, reply) => {
    const { csvData, businessUnit } = req.body as { csvData: string; businessUnit?: string };
    if (!csvData) return reply.badRequest('Missing CSV data');

    const Papa = require('papaparse');
    const parsed = Papa.parse(csvData, { header: true, skipEmptyLines: true });

    if (parsed.errors && parsed.errors.length > 0) {
      return reply.badRequest(`CSV Parse Error: ${parsed.errors[0].message}`);
    }

    const rows = parsed.data;
    let successCount = 0;

    for (const row of rows) {
      try {
        const name = row.name || row.Name || row.contactName || row.firstName || row.first_name;
        if (!name) continue;

        const email = row.email || row.Email;
        const phone = row.phone || row.Phone;
        const source = row.source || row.Source || 'OTHER';
        const notes = row.notes || row.Notes;
        const bu = businessUnit || row.businessUnit || row.BusinessUnit || 'AGENCY';

        const leadData: any = {
          name,
          email: email || undefined,
          phone: phone || undefined,
          source: source as any,
          notes: notes || undefined,
          businessUnit: bu,
        };

        if (bu === 'ACADEMY') {
          leadData.courseInterest = row.courseInterest || row.CourseInterest;
          leadData.batchId = row.batchId || row.BatchId;
        } else {
          leadData.company = row.company || row.Company;
          leadData.estimatedBudget = row.estimatedBudget ? parseFloat(row.estimatedBudget) : undefined;
          leadData.projectType = row.projectType || row.ProjectType;
        }

        leadData.score = calculateScore(leadData.estimatedBudget, leadData.source, leadData.projectType, leadData.businessUnit);

        await app.prisma.lead.create({ data: leadData });
        successCount++;
      } catch (err) {
        console.error('Failed to import lead row:', row, err);
      }
    }

    return { success: true, count: successCount };
  });
}
