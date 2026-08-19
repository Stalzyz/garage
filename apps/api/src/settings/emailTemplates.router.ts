import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { renderEmailTemplate } from '../services/emailRenderer';

export const DEFAULT_TEMPLATES = [
  {
    code: 'WELCOME_CLIENT',
    name: 'Client Welcome & Portal Invitation',
    category: 'CLIENT',
    subject: 'Welcome to Grekam, {{clientName}}!',
    bodyHtml: `<p>Hi <strong>{{clientName}}</strong>,</p>
<p>Welcome aboard! Your client portal account for <strong>{{companyName}}</strong> has been activated.</p>
<p>You can access your project briefings, milestone progress, files, and invoices directly through your portal:</p>
<div class="button-container">
  <a href="{{portalLink}}" class="btn-primary">Access Client Portal</a>
</div>
<p>If you have any questions, feel free to reply directly to this email or contact your assigned account manager.</p>
<p>Best regards,<br>The Grekam Team</p>`,
    variables: ['clientName', 'companyName', 'portalLink', 'accountManager'],
  },
  {
    code: 'INVOICE_SENT',
    name: 'New Invoice Issued',
    category: 'CLIENT',
    subject: 'New Invoice #{{invoiceNumber}} from Grekam',
    bodyHtml: `<p>Hi <strong>{{clientName}}</strong>,</p>
<p>A new invoice <strong>#{{invoiceNumber}}</strong> for <strong>{{projectName}}</strong> has been generated.</p>
<p><strong>Invoice Total:</strong> ₹{{amount}}<br>
<strong>Due Date:</strong> {{dueDate}}</p>
<div class="button-container">
  <a href="{{invoiceUrl}}" class="btn-primary">View & Pay Invoice</a>
</div>
<p>Thank you for working with Grekam!</p>`,
    variables: ['clientName', 'invoiceNumber', 'projectName', 'amount', 'dueDate', 'invoiceUrl'],
  },
  {
    code: 'PROPOSAL_SENT',
    name: 'Project Proposal Ready',
    category: 'CLIENT',
    subject: 'Project Proposal Ready: {{proposalTitle}}',
    bodyHtml: `<p>Hi <strong>{{clientName}}</strong>,</p>
<p>We have prepared your proposal for <strong>{{proposalTitle}}</strong>.</p>
<p><strong>Estimated Investment:</strong> ₹{{estimatedAmount}}</p>
<div class="button-container">
  <a href="{{proposalLink}}" class="btn-primary">Review & Accept Proposal</a>
</div>
<p>We look forward to collaborating with you!</p>`,
    variables: ['clientName', 'proposalTitle', 'estimatedAmount', 'proposalLink'],
  },
  {
    code: 'LEAD_ASSIGNED',
    name: 'New Lead Assigned to Staff',
    category: 'STAFF',
    subject: 'New Lead Assigned: {{leadName}} ({{leadSource}})',
    bodyHtml: `<p>Hello <strong>{{staffName}}</strong>,</p>
<p>A new lead has been assigned to you for telecalling/follow-up:</p>
<ul>
  <li><strong>Lead Name:</strong> {{leadName}}</li>
  <li><strong>Phone:</strong> {{phone}}</li>
  <li><strong>Email:</strong> {{email}}</li>
  <li><strong>Source:</strong> {{leadSource}}</li>
  <li><strong>Interest:</strong> {{interestTier}}</li>
</ul>
<div class="button-container">
  <a href="{{crmLink}}" class="btn-primary">View Lead in CRM</a>
</div>
<p>Please reach out within 15 minutes to maximize conversion.</p>`,
    variables: ['staffName', 'leadName', 'phone', 'email', 'leadSource', 'interestTier', 'crmLink'],
  },
  {
    code: 'TASK_ASSIGNED',
    name: 'New Task Assigned',
    category: 'STAFF',
    subject: 'Task Assigned: {{taskTitle}} [{{priority}}]',
    bodyHtml: `<p>Hello <strong>{{staffName}}</strong>,</p>
<p>You have been assigned a new task on <strong>{{projectName}}</strong>:</p>
<p><strong>Task:</strong> {{taskTitle}}<br>
<strong>Priority:</strong> {{priority}}<br>
<strong>Due Date:</strong> {{dueDate}}</p>
<div class="button-container">
  <a href="{{taskUrl}}" class="btn-primary">Open Task</a>
</div>`,
    variables: ['staffName', 'projectName', 'taskTitle', 'priority', 'dueDate', 'taskUrl'],
  },
  {
    code: 'STUDENT_ADMISSION',
    name: 'Student Admission & Passport Welcome',
    category: 'STUDENT',
    subject: 'Welcome to Grekam Academy - Roll No: {{rollNo}}',
    bodyHtml: `<p>Dear <strong>{{studentName}}</strong>,</p>
<p>Congratulations on your admission to <strong>{{courseName}}</strong> (Batch: {{batchName}})!</p>
<p><strong>Roll Number:</strong> {{rollNo}}<br>
<strong>Batch Start Date:</strong> {{startDate}}</p>
<div class="button-container">
  <a href="{{lmsLink}}" class="btn-primary">Access Academy Passport</a>
</div>
<p>Get ready to build real-world skills!</p>`,
    variables: ['studentName', 'courseName', 'batchName', 'rollNo', 'startDate', 'lmsLink'],
  },
  {
    code: 'CERTIFICATE_ISSUED',
    name: 'Course Completion Certificate',
    category: 'STUDENT',
    subject: 'Your Certificate for {{courseName}} is Ready!',
    bodyHtml: `<p>Congratulations <strong>{{studentName}}</strong>!</p>
<p>You have successfully completed <strong>{{courseName}}</strong> at Grekam Academy.</p>
<p>Your official verified certificate is ready for download and sharing on LinkedIn:</p>
<div class="button-container">
  <a href="{{certificateUrl}}" class="btn-primary">View Verified Certificate</a>
</div>
<p>Keep scaling new heights!</p>`,
    variables: ['studentName', 'courseName', 'certificateUrl', 'completionDate'],
  },
];

const UpdateTemplateSchema = z.object({
  subject: z.string().min(1),
  bodyHtml: z.string().min(1),
  isActive: z.boolean().optional(),
});

export default async function emailTemplatesRouter(app: FastifyInstance) {
  // GET /api/v1/settings/templates — List all templates (guarantees all default templates exist)
  app.get('/', async (req, reply) => {
    for (const t of DEFAULT_TEMPLATES) {
      await app.prisma.emailTemplate.upsert({
        where: { code: t.code },
        create: t,
        update: {},
      });
    }

    const templates = await app.prisma.emailTemplate.findMany({
      orderBy: [{ category: 'asc' }, { code: 'asc' }],
    });

    return { success: true, data: templates };
  });

  // GET /api/v1/settings/templates/:code
  app.get('/:code', async (req, reply) => {
    const { code } = req.params as { code: string };
    const template = await app.prisma.emailTemplate.findUnique({
      where: { code },
    });

    if (!template) {
      return reply.notFound(`Template '${code}' not found.`);
    }

    return { success: true, data: template };
  });

  // PUT /api/v1/settings/templates/:code
  app.put('/:code', async (req, reply) => {
    const { code } = req.params as { code: string };
    const body = UpdateTemplateSchema.parse(req.body);

    const updated = await app.prisma.emailTemplate.update({
      where: { code },
      data: {
        subject: body.subject,
        bodyHtml: body.bodyHtml,
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    return { success: true, data: updated };
  });

  // POST /api/v1/settings/templates/:code/test — Preview / Send test email to user
  app.post('/:code/test', async (req, reply) => {
    const { code } = req.params as { code: string };
    const user = req.user;

    const template = await app.prisma.emailTemplate.findUnique({
      where: { code },
    });

    if (!template) {
      return reply.notFound(`Template '${code}' not found.`);
    }

    // Build sample data based on variables
    const sampleData: Record<string, string> = {
      clientName: user.name || 'Jane Doe',
      companyName: 'Acme Visuals Corp',
      portalLink: 'https://garage.grekam.in/portal/dashboard',
      accountManager: 'Stalin Kumar',
      invoiceNumber: 'INV-2026-089',
      projectName: 'Website & Brand Refresh',
      amount: '45,000',
      dueDate: new Date().toLocaleDateString(),
      invoiceUrl: 'https://garage.grekam.in/portal/invoices',
      proposalTitle: 'Ecommerce Platform Redesign',
      estimatedAmount: '1,20,000',
      proposalLink: 'https://garage.grekam.in/portal/proposals',
      staffName: user.name || 'Sales Officer',
      leadName: 'Rahul Sharma',
      phone: '+91 98765 43210',
      email: 'rahul@example.com',
      leadSource: 'Google Ads',
      interestTier: 'High (Website & App)',
      crmLink: 'https://garage.grekam.in/dashboard/crm',
      taskTitle: 'Design System Figma Components',
      priority: 'HIGH',
      taskUrl: 'https://garage.grekam.in/dashboard/projects',
      studentName: user.name || 'Aarav Patel',
      courseName: 'UI/UX Design Masterclass',
      batchName: 'Batch 2026-A',
      rollNo: 'GK-2026-042',
      startDate: new Date().toLocaleDateString(),
      lmsLink: 'https://academy.grekam.in',
      certificateUrl: 'https://academy.grekam.in/verify/CERT-99201',
      completionDate: new Date().toLocaleDateString(),
    };

    const rendered = renderEmailTemplate(template.bodyHtml, template.subject, sampleData);

    return {
      success: true,
      recipient: user.email,
      rendered,
    };
  });
}
