import { EventBus, SystemEvents } from './event-bus';
import { EmailService } from './email.service';
import { NotificationService } from './notification.service';
import { render } from '@react-email/render';
import React from 'react';
import { whatsappService } from '../integrations/whatsapp.service';
import { CertificatesService } from '../lms/certificates.service';
import { GamificationService } from '../lms/gamification.service';

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
    await EmailService.sendEmail('admin@grekam.com', 'New Lead Arrived!', `<h1>New Lead</h1><p>${data.name} (${data.email}) just submitted an inquiry.</p>`);

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
}

