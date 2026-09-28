import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateWebsiteEstimate, DEFAULT_CALCULATOR_CONFIG, CalculatorState } from '@/lib/calculator/calculator-config';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

const NOTIFICATION_RECIPIENTS = [
  'greeksacademy@gmail.com',
  'layartacademy@gmail.com',
  'academy@layart.in'
];

async function sendLeadEmailNotification(lead: {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  courseInterest?: string;
  estimatedBudget?: number;
  source?: string;
  notes?: string;
}) {
  try {
    let host = process.env.SMTP_HOST;
    let port = Number(process.env.SMTP_PORT) || 587;
    let user = process.env.SMTP_USER;
    let pass = process.env.SMTP_PASS;
    let fromAddress = process.env.SMTP_FROM || user || '"Grekam OS Leads" <no-reply@grekam.in>';

    try {
      const keys = await prisma.integrationKey.findMany({
        where: { service: 'SMTP', isActive: true }
      });
      for (const k of keys) {
        if (k.keyName === 'SMTP_HOST') host = k.encryptedValue;
        if (k.keyName === 'SMTP_PORT') port = parseInt(k.encryptedValue) || 587;
        if (k.keyName === 'SMTP_USER') user = k.encryptedValue;
        if (k.keyName === 'SMTP_PASS') pass = k.encryptedValue;
        if (k.keyName === 'SMTP_FROM') fromAddress = k.encryptedValue;
      }
    } catch (dbErr) {
      console.error('[EmailNotification] Error checking SMTP keys from DB:', dbErr);
    }

    if (!host || !user || !pass) {
      console.log(`[EmailNotification] SMTP not configured. Lead logged: Name=${lead.name}, Phone=${lead.phone}, Email=${lead.email}`);
      return;
    }

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="background-color: #0f172a; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #38bdf8; margin: 0; font-size: 20px;">🚀 New Lead Received!</h2>
          <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">Grekam OS Lead Intake</p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; font-weight: bold; color: #475569; width: 140px;">Full Name:</td>
            <td style="padding: 10px 0; color: #0f172a; font-weight: 600;">${lead.name}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; font-weight: bold; color: #475569;">Phone / WhatsApp:</td>
            <td style="padding: 10px 0; color: #16a34a; font-weight: bold;">
              ${lead.phone ? `<a href="https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}" style="color: #16a34a; text-decoration: none;">${lead.phone} (WhatsApp)</a>` : 'N/A'}
            </td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; font-weight: bold; color: #475569;">Email:</td>
            <td style="padding: 10px 0; color: #0f172a;">${lead.email ? `<a href="mailto:${lead.email}">${lead.email}</a>` : 'N/A'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; font-weight: bold; color: #475569;">Course / Interest:</td>
            <td style="padding: 10px 0; color: #2563eb; font-weight: bold;">${lead.courseInterest || 'General Enquiry'}</td>
          </tr>
          ${lead.company ? `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; font-weight: bold; color: #475569;">Mode / Batch / Co:</td>
            <td style="padding: 10px 0; color: #0f172a;">${lead.company}</td>
          </tr>` : ''}
          ${lead.estimatedBudget ? `
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 10px 0; font-weight: bold; color: #475569;">Estimated Budget:</td>
            <td style="padding: 10px 0; color: #0f172a;">₹${lead.estimatedBudget.toLocaleString('en-IN')}</td>
          </tr>` : ''}
        </table>

        ${lead.notes ? `
        <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; border-left: 4px solid #2563eb; margin-bottom: 20px;">
          <h4 style="margin: 0 0 8px 0; color: #334155; font-size: 14px;">Notes & Details:</h4>
          <pre style="font-family: inherit; font-size: 13px; color: #334155; white-space: pre-wrap; margin: 0; line-height: 1.5;">${lead.notes}</pre>
        </div>` : ''}

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0 16px 0;" />
        <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">Automated lead alert sent to ${NOTIFICATION_RECIPIENTS.join(', ')}</p>
      </div>
    `;

    await transporter.sendMail({
      from: fromAddress,
      to: NOTIFICATION_RECIPIENTS.join(', '),
      subject: `🔥 New Lead: ${lead.name} - ${lead.courseInterest || lead.company || 'Website Registration'}`,
      html: htmlContent,
    });
    console.log(`[EmailNotification] Notification sent to ${NOTIFICATION_RECIPIENTS.join(', ')}`);
  } catch (emailErr) {
    console.error('[EmailNotification] Failed to send email alert:', emailErr);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Check if this is a direct lead submission (e.g. Masterclass form) or Calculator submission
    let customerName = body.name || body.customerName;
    let email = body.email;
    let phone = body.phone;
    let company = body.company;
    let courseInterest = body.courseInterest;
    let estimatedBudget = body.estimatedBudget;
    let notes = body.notes;
    let source = body.source || 'WEBSITE';
    let projectType = body.projectType || 'MASTERCLASS';

    // If coming from Calculator State
    if (body.state) {
      const state: CalculatorState = body.state;
      const clientDetails = body.customer || {};

      customerName = clientDetails.name || state.customerName || 'Website Lead';
      company = clientDetails.businessName || state.businessName || '';
      email = clientDetails.email || state.email || '';
      phone = clientDetails.phone || state.phone || '';
      const city = clientDetails.city || state.city || '';
      const websiteUrl = clientDetails.websiteUrl || state.websiteUrl || '';
      const additionalNotes = clientDetails.additionalNotes || state.additionalNotes || '';

      const estimate = calculateWebsiteEstimate(state, DEFAULT_CALCULATOR_CONFIG);
      estimatedBudget = estimate.oneTimeTotal;
      projectType = state.websiteType ? state.websiteType.toUpperCase() : 'WEBSITE';

      notes = [
        `### Website Cost Calculator Submission`,
        `**Business Name:** ${company || 'N/A'}`,
        `**Customer Name:** ${customerName}`,
        `**Phone:** ${phone || 'N/A'}`,
        `**Email:** ${email || 'N/A'}`,
        `**City:** ${city || 'N/A'}`,
        `**Current Website / Instagram:** ${websiteUrl || 'N/A'}`,
        ``,
        `#### Estimate Details`,
        `- **Website Type:** ${projectType}`,
        `- **Pages Tier:** ${state.pageTier}`,
        `- **Design Style:** ${state.designTier ? state.designTier.toUpperCase() : ''}`,
        `- **Delivery Timeline:** ${state.deliverySpeed ? state.deliverySpeed.toUpperCase() : ''}`,
        `- **Estimated One-Time Cost:** ₹${estimate.oneTimeTotal.toLocaleString('en-IN')}`,
        ``,
        additionalNotes ? `#### Client Notes\n${additionalNotes}` : null,
      ].filter(Boolean).join('\n');
    }

    if (!customerName) {
      return NextResponse.json({ success: false, error: 'Customer name is required' }, { status: 400 });
    }

    // Save Lead to Prisma CRM
    const lead = await prisma.lead.create({
      data: {
        name: customerName,
        company: company || null,
        email: email || null,
        phone: phone || null,
        source: source || 'WEBSITE',
        businessUnit: 'ACADEMY',
        projectType: projectType || 'MASTERCLASS',
        estimatedBudget: estimatedBudget || null,
        notes: notes || null,
        status: 'NEW',
      },
      select: {
        id: true,
      },
    });

    // Attempt Contact Upsert
    if (email) {
      try {
        const nameParts = customerName.split(' ');
        const firstName = nameParts[0] || 'Unknown';
        const lastName = nameParts.slice(1).join(' ') || '';

        await (prisma as any).contact.upsert({
          where: { email },
          update: {
            firstName,
            lastName,
            phone: phone || undefined,
          },
          create: {
            firstName,
            lastName,
            email,
            phone: phone || null,
          },
        }).catch(() => {});
      } catch (cErr) {
        // Ignore schema mismatch errors
      }
    }

    // Trigger Email Notification in background (non-blocking)
    sendLeadEmailNotification({
      name: customerName,
      email,
      phone,
      company,
      courseInterest,
      estimatedBudget,
      source,
      notes,
    });

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: 'Enquiry submitted successfully',
    });
  } catch (error: any) {
    console.error('Error handling lead submission:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit enquiry' },
      { status: 500 }
    );
  }
}
