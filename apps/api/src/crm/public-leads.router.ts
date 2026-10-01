import { defaultLeadStatus } from './lead-status';
import { FastifyInstance } from 'fastify';
import { GST_STATE_CODES } from './contacts.router';
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


const CreatePublicCompanySchema = z.object({
  name: z.string().min(1, "Company Name is required"),
  legalName: z.string().optional(),
  tradeName: z.string().optional(),
  gstin: z.string().optional(),
  pan: z.string().optional(),
  gstType: z.string().optional().default("REGULAR"),
  placeOfSupply: z.string().optional(),
  stateCode: z.string().optional(),
  state: z.string().optional(),
  billingAddress: z.string().optional(),
  shippingAddress: z.string().optional(),
  city: z.string().optional(),
  pinCode: z.string().optional(),
  country: z.string().optional().default("India"),
  website: z.string().optional(),
  industry: z.string().optional(),
  size: z.string().optional(),
  // Representative / Contact Details
  contactName: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  contactDesignation: z.string().optional(),
  notes: z.string().optional(),
});

export default async function publicLeadsRouter(app: FastifyInstance) {

  // POST /api/v1/crm/public/companies — public kiosk self-service company onboarding
  app.post('/companies', async (req, reply) => {
    const body = CreatePublicCompanySchema.parse(req.body);
    const data: any = { ...body };

    // Auto-extract PAN and State from GSTIN
    if (data.gstin && data.gstin.trim()) {
      data.gstin = data.gstin.trim().toUpperCase();
      if (!data.pan && data.gstin.length >= 12) {
        data.pan = data.gstin.substring(2, 12);
      }
      if (!data.stateCode && data.gstin.length >= 2) {
        data.stateCode = data.gstin.substring(0, 2);
      }
      if (data.stateCode && GST_STATE_CODES[data.stateCode]) {
        if (!data.state) data.state = GST_STATE_CODES[data.stateCode];
        if (!data.placeOfSupply) data.placeOfSupply = `${GST_STATE_CODES[data.stateCode]} (${data.stateCode})`;
      }
    }

    // 1. Create Company Record
    const company = await app.prisma.company.create({
      data: {
        name: data.name,
        legalName: data.legalName || data.name,
        tradeName: data.tradeName || data.name,
        gstin: data.gstin || null,
        pan: data.pan || null,
        gstType: data.gstType || "REGULAR",
        placeOfSupply: data.placeOfSupply || null,
        stateCode: data.stateCode || null,
        state: data.state || null,
        billingAddress: data.billingAddress || null,
        shippingAddress: data.shippingAddress || data.billingAddress || null,
        city: data.city || null,
        pinCode: data.pinCode || null,
        country: data.country || "India",
        website: data.website || null,
        industry: data.industry || null,
        size: data.size || "1-10",
      },
    });

    // 2. Create Primary Contact if provided
    let contact: any = null;
    if (data.contactName || data.contactPhone || data.contactEmail) {
      const parts = (data.contactName || "Representative").trim().split(" ");
      const firstName = parts[0] || "Representative";
      const lastName = parts.slice(1).join(" ") || (data.contactDesignation || "");
      try {
        contact = await app.prisma.contact.create({
          data: {
            firstName,
            lastName,
            email: data.contactEmail || null,
            phone: data.contactPhone || null,
            companyId: company.id,
            isPrimary: true,
            billingAddress: data.billingAddress || null,
            city: data.city || null,
            state: data.state || null,
            stateCode: data.stateCode || null,
            pinCode: data.pinCode || null,
            tags: ["KIOSK_ONBOARDING", data.industry || "B2B"].filter(Boolean),
          },
        });
      } catch (err: any) {
        app.log.warn(err, "[CompanyKiosk] Could not create contact");
      }
    }

    // 3. Create Corresponding Lead in CRM pipeline
    let lead: any = null;
    try {
      lead = await app.prisma.lead.create({
        data: {
          name: data.contactName || data.name,
          company: data.name,
          email: data.contactEmail || null,
          phone: data.contactPhone || null,
          source: "OTHER",
          status: "NEW",
          score: 65,
          businessUnit: "AGENCY",
          industry: data.industry || null,
          notes: `B2B Kiosk Onboarding:\nCompany: ${data.name}\nLegal: ${data.legalName || data.name}\nGSTIN: ${data.gstin || "N/A"}\nCity: ${data.city || "N/A"}\nRepresentative: ${data.contactName || "N/A"} (${data.contactDesignation || "N/A"})\nRequirements: ${data.notes || "N/A"}`,
        },
      });
    } catch (err: any) {
      app.log.warn(err, "[CompanyKiosk] Could not create lead");
    }

    // 4. Real-time Telemetry Broadcast
    try {
      (app as any).broadcast("telemetry-event", {
        event: "B2B Company Onboarded via Kiosk",
        data: {
          id: company.id,
          name: company.name,
          gstin: company.gstin,
          city: company.city,
        },
      });
    } catch {}

    const tokenNumber = `CO-${Math.floor(1000 + Math.random() * 9000)}`;

    reply.code(201);
    return {
      success: true,
      company,
      contact,
      lead,
      tokenNumber,
    };
  });

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
        status: defaultLeadStatus(body.businessUnit),
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
}


