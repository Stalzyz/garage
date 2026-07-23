import { EventBus, SystemEvents } from './event-bus';
import { EmailService } from './email.service';
import { NotificationService } from './notification.service';
import { render } from '@react-email/render';
import React from 'react';
import { whatsappService } from '../integrations/whatsapp.service';
import { CertificatesService } from '../lms/certificates.service';
import { GamificationService } from '../lms/gamification.service';
import { prisma } from '../db';

// Import Templates
import { WelcomeClientEmail } from './templates/WelcomeClient';
import { PaymentReceiptEmail } from './templates/PaymentReceipt';
import { AssignmentGradedEmail } from './templates/AssignmentGraded';
import { AcademyBrochureEmail } from './templates/AcademyBrochure';
import { TrialReminderEmail } from './templates/TrialReminder';
import { ReEngagementEmail } from './templates/ReEngagement';

export function registerGlobalListeners() {
  console.log('[Autopilot] Registering Global Event Listeners...');

  // --------------------------------------------------------------------------
  // CRM EVENTS
  // --------------------------------------------------------------------------
  EventBus.on(SystemEvents.LEAD_CREATED, async (data) => {
    console.log('[Autopilot] Caught LEAD_CREATED:', data);
    const org = await prisma.organization.findFirst();
    const adminEmail = org?.supportEmail || 'admin@grekam.com';
    await EmailService.sendEmail(adminEmail, 'New Lead Arrived!', `<h1>New Lead</h1><p>${data.name} (${data.email}) just submitted an inquiry.</p>`);

    // WhatsApp: notify sales team (if phone configured)
    if (process.env.SALES_TEAM_PHONE) {
      await whatsappService.sendTemplateMessage({
        phone: process.env.SALES_TEAM_PHONE,
        name: 'Sales Team',
        event: 'NEW_LEAD',
        templateName: 'new_lead_alert',
        variables: [data.name || 'Unknown', data.email || 'N/A'],
      });
    }
  });

  EventBus.on(SystemEvents.PROPOSAL_SIGNED, async (data) => {
    console.log('[Autopilot] Caught PROPOSAL_SIGNED:', data);
    const html = await render(React.createElement(WelcomeClientEmail, {
      clientName: data.clientName || 'Client',
      loginUrl: 'https://grekam.com/portal/login'
    }));
    await EmailService.sendEmail(data.clientEmail, 'Welcome to Grekam Visuals!', html);
  });

  // --------------------------------------------------------------------------
  // FINANCE EVENTS
  // --------------------------------------------------------------------------
  EventBus.on(SystemEvents.INVOICE_PAID, async (data) => {
    console.log('[Autopilot] Caught INVOICE_PAID:', data);
    const html = await render(React.createElement(PaymentReceiptEmail, {
      clientName: data.clientName || 'Valued Client',
      invoiceNumber: data.invoiceNumber || 'INV-000',
      amount: data.amount || '₹0',
      portalUrl: 'https://grekam.com/portal/invoices'
    }));
    await EmailService.sendEmail(data.clientEmail, 'Payment Receipt', html);

    if (data.staffId) {
      await NotificationService.createNotification(data.staffId, 'Invoice Paid', `Invoice #${data.invoiceNumber} was just paid.`, `/dashboard/finance`, 'SUCCESS');
    }

    // WhatsApp receipt to client
    if (data.clientPhone) {
      await whatsappService.sendInvoiceNotification(data.clientPhone, data.clientName, data.invoiceNumber, parseFloat(data.amount));
    }
  });

  EventBus.on(SystemEvents.INVOICE_OVERDUE, async (data) => {
    console.log('[Autopilot] Caught INVOICE_OVERDUE:', data);
    if (!data.clientEmail) return;
    await EmailService.sendEmail(
      data.clientEmail,
      `⚠️ Invoice #${data.invoiceNumber} is Overdue`,
      `<h1>Payment Reminder</h1><p>Hi ${data.clientName}, your invoice <strong>#${data.invoiceNumber}</strong> for <strong>${data.amount}</strong> was due on ${new Date(data.dueDate).toLocaleDateString()}. Please make payment at your earliest convenience.</p>`
    );
    console.log(`[Autopilot] Overdue reminder sent to ${data.clientEmail}`);
  });

  EventBus.on(SystemEvents.INVOICE_CREATED, async (data) => {
    console.log('[Autopilot] Caught INVOICE_CREATED:', data.invoiceNumber);

    // WhatsApp: notify client that a new invoice has been raised
    if (data.clientPhone) {
      await whatsappService.sendTemplateMessage({
        phone: data.clientPhone,
        name: data.clientName || 'Client',
        event: 'INVOICE_CREATED',
        templateName: 'invoice_created',
        variables: [data.clientName || 'Client', data.invoiceNumber, data.amount || '0'],
      });
    }

    // WhatsApp: notify sales / finance team internally
    if (process.env.SALES_TEAM_PHONE) {
      await whatsappService.sendTemplateMessage({
        phone: process.env.SALES_TEAM_PHONE,
        name: 'Finance Team',
        event: 'INVOICE_CREATED',
        templateName: 'new_lead_alert',
        variables: [`Invoice #${data.invoiceNumber}`, `${data.clientName} — ${data.amount}`],
      });
    }
  });

  // --------------------------------------------------------------------------
  // LMS / ACADEMY EVENTS
  // --------------------------------------------------------------------------
  EventBus.on(SystemEvents.ASSIGNMENT_GRADED, async (data) => {
    console.log('[Autopilot] Caught ASSIGNMENT_GRADED:', data);
    const html = await render(React.createElement(AssignmentGradedEmail, {
      studentName: data.studentName || 'Student',
      courseName: data.courseName || 'Course',
      score: data.score || 0,
      portalUrl: 'https://grekam.com/student/assignments'
    }));
    await EmailService.sendEmail(data.studentEmail, 'Assignment Graded', html);

    if (data.studentId) {
      await NotificationService.createNotification(data.studentId, 'Grade Updated', `Your assignment score is ${data.score}/100`, `/dashboard/lms/assignments`, 'INFO');
      
      // Award Badges via Gamification Engine
      await GamificationService.evaluateAssignmentGrade(data.studentId, data.score, data.courseName);
    }
  });

  // Academy CRM Drip Events
  EventBus.on(SystemEvents.ACADEMY_ENQUIRY_RECEIVED, async (data) => {
    console.log('[Autopilot] Caught ACADEMY_ENQUIRY_RECEIVED:', data);
    if (!data.email) return;
    const html = await render(React.createElement(AcademyBrochureEmail, {
      leadName: data.name || 'Academy Lead',
      courseInterest: data.courseInterest || undefined
    }));
    await EmailService.sendEmail(data.email, `Welcome to Grekam Academy! Course Brochure`, html);

    // WhatsApp notification to sales/counseling team
    if (process.env.SALES_TEAM_PHONE) {
      await whatsappService.sendTemplateMessage({
        phone: process.env.SALES_TEAM_PHONE,
        name: 'Counselor Team',
        event: 'ACADEMY_ENQUIRY',
        templateName: 'new_lead_alert',
        variables: [data.name || 'Unknown', data.courseInterest || 'General Enquiry'],
      });
    }
  });

  EventBus.on(SystemEvents.ACADEMY_TRIAL_SCHEDULED, async (data) => {
    console.log('[Autopilot] Caught ACADEMY_TRIAL_SCHEDULED:', data);
    if (!data.email) return;
    const html = await render(React.createElement(TrialReminderEmail, {
      leadName: data.name || 'Academy Lead',
      courseInterest: data.courseInterest || undefined,
      trialDate: data.trialDate || 'tomorrow'
    }));
    await EmailService.sendEmail(data.email, `Your Trial Class Details - Grekam Academy`, html);
  });

  EventBus.on(SystemEvents.ACADEMY_LEAD_INACTIVE, async (data) => {
    console.log('[Autopilot] Caught ACADEMY_LEAD_INACTIVE:', data);
    if (!data.email) return;
    const html = await render(React.createElement(ReEngagementEmail, {
      leadName: data.name || 'Academy Lead',
      courseInterest: data.courseInterest || undefined
    }));
    await EmailService.sendEmail(data.email, `We miss you! Special Offer inside - Grekam Academy`, html);
  });

  // --------------------------------------------------------------------------
  // HR EVENTS
  // --------------------------------------------------------------------------
  EventBus.on(SystemEvents.LEAVE_REQUESTED, async (data) => {
    console.log('[Autopilot] Caught LEAVE_REQUESTED:', data);
    // Placeholder for HR Manager notification
  });

  // --------------------------------------------------------------------------
  // LMS COMPLETION — AUTOMATED CERTIFICATE ENGINE
  // --------------------------------------------------------------------------
  EventBus.on(SystemEvents.COURSE_COMPLETED, async (data) => {
    console.log('[Autopilot] 🎓 Caught COURSE_COMPLETED:', data);
    
    // Trigger the certificate generation, R2 upload, and email dispatch pipeline
    await CertificatesService.generateAndSend({
      studentId: data.studentId,
      studentName: data.studentName,
      studentEmail: data.studentEmail,
      courseName: data.courseName,
      lmsCourseId: data.lmsCourseId,
    });
  });

  // --------------------------------------------------------------------------
  // FEE COLLECTION EVENTS
  // --------------------------------------------------------------------------
  EventBus.on(SystemEvents.FEE_PAID, async (data) => {
    console.log('[Autopilot] 💰 Caught FEE_PAID:', data.studentName);
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#f9f9f9;border-radius:12px;">
        <h1 style="color:#16a34a;">✅ Payment Confirmed</h1>
        <p>Hi <strong>${data.studentName}</strong>,</p>
        <p>We have received your fee payment of <strong>${data.amount}</strong> for <strong>${data.batchName}</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin-top:16px;">
          <tr><td style="padding:8px;color:#666;">Payment Ref</td><td style="padding:8px;font-weight:bold;">${data.paymentRef}</td></tr>
          <tr><td style="padding:8px;color:#666;">Date</td><td style="padding:8px;font-weight:bold;">${data.paidAt}</td></tr>
        </table>
        <p style="margin-top:24px;color:#555;">Thank you for your timely payment. Keep it up!</p>
        <p style="color:#888;font-size:12px;">— Grekam Academy Team</p>
      </div>`;
    if (data.studentEmail) {
      await EmailService.sendEmail(data.studentEmail, '✅ Fee Payment Confirmed - Grekam Academy', html);
    }
    // WhatsApp receipt to student
    if (data.studentPhone) {
      await whatsappService.sendTemplateMessage({
        phone: data.studentPhone,
        name: data.studentName,
        event: 'FEE_PAID',
        templateName: 'fee_payment_receipt',
        variables: [data.studentName, data.amount, data.batchName, data.paymentRef],
      });
    }
  });

  EventBus.on(SystemEvents.FEE_DUE_REMINDER, async (data) => {
    console.log('[Autopilot] 🔔 Caught FEE_DUE_REMINDER:', data.studentName);
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#f9f9f9;border-radius:12px;">
        <h1 style="color:#d97706;">🔔 Upcoming Fee Reminder</h1>
        <p>Hi <strong>${data.studentName}</strong>,</p>
        <p>This is a friendly reminder that your fee of <strong>${data.amount}</strong> for <strong>${data.batchName}</strong> is due on <strong>${data.dueDate}</strong>.</p>
        <p>Please make the payment on time to avoid any disruption to your classes.</p>
        <p style="color:#888;font-size:12px;">— Grekam Academy Team</p>
      </div>`;
    if (data.studentEmail) {
      await EmailService.sendEmail(data.studentEmail, '🔔 Fee Due Reminder - Grekam Academy', html);
    }
    if (data.studentPhone) {
      await whatsappService.sendTemplateMessage({
        phone: data.studentPhone,
        name: data.studentName,
        event: 'FEE_DUE_REMINDER',
        templateName: 'fee_due_reminder',
        variables: [data.studentName, data.amount, data.batchName, data.dueDate],
      });
    }
  });

  EventBus.on(SystemEvents.FEE_OVERDUE, async (data) => {
    console.log('[Autopilot] ⚠️ Caught FEE_OVERDUE:', data.studentName);
    const org = await prisma.organization.findFirst();
    const adminEmail = org?.supportEmail || 'admin@grekam.com';
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#fff5f5;border-radius:12px;border:2px solid #fca5a5;">
        <h1 style="color:#dc2626;">⚠️ Fee Overdue Notice</h1>
        <p>Hi <strong>${data.studentName}</strong>,</p>
        <p>Your fee of <strong>${data.amount}</strong> for <strong>${data.batchName}</strong> was due on <strong>${data.dueDate}</strong> and has not been received yet.</p>
        <p>Please contact us immediately at <strong>${adminEmail}</strong> or pay online to avoid any impact on your enrollment.</p>
        <p style="color:#888;font-size:12px;">— Grekam Academy Admin</p>
      </div>`;
    if (data.studentEmail) {
      await EmailService.sendEmail(data.studentEmail, '⚠️ URGENT: Fee Overdue - Grekam Academy', html);
    }
    if (data.studentPhone) {
      await whatsappService.sendTemplateMessage({
        phone: data.studentPhone,
        name: data.studentName,
        event: 'FEE_OVERDUE',
        templateName: 'fee_overdue_alert',
        variables: [data.studentName, data.amount, data.batchName, data.dueDate],
      });
    }
  });

  EventBus.on(SystemEvents.FEE_INVOICE_SENT, async (data) => {
    console.log('[Autopilot] ✉️ Caught FEE_INVOICE_SENT:', data.studentName);
    const org = await prisma.organization.findFirst();
    const brandingColor = org?.primaryColor || '#2563eb';
    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#f9f9f9;border-radius:12px;border:1px solid #eee;">
        <div style="text-align:center;margin-bottom:24px;">
          <h2 style="color:${brandingColor};margin:0;font-size:24px;text-transform:uppercase;letter-spacing:1px;">${org?.name || 'Grekam Academy'}</h2>
          <p style="color:#777;font-size:12px;margin:4px 0 0 0;">Official Fee Invoice / Receipt</p>
        </div>
        <p>Dear <strong>${data.studentName}</strong>,</p>
        <p>Your fee installment invoice for the <strong>${data.batchName}</strong> batch has been generated.</p>
        
        <div style="background:#fff;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin:24px 0;">
          <table style="width:100%;font-size:14px;border-collapse:collapse;">
            <tr style="border-b:1px solid #f3f4f6;">
              <td style="padding:10px 0;color:#6b7280;">Basic Amount</td>
              <td style="padding:10px 0;text-align:right;font-weight:bold;color:#1f2937;">${data.amount}</td>
            </tr>
            <tr style="border-b:1px solid #f3f4f6;">
              <td style="padding:10px 0;color:#6b7280;">GST / Taxes</td>
              <td style="padding:10px 0;text-align:right;font-weight:bold;color:#1f2937;">${data.taxAmount}</td>
            </tr>
            <tr>
              <td style="padding:10px 0;color:#374151;font-weight:bold;font-size:16px;">Total Due</td>
              <td style="padding:10px 0;text-align:right;font-weight:black;font-size:18px;color:${brandingColor};">${data.totalDue}</td>
            </tr>
          </table>
        </div>

        <table style="width:100%;font-size:13px;color:#4b5563;margin-bottom:24px;">
          <tr>
            <td style="padding:4px 0;"><strong>Due Date:</strong></td>
            <td style="text-align:right;">${data.dueDate}</td>
          </tr>
          ${data.notes ? `
          <tr>
            <td style="padding:4px 0;vertical-align:top;"><strong>Notes:</strong></td>
            <td style="text-align:right;color:#6b7280;max-width:200px;">${data.notes}</td>
          </tr>` : ''}
        </table>

        <p style="color:#555;font-size:13px;line-height:1.5;">Please process this payment on or before the due date. Thank you for your continued dedication to learning!</p>
        <p style="color:#888;font-size:12px;margin-top:32px;border-t:1px solid #eee;padding-top:16px;text-align:center;">— ${org?.name || 'Grekam Academy'} Support</p>
      </div>`;

    if (data.studentEmail) {
      await EmailService.sendEmail(data.studentEmail, `✉️ Fee Invoice: ${data.totalDue} due for ${data.batchName}`, html);
    }
  });
}

