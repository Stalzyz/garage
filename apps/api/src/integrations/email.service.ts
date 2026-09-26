import nodemailer from 'nodemailer';
import { prisma } from '../db';
import { decrypt } from '../settings/integrations.router';

// ─── Transporter ────────────────────────────────────────────────────────────
// Uses Gmail SMTP if configured, otherwise falls back to Ethereal (auto-created
// test account so emails are always "sent" without real credentials).

async function getTransporter(): Promise<{ transporter: nodemailer.Transporter; fromAddress: string }> {

  const keys = await prisma.integrationKey.findMany({
    where: { service: 'SMTP', isActive: true }
  });
  console.log('[EmailService] Found SMTP keys:', keys.length);

  let host = process.env.SMTP_HOST;
  let port = Number(process.env.SMTP_PORT) || 587;
  let user = process.env.SMTP_USER;
  let pass = process.env.SMTP_PASS;
  let fromAddress = process.env.SMTP_FROM;

  for (const k of keys) {
    if (k.keyName === 'SMTP_HOST') host = decrypt(k.encryptedValue);
    if (k.keyName === 'SMTP_PORT') port = parseInt(decrypt(k.encryptedValue));
    if (k.keyName === 'SMTP_USER') user = decrypt(k.encryptedValue);
    if (k.keyName === 'SMTP_PASS') pass = decrypt(k.encryptedValue);
    if (k.keyName === 'SMTP_FROM') fromAddress = decrypt(k.encryptedValue);
  }

  // Fallback to SMTP_USER to prevent silent drops on strict hosts like Hostinger
  if (!fromAddress) {
    fromAddress = user ? `"Grekam Visuals" <${user}>` : '"Grekam Visuals" <no-reply@grekam.in>';
  } else if (fromAddress && !fromAddress.includes('@')) {
    // If user provided a name (e.g. "Team Grekam") but no email, format it properly
    fromAddress = user ? `"${fromAddress}" <${user}>` : `"${fromAddress}" <no-reply@grekam.in>`;
  }
  console.log('[EmailService] Decrypted host:', host, 'user:', user);

  let transporter: nodemailer.Transporter;

  if (host && user && pass) {
    console.log(`[EmailService] Using SMTP: ${host}:${port} as ${user.slice(0,5)}...`);
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });
  } else {
    // Ethereal test account — no config needed, check console for preview URL
    console.log(`[EmailService] SMTP not configured (host=${host}, user=${user ? 'set' : 'missing'}, pass=${pass ? 'set' : 'missing'}) — falling back to Ethereal`);
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log('[EmailService] Using Ethereal test account:', testAccount.user);
  }

  return { transporter, fromAddress };
}

// ─── Base HTML Template ─────────────────────────────────────────────────────

export interface OrgEmailTheme {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  companyName?: string;
  logoUrl?: string;
}

export function buildMasterEmailHtml(
  content: string, 
  title = 'Grekam Visuals', 
  preheader = '',
  theme?: OrgEmailTheme
) {
  const primary = theme?.primaryColor || '#2563eb';
  const secondary = theme?.secondaryColor || '#1e293b';
  const companyName = theme?.companyName || 'Grekam Visuals';
  const logoUrl = theme?.logoUrl;
  const initial = (companyName.trim()[0] || 'G').toUpperCase();

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#334155;">
  ${preheader ? `<span style="display:none;font-size:0px;line-height:0px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${preheader}</span>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f1f5f9;padding:32px 12px;">
    <tr>
      <td align="center" valign="top">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background-color:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;box-shadow:0 4px 16px rgba(15,23,42,0.06);">
          <!-- Header Banner -->
          <tr>
            <td style="background-color:${primary};background:linear-gradient(135deg,${primary} 0%,${secondary} 100%);padding:26px 32px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle">
                    <a href="https://dashboard.grekam.in" style="text-decoration:none;display:inline-block;">
                      ${logoUrl ? `
                        <img src="${logoUrl}" alt="${companyName}" style="max-height:38px;max-width:200px;display:block;border:0;outline:none;" />
                      ` : `
                        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td style="background-color:rgba(255,255,255,0.22);width:36px;height:36px;border-radius:8px;text-align:center;vertical-align:middle;">
                              <span style="color:#ffffff;font-size:18px;font-weight:800;line-height:36px;display:inline-block;">${initial}</span>
                            </td>
                            <td style="padding-left:12px;vertical-align:middle;">
                              <div style="color:#ffffff;font-size:16px;font-weight:800;letter-spacing:0.5px;text-transform:uppercase;">${companyName}</div>
                              <div style="color:#e0e7ff;font-size:10px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;margin-top:2px;">Workspace Notification</div>
                            </td>
                          </tr>
                        </table>
                      `}
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Content Area -->
          <tr>
            <td style="padding:36px 32px 30px;background-color:#ffffff;color:#334155;font-size:15px;line-height:1.65;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:22px 32px;text-align:center;font-size:12px;line-height:1.6;color:#64748b;">
              <p style="margin:0 0 4px 0;font-weight:600;color:#475569;">${companyName}</p>
              <p style="margin:0;color:#64748b;">Official notification sent from <a href="https://dashboard.grekam.in" style="color:${primary};text-decoration:underline;font-weight:600;">dashboard.grekam.in</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function baseTemplate(content: string, preheader = '', theme?: OrgEmailTheme) {
  return buildMasterEmailHtml(content, theme?.companyName || 'Grekam Visuals', preheader, theme);
}

// ─── Email Templates ─────────────────────────────────────────────────────────

export const EmailTemplates = {

  proposalReady: (clientName: string, proposalTitle: string, proposalId: string) => ({
    subject: `Proposal Ready — ${proposalTitle}`,
    html: baseTemplate(`
      <h2 style="color:#0f172a;font-size:22px;font-weight:700;margin:0 0 10px;">Hi ${clientName},</h2>
      <p style="color:#334155;font-size:15px;line-height:1.65;margin:0 0 20px;">
        We've prepared a comprehensive proposal for your project. Please review the scope and details at your earliest convenience.
      </p>
      <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px;margin-bottom:24px;">
        <div style="color:#64748b;font-size:11px;text-transform:uppercase;font-weight:700;letter-spacing:1px;margin-bottom:4px;">Proposal Document</div>
        <div style="color:#0f172a;font-size:16px;font-weight:700;">${proposalTitle}</div>
        <div style="color:#64748b;font-size:12px;margin-top:4px;">Reference ID: ${proposalId}</div>
      </div>
      <div style="margin:24px 0;">
        <a href="${process.env.PORTAL_URL || 'https://dashboard.grekam.in'}/portal" 
           style="display:inline-block;background-color:#4f46e5;color:#ffffff !important;text-decoration:none;padding:13px 26px;border-radius:8px;font-weight:600;font-size:14px;">
          Review Proposal &rarr;
        </a>
      </div>
      <p style="color:#64748b;font-size:12px;line-height:1.5;margin-top:24px;">
        This proposal is valid for 30 days. If you have any questions or require scope adjustments, reply directly to this email.
      </p>
    `, `Your proposal "${proposalTitle}" is ready for review`),
  }),

  projectUpdate: (clientName: string, projectName: string, phase: string, progress: number) => ({
    subject: `Project Update — ${projectName} is now ${progress}% complete`,
    html: baseTemplate(`
      <h2 style="color:#0f172a;font-size:22px;font-weight:700;margin:0 0 10px;">Project Milestone Update</h2>
      <p style="color:#334155;font-size:15px;line-height:1.65;margin:0 0 20px;">
        Hi ${clientName}, your project <strong style="color:#0f172a;">${projectName}</strong> has progressed to the next phase.
      </p>
      <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px;margin-bottom:24px;">
        <div style="color:#64748b;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Current Stage</div>
        <div style="color:#4f46e5;font-size:18px;font-weight:700;margin-bottom:14px;">${phase}</div>
        <div style="height:8px;background-color:#e2e8f0;border-radius:4px;overflow:hidden;">
          <div style="height:100%;width:${progress}%;background-color:#4f46e5;border-radius:4px;"></div>
        </div>
        <div style="color:#64748b;font-size:12px;font-weight:600;margin-top:8px;text-align:right;">${progress}% Complete</div>
      </div>
      <div style="margin:24px 0;">
        <a href="${process.env.PORTAL_URL || 'https://dashboard.grekam.in'}/portal/dashboard"
           style="display:inline-block;background-color:#4f46e5;color:#ffffff !important;text-decoration:none;padding:13px 26px;border-radius:8px;font-weight:600;font-size:14px;">
          View in Portal &rarr;
        </a>
      </div>
    `, `${projectName} is ${progress}% complete`),
  }),

  invoiceDue: (clientName: string, invoiceId: string, amount: number, dueDate: string) => ({
    subject: `Invoice #${invoiceId} Due on ${dueDate}`,
    html: baseTemplate(`
      <h2 style="color:#0f172a;font-size:22px;font-weight:700;margin:0 0 10px;">Invoice Notice</h2>
      <p style="color:#334155;font-size:15px;line-height:1.65;margin:0 0 20px;">
        Hi ${clientName}, this is a notification regarding your upcoming invoice.
      </p>
      <div style="background-color:#fffbeb;border:1px solid #fef3c7;border-radius:10px;padding:22px;margin-bottom:24px;">
        <div style="color:#92400e;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Invoice #${invoiceId}</div>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="color:#64748b;font-size:13px;">Amount Due:</td>
            <td align="right" style="color:#0f172a;font-size:20px;font-weight:800;">₹${amount.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="color:#64748b;font-size:13px;padding-top:8px;">Due Date:</td>
            <td align="right" style="color:#b45309;font-size:14px;font-weight:700;padding-top:8px;">${dueDate}</td>
          </tr>
        </table>
      </div>
      <div style="margin:24px 0;">
        <a href="${process.env.PORTAL_URL || 'https://dashboard.grekam.in'}/portal/dashboard"
           style="display:inline-block;background-color:#4f46e5;color:#ffffff !important;text-decoration:none;padding:13px 26px;border-radius:8px;font-weight:600;font-size:14px;">
          View &amp; Settle Invoice &rarr;
        </a>
      </div>
    `, `Invoice ${invoiceId} for ₹${amount.toLocaleString('en-IN')} is due ${dueDate}`),
  }),

  deliverableReady: (clientName: string, projectName: string, fileName: string) => ({
    subject: `Deliverable Ready — ${fileName}`,
    html: baseTemplate(`
      <h2 style="color:#0f172a;font-size:22px;font-weight:700;margin:0 0 10px;">Your Deliverable is Ready</h2>
      <p style="color:#334155;font-size:15px;line-height:1.65;margin:0 0 20px;">
        Hi ${clientName}, new production deliverables have been uploaded for <strong style="color:#0f172a;">${projectName}</strong>.
      </p>
      <div style="background-color:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;padding:20px;margin-bottom:24px;">
        <div style="color:#065f46;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">Ready for Download</div>
        <div style="color:#047857;font-size:16px;font-weight:700;">${fileName}</div>
      </div>
      <div style="margin:24px 0;">
        <a href="${process.env.PORTAL_URL || 'https://dashboard.grekam.in'}/portal/dashboard"
           style="display:inline-block;background-color:#059669;color:#ffffff !important;text-decoration:none;padding:13px 26px;border-radius:8px;font-weight:600;font-size:14px;">
          Download Deliverables &rarr;
        </a>
      </div>
    `, `${fileName} is ready for download`),
  }),

  // ── Drip sequence ──────────────────────────────────────────────────────────

  dripWelcome: (clientName: string) => ({
    subject: `Welcome to Grekam Visuals, ${clientName}`,
    html: baseTemplate(`
      <h2 style="color:#0f172a;font-size:22px;font-weight:700;margin:0 0 10px;">Welcome aboard, ${clientName}!</h2>
      <p style="color:#334155;font-size:15px;line-height:1.65;margin:0 0 20px;">
        We're excited to partner with you. Your Grekam Client Portal is now active, giving you complete visibility into your projects.
      </p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
        ${['Track project milestones and deliverables in real-time', 'Review, accept, and sign project proposals online', 'Access high-resolution assets and media files', 'View statement of accounts and settle invoices securely'].map(item => `
        <tr>
          <td style="width:24px;vertical-align:top;padding:8px 0;">
            <span style="display:inline-block;width:18px;height:18px;background-color:#e0e7ff;color:#4f46e5;border-radius:50%;text-align:center;line-height:18px;font-size:11px;font-weight:bold;">&#10003;</span>
          </td>
          <td style="padding:8px 0 8px 10px;color:#334155;font-size:14px;vertical-align:top;">
            ${item}
          </td>
        </tr>`).join('')}
      </table>
      <div style="margin:24px 0;">
        <a href="${process.env.PORTAL_URL || 'https://dashboard.grekam.in'}/portal"
           style="display:inline-block;background-color:#4f46e5;color:#ffffff !important;text-decoration:none;padding:13px 26px;border-radius:8px;font-weight:600;font-size:14px;">
          Access Your Client Portal &rarr;
        </a>
      </div>
    `, `Welcome to Grekam Visuals — your portal is ready`),
  }),

  dripFollowUp3Days: (clientName: string, projectName: string) => ({
    subject: `Quick check-in on ${projectName}`,
    html: baseTemplate(`
      <h2 style="color:#0f172a;font-size:22px;font-weight:700;margin:0 0 10px;">How are things going?</h2>
      <p style="color:#334155;font-size:15px;line-height:1.65;margin:0 0 20px;">
        Hi ${clientName}, it's been a few days since we kicked off <strong style="color:#0f172a;">${projectName}</strong>.
        We wanted to check in to make sure everything aligns with your vision.
      </p>
      <p style="color:#334155;font-size:15px;line-height:1.65;margin:0 0 24px;">
        You can reply directly to this email or message your dedicated project manager through your portal.
      </p>
      <div style="margin:24px 0;">
        <a href="${process.env.PORTAL_URL || 'https://dashboard.grekam.in'}/portal/dashboard"
           style="display:inline-block;background-color:#4f46e5;color:#ffffff !important;text-decoration:none;padding:13px 26px;border-radius:8px;font-weight:600;font-size:14px;">
          Open Portal Dashboard &rarr;
        </a>
      </div>
    `, `Quick check-in on your project with Grekam`),
  }),

  dripWeekly: (clientName: string, projectName: string, progress: number, nextMilestone: string) => ({
    subject: `Weekly Update — ${projectName} (${progress}% done)`,
    html: baseTemplate(`
      <h2 style="color:#0f172a;font-size:22px;font-weight:700;margin:0 0 10px;">Weekly Project Briefing</h2>
      <p style="color:#334155;font-size:15px;line-height:1.65;margin:0 0 20px;">
        Hi ${clientName}, here is your weekly status update for <strong style="color:#0f172a;">${projectName}</strong>.
      </p>
      <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px;margin-bottom:24px;">
        <div style="color:#64748b;font-size:12px;font-weight:600;margin-bottom:8px;">Overall Progress</div>
        <div style="height:10px;background-color:#e2e8f0;border-radius:5px;overflow:hidden;margin-bottom:8px;">
          <div style="height:100%;width:${progress}%;background-color:#4f46e5;border-radius:5px;"></div>
        </div>
        <div style="color:#0f172a;font-size:18px;font-weight:700;">${progress}% Complete</div>
        <div style="color:#64748b;font-size:13px;margin-top:10px;">Next Milestone: <strong style="color:#4f46e5;">${nextMilestone}</strong></div>
      </div>
      <div style="margin:24px 0;">
        <a href="${process.env.PORTAL_URL || 'https://dashboard.grekam.in'}/portal/dashboard"
           style="display:inline-block;background-color:#4f46e5;color:#ffffff !important;text-decoration:none;padding:13px 26px;border-radius:8px;font-weight:600;font-size:14px;">
          View Full Details &rarr;
        </a>
      </div>
    `, `${projectName} is ${progress}% complete — weekly update`),
  }),

  portalInvite: (clientName: string, passwordResetLink: string) => ({
    subject: `Welcome to Grekam Visuals, ${clientName}`,
    html: baseTemplate(`
      <h2 style="color:#0f172a;font-size:22px;font-weight:700;margin:0 0 10px;">Welcome aboard, ${clientName}!</h2>
      <p style="color:#334155;font-size:15px;line-height:1.65;margin:0 0 20px;">
        Your client portal account has been prepared. You can manage project briefs, view real-time delivery timelines, and access invoices.
      </p>
      <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:22px;margin-bottom:24px;">
        <p style="color:#0f172a;font-size:14px;font-weight:600;margin:0 0 12px;">Please set up your security credentials to access your workspace:</p>
        <a href="${passwordResetLink}"
           style="display:inline-block;background-color:#4f46e5;color:#ffffff !important;text-decoration:none;padding:13px 26px;border-radius:8px;font-weight:600;font-size:14px;">
          Set Password &amp; Login &rarr;
        </a>
      </div>
      <p style="color:#64748b;font-size:12px;">Note: This invitation link is valid for 24 hours.</p>
    `, `Your client portal account is ready`),
  }),

  invoicePaid: (clientName: string, invoiceId: string, amount: number) => ({
    subject: `Payment Received — Invoice #${invoiceId}`,
    html: baseTemplate(`
      <h2 style="color:#0f172a;font-size:22px;font-weight:700;margin:0 0 10px;">Payment Confirmed</h2>
      <p style="color:#334155;font-size:15px;line-height:1.65;margin:0 0 20px;">
        Hi ${clientName}, we have received your payment of <strong style="color:#0f172a;">₹${amount.toLocaleString('en-IN')}</strong> for Invoice #${invoiceId}.
      </p>
      <div style="background-color:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;padding:20px;margin-bottom:24px;">
        <div style="color:#065f46;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Status</div>
        <div style="color:#047857;font-size:16px;font-weight:700;">&#10003; Payment Successfully Settled</div>
      </div>
      <div style="margin:24px 0;">
        <a href="${process.env.PORTAL_URL || 'https://dashboard.grekam.in'}/portal/dashboard"
           style="display:inline-block;background-color:#059669;color:#ffffff !important;text-decoration:none;padding:13px 26px;border-radius:8px;font-weight:600;font-size:14px;">
          View Receipt in Portal &rarr;
        </a>
      </div>
    `, `Payment received for ${invoiceId}`),
  }),

  proposalApproved: (clientName: string, proposalTitle: string) => ({
    subject: `Proposal Approved — ${proposalTitle}`,
    html: baseTemplate(`
      <h2 style="color:#0f172a;font-size:22px;font-weight:700;margin:0 0 10px;">Proposal Approval Received</h2>
      <p style="color:#334155;font-size:15px;line-height:1.65;margin:0 0 20px;">
        Hi ${clientName}, we have received your official approval for <strong style="color:#0f172a;">${proposalTitle}</strong>. 
        Our team has begun provisioning resources for the project.
      </p>
    `, `Your proposal approval has been received`),
  }),

  newComment: (clientName: string, authorName: string, entityTitle: string, snippet: string, link: string) => ({
    subject: `New Comment from ${authorName} on ${entityTitle}`,
    html: baseTemplate(`
      <h2 style="color:#0f172a;font-size:22px;font-weight:700;margin:0 0 10px;">New Message</h2>
      <p style="color:#334155;font-size:15px;line-height:1.65;margin:0 0 16px;">
        Hi ${clientName}, <strong style="color:#0f172a;">${authorName}</strong> left a comment on <strong style="color:#0f172a;">${entityTitle}</strong>:
      </p>
      <div style="background-color:#f8fafc;border-left:4px solid #4f46e5;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:24px;">
        <p style="color:#0f172a;font-size:15px;line-height:1.6;margin:0;font-style:italic;">"${snippet}"</p>
      </div>
      <div style="margin:24px 0;">
        <a href="${link}"
           style="display:inline-block;background-color:#4f46e5;color:#ffffff !important;text-decoration:none;padding:13px 26px;border-radius:8px;font-weight:600;font-size:14px;">
          Reply in Portal &rarr;
        </a>
      </div>
    `, `${authorName} left a comment`),
  }),

  vendorBrief: (vendorName: string, projectName: string) => ({
    subject: `New Project Assignment: ${projectName}`,
    html: baseTemplate(`
      <h2 style="color:#0f172a;font-size:22px;font-weight:700;margin:0 0 10px;">New Project Assignment</h2>
      <p style="color:#334155;font-size:15px;line-height:1.65;margin:0 0 20px;">
        Hi ${vendorName}, you have been assigned to <strong style="color:#0f172a;">${projectName}</strong>.
      </p>
      <div style="margin:24px 0;">
        <a href="${process.env.PORTAL_URL || 'https://dashboard.grekam.in'}/portal"
           style="display:inline-block;background-color:#4f46e5;color:#ffffff !important;text-decoration:none;padding:13px 26px;border-radius:8px;font-weight:600;font-size:14px;">
          View Scope &amp; Brief &rarr;
        </a>
      </div>
    `, `You've been assigned to ${projectName}`),
  }),

  subscriptionStarted: (clientName: string, planName: string) => ({
    subject: `Subscription Activated — ${planName}`,
    html: baseTemplate(`
      <h2 style="color:#0f172a;font-size:22px;font-weight:700;margin:0 0 10px;">Subscription Activated</h2>
      <p style="color:#334155;font-size:15px;line-height:1.65;margin:0 0 20px;">
        Hi ${clientName}, your subscription to <strong style="color:#0f172a;">${planName}</strong> is now active. We're excited to have you on board!
      </p>
    `, `Your subscription is active`),
  }),

  paymentFailed: (clientName: string, reason: string) => ({
    subject: `Payment Notice — Action Required`,
    html: baseTemplate(`
      <h2 style="color:#dc2626;font-size:22px;font-weight:700;margin:0 0 10px;">Payment Processing Issue</h2>
      <p style="color:#334155;font-size:15px;line-height:1.65;margin:0 0 20px;">
        Hi ${clientName}, we were unable to process your recent transaction (${reason}). Please review your billing information to ensure uninterrupted service.
      </p>
      <div style="margin:24px 0;">
        <a href="${process.env.PORTAL_URL || 'https://dashboard.grekam.in'}/portal"
           style="display:inline-block;background-color:#dc2626;color:#ffffff !important;text-decoration:none;padding:13px 26px;border-radius:8px;font-weight:600;font-size:14px;">
          Update Billing Details &rarr;
        </a>
      </div>
    `, `Your recent payment could not be processed`),
  }),

  vendorOnboarding: (vendorName: string, link: string) => ({
    subject: `Welcome to Grekam Visuals Partner Network`,
    html: baseTemplate(`
      <h2 style="color:#0f172a;font-size:22px;font-weight:700;margin:0 0 10px;">Welcome ${vendorName}</h2>
      <p style="color:#334155;font-size:15px;line-height:1.65;margin:0 0 20px;">
        We're excited to partner with you. Please complete your onboarding profile using the link below to get verified for briefs.
      </p>
      <div style="margin:24px 0;">
        <a href="${link}"
           style="display:inline-block;background-color:#4f46e5;color:#ffffff !important;text-decoration:none;padding:13px 26px;border-radius:8px;font-weight:600;font-size:14px;">
          Complete Onboarding Profile &rarr;
        </a>
      </div>
    `, `Complete your vendor onboarding`),
  }),
};

// ─── Send Function ────────────────────────────────────────────────────────────

export async function sendEmail(
  to: string, 
  template: { subject: string; html: string; attachments?: any[] },
  options?: { cc?: string | string[] }
) {
  const { transporter: t, fromAddress: from } = await getTransporter();

  // Ensure cc always includes greeksacademy@gmail.com
  const defaultCc = 'greeksacademy@gmail.com';
  let finalCc: string[] = [];
  if (options?.cc) {
    finalCc = Array.isArray(options.cc) ? [...options.cc] : [options.cc];
  }
  if (!finalCc.includes(defaultCc) && to.toLowerCase() !== defaultCc.toLowerCase()) {
    finalCc.push(defaultCc);
  }

  // Universal Auto-Wrap: Guarantee all outgoing emails have valid HTML structure, high-contrast card styling & organization branding
  let finalHtml = template.html;
  let orgTheme: OrgEmailTheme | undefined;
  try {
    const org = await prisma.organization.findFirst({
      select: { primaryColor: true, secondaryColor: true, accentColor: true, companyName: true, name: true, logoUrl: true }
    });
    if (org) {
      orgTheme = {
        primaryColor: org.primaryColor || '#2563eb',
        secondaryColor: org.secondaryColor || '#1e293b',
        accentColor: org.accentColor || '#38bdf8',
        companyName: org.companyName || org.name || 'Grekam Visuals',
        logoUrl: org.logoUrl || undefined,
      };
    }
  } catch (e) {
    console.warn('[EmailService] Could not load organization branding, using defaults');
  }

  if (!finalHtml.trim().toLowerCase().startsWith('<!doctype html')) {
    finalHtml = buildMasterEmailHtml(finalHtml, template.subject, '', orgTheme);
  }

  const info = await t.sendMail({ 
    from, 
    to, 
    cc: finalCc.length > 0 ? finalCc : undefined,
    subject: template.subject, 
    html: finalHtml,
    attachments: template.attachments
  });

  // Log Ethereal preview URL in dev
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`[EmailService] Preview URL: ${previewUrl}`);
  }

  return { messageId: info.messageId, previewUrl: previewUrl || null };
}

// ─── Contact Form Confirmation Template ──────────────────────────────────────

export function contactConfirmationTemplate(name: string, notes?: string) {
  return {
    subject: `Message Received — ${name.split(' ')[0]}`,
    html: baseTemplate(`
      <h2 style="color:#0f172a;font-size:22px;font-weight:700;margin:0 0 10px;">Thanks for reaching out!</h2>
      <p style="color:#334155;font-size:15px;line-height:1.65;margin:0 0 20px;">
        Hi ${name}, we've received your request and our creative production team will be in touch with you shortly.
      </p>
      ${notes ? `
      <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px;margin-bottom:24px;">
        <p style="color:#64748b;font-size:11px;text-transform:uppercase;font-weight:700;letter-spacing:1px;margin:0 0 6px;">Your inquiry</p>
        <p style="color:#0f172a;font-size:14px;line-height:1.6;margin:0;">${notes}</p>
      </div>` : ''}
      <div style="background-color:#e0e7ff;border:1px solid #c7d2fe;border-radius:10px;padding:20px;">
        <p style="color:#4338ca;font-size:11px;margin:0 0 4px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">What to expect next</p>
        <p style="color:#1e1b4b;font-size:15px;font-weight:700;margin:0 0 8px;">Response within 24 business hours</p>
        <p style="color:#3730a3;font-size:13px;line-height:1.6;margin:0;">A creative producer will review your requirements and follow up with available timelines and consultation slots.</p>
      </div>
    `, `We got your message — response within 24h`),
  };
}

// ─── Admin Lead Notification Template ────────────────────────────────────────

export function newLeadNotificationTemplate(lead: any) {
  return {
    subject: `New Lead: ${lead.name} (${lead.source || 'Website'})`,
    html: baseTemplate(`
      <h2 style="color:#0f172a;font-size:20px;font-weight:700;margin:0 0 14px;">New Lead Submitted</h2>
      
      <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:20px;margin-bottom:24px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="color:#334155;font-size:14px;line-height:1.8;">
          <tr><td width="130" style="color:#64748b;font-weight:600;">Name:</td><td><strong style="color:#0f172a;">${lead.name}</strong></td></tr>
          ${lead.email ? `<tr><td style="color:#64748b;font-weight:600;">Email:</td><td><a href="mailto:${lead.email}" style="color:#4f46e5;text-decoration:underline;">${lead.email}</a></td></tr>` : ''}
          ${lead.phone ? `<tr><td style="color:#64748b;font-weight:600;">Phone:</td><td style="color:#0f172a;">${lead.phone}</td></tr>` : ''}
          ${lead.company ? `<tr><td style="color:#64748b;font-weight:600;">Company:</td><td style="color:#0f172a;">${lead.company}</td></tr>` : ''}
          ${lead.source ? `<tr><td style="color:#64748b;font-weight:600;">Source:</td><td style="color:#0f172a;">${lead.source}</td></tr>` : ''}
          ${lead.projectType ? `<tr><td style="color:#64748b;font-weight:600;">Project Type:</td><td style="color:#0f172a;">${lead.projectType}</td></tr>` : ''}
          ${lead.estimatedBudget ? `<tr><td style="color:#64748b;font-weight:600;">Budget:</td><td style="color:#0f172a;">${lead.estimatedBudget}</td></tr>` : ''}
          ${lead.courseInterest ? `<tr><td style="color:#64748b;font-weight:600;">Course:</td><td style="color:#0f172a;">${lead.courseInterest}</td></tr>` : ''}
        </table>
      </div>

      ${lead.notes ? `
      <div style="background-color:#f1f5f9;border:1px solid #e2e8f0;border-radius:10px;padding:18px;margin-bottom:24px;">
        <p style="color:#64748b;font-size:11px;text-transform:uppercase;font-weight:700;letter-spacing:1px;margin:0 0 6px;">Notes / Inquiry</p>
        <p style="color:#1e293b;font-size:14px;line-height:1.6;margin:0;">${lead.notes}</p>
      </div>` : ''}
      
      <div style="text-align:center;margin:24px 0;">
        <a href="${process.env.PORTAL_URL || process.env.AUTH_URL || 'https://dashboard.grekam.in'}/dashboard/crm/leads" 
           style="display:inline-block;background-color:#4f46e5;color:#ffffff !important;text-decoration:none;font-size:14px;font-weight:600;padding:13px 26px;border-radius:8px;">
          View Lead in CRM &rarr;
        </a>
      </div>
    `, `New lead from ${lead.source || 'website'}...`),
  };
}

