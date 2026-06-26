import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { EventBus, SystemEvents } from '../automations/event-bus';

const LeadSourceValues = ['WEBSITE', 'WHATSAPP', 'REFERRAL', 'COLD_OUTREACH', 'INSTAGRAM', 'LINKEDIN', 'ACADEMY_ALUMNI', 'OTHER'] as const;

const CreateLeadSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  company: z.string().optional(),
  source: z.enum(LeadSourceValues),
  estimatedBudget: z.number().optional(),
  projectType: z.string().optional(),
  notes: z.string().optional(),
  businessUnit: z.enum(['AGENCY', 'ACADEMY']).optional().default('AGENCY'),
  courseInterest: z.string().optional(),
  batchId: z.string().optional(),
});

function calculateScore(budget?: number, source?: string, projectType?: string, businessUnit?: string): number {
  let score = 0;
  if (businessUnit === 'ACADEMY') {
    const highValueSources = ['REFERRAL', 'ACADEMY_ALUMNI'];
    if (source && highValueSources.includes(source)) score += 40;
    else if (source) score += 20;
    score += 40; // baseline
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

export default async function publicLeadsRouter(app: FastifyInstance) {
  // POST /api/v1/crm/public/leads — public lead creation (e.g. from website contact form)
  app.post('/leads', async (req, reply) => {
    const body = CreateLeadSchema.parse(req.body);
    const score = calculateScore(body.estimatedBudget, body.source, body.projectType, body.businessUnit);

    const lead = await app.prisma.lead.create({
      data: { ...body, score },
    });

    // Autopilot Trigger
    if (lead.businessUnit === 'ACADEMY') {
      EventBus.emit(SystemEvents.ACADEMY_ENQUIRY_RECEIVED, lead);
    } else {
      EventBus.emit(SystemEvents.LEAD_CREATED, lead);
    }

    // Real-Time Notification Broadcast
    try {
      (app as any).broadcast('telemetry-event', {
        event: 'New Lead Ingested',
        data: {
          id: lead.id,
          name: lead.name,
          source: lead.source,
          businessUnit: lead.businessUnit,
          score: lead.score,
        }
      });
    } catch (err) {
      app.log.error(err as any, '[Public CRM Webhook] Broadcast failed');
    }

    reply.code(201);
    return lead;
  });
}
