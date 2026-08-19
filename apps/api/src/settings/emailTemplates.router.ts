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
    code: 'INVOICE_DUE_SOON',
    name: 'Payment Reminder: 3 Days Before Due',
    category: 'CLIENT',
    subject: 'Upcoming Payment Reminder: Invoice #{{invoiceNumber}} due in 3 days',
    bodyHtml: `<p>Hi <strong>{{clientName}}</strong>,</p>
<p>This is a friendly reminder that invoice <strong>#{{invoiceNumber}}</strong> for <strong>{{projectName}}</strong> is due in 3 days on <strong>{{dueDate}}</strong>.</p>
<p><strong>Total Amount Due:</strong> ₹{{amount}}</p>
<div class="button-container">
  <a href="{{invoiceUrl}}" class="btn-primary">Pay Invoice Now</a>
</div>
<p>If you have already processed this payment, please disregard this notice.</p>`,
    variables: ['clientName', 'invoiceNumber', 'projectName', 'amount', 'dueDate', 'invoiceUrl'],
  },
  {
    code: 'INVOICE_DUE_TODAY',
    name: 'Payment Reminder: Invoice Due Today',
    category: 'CLIENT',
    subject: 'Action Required: Invoice #{{invoiceNumber}} is due today — ₹{{amount}}',
    bodyHtml: `<p>Hi <strong>{{clientName}}</strong>,</p>
<p>Your invoice <strong>#{{invoiceNumber}}</strong> for <strong>{{projectName}}</strong> is due today, <strong>{{dueDate}}</strong>.</p>
<p><strong>Amount Payable:</strong> ₹{{amount}}</p>
<div class="button-container">
  <a href="{{invoiceUrl}}" class="btn-primary">Complete Payment</a>
</div>
<p>Click the link above to make a quick online payment via UPI, Credit Card, or Net Banking.</p>`,
    variables: ['clientName', 'invoiceNumber', 'projectName', 'amount', 'dueDate', 'invoiceUrl'],
  },
  {
    code: 'INVOICE_OVERDUE_GENTLE',
    name: 'Payment Reminder: 3 Days Overdue',
    category: 'CLIENT',
    subject: 'Payment Overdue: Invoice #{{invoiceNumber}} (3 Days Overdue)',
    bodyHtml: `<p>Hi <strong>{{clientName}}</strong>,</p>
<p>We haven't received payment for invoice <strong>#{{invoiceNumber}}</strong> (₹{{amount}}), which was due on <strong>{{dueDate}}</strong>.</p>
<p>If you experienced any billing issues or need assistance, please let us know so we can help:</p>
<div class="button-container">
  <a href="{{invoiceUrl}}" class="btn-primary">Settle Invoice Online</a>
</div>
<p>Thank you for your prompt attention to this matter.</p>`,
    variables: ['clientName', 'invoiceNumber', 'projectName', 'amount', 'dueDate', 'invoiceUrl'],
  },
  {
    code: 'INVOICE_OVERDUE_URGENT',
    name: 'Payment Reminder: 7 Days Overdue (Urgent)',
    category: 'CLIENT',
    subject: '[URGENT] Overdue Notice: Invoice #{{invoiceNumber}} — Action Required',
    bodyHtml: `<p>Dear <strong>{{clientName}}</strong>,</p>
<p>Invoice <strong>#{{invoiceNumber}}</strong> for <strong>{{projectName}}</strong> is now <strong>7 days overdue</strong>.</p>
<p><strong>Outstanding Balance:</strong> ₹{{amount}}<br>
<strong>Original Due Date:</strong> {{dueDate}}</p>
<p>To avoid any disruption to ongoing project milestones, please settle the outstanding balance immediately:</p>
<div class="button-container">
  <a href="{{invoiceUrl}}" class="btn-primary">Pay Outstanding Balance</a>
</div>
<p>If you have questions regarding this payment, please contact your account manager directly.</p>`,
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
    code: 'TASK_DUE_SOON',
    name: 'Task Reminder: 24 Hours Before Deadline',
    category: 'STAFF',
    subject: '⏰ Deadline Warning: Task "{{taskTitle}}" is due in 24 hours',
    bodyHtml: `<p>Hello <strong>{{staffName}}</strong>,</p>
<p>This is a reminder that task <strong>"{{taskTitle}}"</strong> on project <strong>{{projectName}}</strong> is due tomorrow on <strong>{{dueDate}}</strong>.</p>
<p><strong>Priority:</strong> {{priority}}</p>
<div class="button-container">
  <a href="{{taskUrl}}" class="btn-primary">Update Task Status</a>
</div>
<p>Please log your progress or notify your project manager if you need additional assistance.</p>`,
    variables: ['staffName', 'projectName', 'taskTitle', 'priority', 'dueDate', 'taskUrl'],
  },
  {
    code: 'TASK_OVERDUE_ALERT',
    name: 'Task Overdue Alert',
    category: 'STAFF',
    subject: '🚨 Overdue Alert: Task "{{taskTitle}}" is past due date',
    bodyHtml: `<p>Hello <strong>{{staffName}}</strong>,</p>
<p>The following assigned task is currently overdue:</p>
<p><strong>Task:</strong> {{taskTitle}}<br>
<strong>Project:</strong> {{projectName}}<br>
<strong>Original Due Date:</strong> {{dueDate}}<br>
<strong>Priority:</strong> {{priority}}</p>
<div class="button-container">
  <a href="{{taskUrl}}" class="btn-primary">Complete Task Now</a>
</div>
<p>Please update the task status or request a deadline extension in the portal.</p>`,
    variables: ['staffName', 'projectName', 'taskTitle', 'priority', 'dueDate', 'taskUrl'],
  },
  {
    code: 'DAILY_STAFF_DIGEST',
    name: 'Daily Morning Staff Briefing',
    category: 'STAFF',
    subject: '☀️ Daily Workspace Briefing for {{todayDate}}',
    bodyHtml: `<p>Good morning <strong>{{staffName}}</strong>!</p>
<p>Here is your daily task summary for today, {{todayDate}}:</p>
<ul>
  <li><strong>Pending Tasks Due Today:</strong> {{pendingTasksCount}}</li>
  <li><strong>Assigned Leads to Call:</strong> {{leadsToCallCount}}</li>
  <li><strong>Open High Priority Tickets:</strong> {{highPriorityTickets}}</li>
</ul>
<div class="button-container">
  <a href="{{dashboardLink}}" class="btn-primary">Open Workspace Briefing</a>
</div>
<p>Have a productive day!</p>`,
    variables: ['staffName', 'todayDate', 'pendingTasksCount', 'leadsToCallCount', 'highPriorityTickets', 'dashboardLink'],
  },
  {
    code: 'LEAVE_STATUS_STAFF',
    name: 'Leave Request Status Notice',
    category: 'STAFF',
    subject: 'Leave Request Update: {{leaveStatus}} ({{startDate}} to {{endDate}})',
    bodyHtml: `<p>Hello <strong>{{staffName}}</strong>,</p>
<p>Your leave request for <strong>{{leaveType}}</strong> ({{startDate}} to {{endDate}}) has been marked as <strong>{{leaveStatus}}</strong>.</p>
<p><strong>Approver Notes:</strong> {{approverNotes}}</p>
<div class="button-container">
  <a href="{{hrLink}}" class="btn-primary">View Attendance & Leaves</a>
</div>`,
    variables: ['staffName', 'leaveType', 'startDate', 'endDate', 'leaveStatus', 'approverNotes', 'hrLink'],
  },
  {
    code: 'PAYSLIP_GENERATED',
    name: 'Monthly Payslip Notice',
    category: 'STAFF',
    subject: 'Salary Payslip Issued for {{monthYear}}',
    bodyHtml: `<p>Hello <strong>{{staffName}}</strong>,</p>
<p>Your salary payslip for <strong>{{monthYear}}</strong> has been generated and is now available in your employee portal.</p>
<p><strong>Net Salary:</strong> ₹{{netPay}}<br>
<strong>Payment Date:</strong> {{paymentDate}}</p>
<div class="button-container">
  <a href="{{payslipUrl}}" class="btn-primary">Download Payslip PDF</a>
</div>`,
    variables: ['staffName', 'monthYear', 'netPay', 'paymentDate', 'payslipUrl'],
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
    code: 'FEE_REMINDER_STUDENT',
    name: 'Student Fee Installment Due Alert',
    category: 'STUDENT',
    subject: 'Fee Installment Reminder: {{courseName}} (Due: {{dueDate}})',
    bodyHtml: `<p>Dear <strong>{{studentName}}</strong> (Roll No: {{rollNo}}),</p>
<p>This is a reminder regarding your upcoming fee installment for <strong>{{courseName}}</strong>.</p>
<p><strong>Installment Amount:</strong> ₹{{amount}}<br>
<strong>Due Date:</strong> {{dueDate}}</p>
<div class="button-container">
  <a href="{{feePortalLink}}" class="btn-primary">Pay Installment Online</a>
</div>
<p>Thank you for keeping your tuition payments up to date.</p>`,
    variables: ['studentName', 'rollNo', 'courseName', 'amount', 'dueDate', 'feePortalLink'],
  },
  {
    code: 'ATTENDANCE_WARNING_STUDENT',
    name: 'Student Low Attendance Alert',
    category: 'STUDENT',
    subject: '⚠️ Academic Notice: Attendance Alert for {{courseName}} ({{attendancePercentage}}%)',
    bodyHtml: `<p>Dear <strong>{{studentName}}</strong>,</p>
<p>Your current attendance in <strong>{{courseName}}</strong> (Batch: {{batchName}}) is currently at <strong>{{attendancePercentage}}%</strong>, which is below the required 75% minimum threshold.</p>
<p><strong>Classes Attended:</strong> {{attendedClasses}} / {{totalClasses}}</p>
<div class="button-container">
  <a href="{{attendanceLink}}" class="btn-primary">Check Attendance Record</a>
</div>
<p>Please discuss with your course educator to make up for missed sessions.</p>`,
    variables: ['studentName', 'courseName', 'batchName', 'attendancePercentage', 'attendedClasses', 'totalClasses', 'attendanceLink'],
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
      todayDate: new Date().toLocaleDateString(),
      pendingTasksCount: '4',
      leadsToCallCount: '7',
      highPriorityTickets: '2',
      dashboardLink: 'https://garage.grekam.in/dashboard',
      leaveType: 'Casual Leave',
      endDate: 'Aug 24, 2026',
      leaveStatus: 'APPROVED',
      approverNotes: 'Approved by Operations Manager',
      hrLink: 'https://garage.grekam.in/dashboard/hr',
      monthYear: 'August 2026',
      netPay: '65,000',
      paymentDate: 'Aug 31, 2026',
      payslipUrl: 'https://garage.grekam.in/dashboard/hr/payslips',
      feePortalLink: 'https://academy.grekam.in/dashboard/fees',
      attendancePercentage: '68',
      attendedClasses: '17',
      totalClasses: '25',
      attendanceLink: 'https://academy.grekam.in/dashboard/attendance',
    };

    const rendered = renderEmailTemplate(template.bodyHtml, template.subject, sampleData);

    return {
      success: true,
      recipient: user.email,
      rendered,
    };
  });
}
