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
  businessUnit: z.preprocess((val) => (val === 'ACADEMY' ? 'ACADEMY' : val === 'BOTH' ? 'BOTH' : 'AGENCY'), z.enum(['AGENCY', 'ACADEMY', 'BOTH'])).default('AGENCY'),
  courseInterest: z.string().optional(),
  batchId: z.string().optional(),
  ref: z.string().optional(), // Referral code (employeeCode)
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

    // Check for referrer
    let referredById: string | null = null;
    if (body.ref) {
      const employee = await app.prisma.employee.findUnique({
        where: { employeeCode: body.ref }
      });
      if (employee) {
        referredById = employee.id;
      }
    }

    // 1. Create the lead
    const { ref, ...leadData } = body;
    const lead = await app.prisma.lead.create({
      data: { 
        ...leadData, 
        score,
        status: body.businessUnit === 'ACADEMY' ? 'ENQUIRY' : 'NEW',
        referredById
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

  // POST /api/v1/crm/public/companies — B2B Kiosk company onboarding & GST registration
  app.post('/companies', async (req, reply) => {
    const body = z.object({
      name: z.string().min(1),
      legalName: z.string().optional().nullable(),
      tradeName: z.string().optional().nullable(),
      gstin: z.string().optional().nullable(),
      pan: z.string().optional().nullable(),
      gstType: z.string().optional().nullable(),
      placeOfSupply: z.string().optional().nullable(),
      stateCode: z.string().optional().nullable(),
      state: z.string().optional().nullable(),
      billingAddress: z.string().optional().nullable(),
      city: z.string().optional().nullable(),
      pinCode: z.string().optional().nullable(),
      website: z.string().optional().nullable(),
      industry: z.string().optional().nullable(),
      contactName: z.string().optional().nullable(),
      contactDesignation: z.string().optional().nullable(),
      contactPhone: z.string().optional().nullable(),
      contactEmail: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
    }).parse(req.body);

    // 1. Create the company record
    const company = await app.prisma.company.create({
      data: {
        name: body.name.trim(),
        legalName: body.legalName?.trim() || null,
        tradeName: body.tradeName?.trim() || null,
        gstin: body.gstin?.trim() || null,
        pan: body.pan?.trim() || null,
        gstType: body.gstType || 'REGULAR',
        placeOfSupply: body.placeOfSupply || null,
        stateCode: body.stateCode || null,
        state: body.state || null,
        billingAddress: body.billingAddress?.trim() || null,
        city: body.city?.trim() || null,
        pinCode: body.pinCode?.trim() || null,
        website: body.website?.trim() || null,
        industry: body.industry || null,
      }
    });

    // 2. Create or link primary representative contact if provided
    let contact = null;
    if (body.contactName || body.contactEmail || body.contactPhone) {
      const nameParts = (body.contactName || 'Representative').trim().split(' ');
      const firstName = nameParts[0] || 'Representative';
      const lastName = nameParts.slice(1).join(' ') || '';

      try {
        if (body.contactEmail) {
          contact = await (app.prisma as any).contact.upsert({
            where: { email: body.contactEmail.trim().toLowerCase() },
            update: {
              firstName,
              lastName,
              phone: body.contactPhone?.trim() || null,
              jobTitle: body.contactDesignation?.trim() || null,
              companyId: company.id,
            },
            create: {
              firstName,
              lastName,
              email: body.contactEmail.trim().toLowerCase(),
              phone: body.contactPhone?.trim() || null,
              jobTitle: body.contactDesignation?.trim() || null,
              companyId: company.id,
            },
          });
        } else {
          contact = await (app.prisma as any).contact.create({
            data: {
              firstName,
              lastName,
              phone: body.contactPhone?.trim() || null,
              jobTitle: body.contactDesignation?.trim() || null,
              companyId: company.id,
            },
          });
        }
      } catch (err) {
        app.log.warn(err, '[PublicCompanies] Failed to create representative contact');
      }
    }

    // 3. Real-Time Telemetry Broadcast
    try {
      (app as any).broadcast('telemetry-event', {
        event: 'New Company Onboarded',
        data: {
          id: company.id,
          name: company.name,
          gstin: company.gstin,
          contactName: body.contactName,
          phone: body.contactPhone,
        }
      });
    } catch (err) {
      app.log.error(err as any, '[PublicCompanies] Telemetry broadcast failed');
    }

    reply.code(201);
    return {
      success: true,
      message: 'Company particulars and tax profile registered successfully',
      company,
      contact,
    };
  });
}


