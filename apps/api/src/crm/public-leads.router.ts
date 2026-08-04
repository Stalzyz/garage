import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { EventBus, SystemEvents } from '../automations/event-bus';
import { sendEmail, contactConfirmationTemplate, newLeadNotificationTemplate } from '../integrations/email.service';

const CC_EMAIL = 'greeksacademy@gmail.com';

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

    // 1. Create the lead
    const lead = await app.prisma.lead.create({
      data: { 
        ...body, 
        score,
        status: body.businessUnit === 'ACADEMY' ? 'ENQUIRY' : 'NEW'
      },
    });

    // 2. Upsert into CRM contacts so this person shows up in the contacts list
    try {
      if (body.email) {
          const nameParts = body.name.split(' ');
          const firstName = nameParts[0] || 'Unknown';
          const lastName = nameParts.slice(1).join(' ') || '';

          await (app.prisma as any).contact.upsert({
            where: { email: body.email },
            update: {
              firstName,
              lastName,
              phone: body.phone,
            },
            create: {
              firstName,
              lastName,
              email: body.email,
              phone: body.phone,
            },
          }).catch((err: any) => {
            // Contact model may differ — log and continue
            app.log.warn(err, '[PublicLeads] Could not upsert contact');
          });
      }
    } catch (err) {
      app.log.error(err as any, '[PublicLeads] Contact upsert failed');
    }

    // 3. Send emails
    try {
      // Get admin email from organization settings
      const org = await app.prisma.organization.findFirst();
      const adminEmail = 'greeksacademy@gmail.com';
      const orgEmail = org?.supportEmail;

      // Send admin notification to greeksacademy@gmail.com always
      const recipients = [adminEmail];
      if (orgEmail && orgEmail !== adminEmail) recipients.push(orgEmail);

      // Send admin notification
      await sendEmail(
        recipients[0],
        newLeadNotificationTemplate(body),
        recipients.length > 1 ? { cc: recipients[1] } : undefined
      ).catch(err => app.log.error(err, '[PublicLeads] Failed to send admin notification'));

      // Send confirmation email to submitter
      if (body.email) {
        await sendEmail(
          body.email,
          contactConfirmationTemplate(body.name, body.notes),
          { cc: adminEmail }
        ).catch(err => app.log.error(err, '[PublicLeads] Failed to send client confirmation'));
        
        app.log.info(`[PublicLeads] Confirmation email sent to ${body.email}, CC: ${adminEmail}`);
      }
    } catch (err) {
      // Never fail the request because of email — log and move on
      app.log.error(err as any, '[PublicLeads] Confirmation email failed');
    }

    // 4. Autopilot Trigger
    if (lead.businessUnit === 'ACADEMY') {
      EventBus.emit(SystemEvents.ACADEMY_ENQUIRY_RECEIVED, lead);
    } else {
      EventBus.emit(SystemEvents.LEAD_CREATED, lead);
    }

    // 5. Real-Time Notification Broadcast
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


