import nodemailer from 'nodemailer';

// ─── Transporter ────────────────────────────────────────────────────────────
// Uses Gmail SMTP if configured, otherwise falls back to Ethereal (auto-created
// test account so emails are always "sent" without real credentials).

let transporter: nodemailer.Transporter | null = null;

async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  } else {
    // Ethereal test account — no config needed, check console for preview URL
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log('[EmailService] Using Ethereal test account:', testAccount.user);
  }

  return transporter;
}

// ─── Base HTML Template ─────────────────────────────────────────────────────

function baseTemplate(content: string, preheader = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Grekam Visuals</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  ${preheader ? `<span style="display:none;max-height:0;overflow:hidden;">${preheader}</span>` : ''}
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#14141f;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4c1d95,#1e3a8a);padding:32px 40px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="width:40px;height:40px;background:rgba(255,255,255,0.15);border-radius:10px;text-align:center;line-height:40px;font-size:20px;">✦</td>
                <td style="padding-left:12px;">
                  <div style="color:#fff;font-size:14px;font-weight:700;">Grekam Visuals</div>
                  <div style="color:rgba(255,255,255,0.5);font-size:10px;letter-spacing:2px;text-transform:uppercase;">Client Portal</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Content -->
        <tr><td style="padding:40px;">${content}</td></tr>
        <!-- Footer -->
        <tr>
          <td style="background:rgba(255,255,255,0.03);border-top:1px solid rgba(255,255,255,0.06);padding:24px 40px;text-align:center;">
            <p style="color:rgba(255,255,255,0.25);font-size:11px;margin:0;">© 2025 Grekam Visuals Pvt. Ltd. · Bangalore, India</p>
            <p style="color:rgba(255,255,255,0.15);font-size:10px;margin:8px 0 0;">You're receiving this because you're a Grekam client. <a href="#" style="color:#7c3aed;">Unsubscribe</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Email Templates ─────────────────────────────────────────────────────────

export const EmailTemplates = {

  proposalReady: (clientName: string, proposalTitle: string, proposalId: string) => ({
    subject: `📋 Your Proposal is Ready — ${proposalTitle}`,
    html: baseTemplate(`
      <h2 style="color:#fff;font-size:22px;margin:0 0 8px;">Hi ${clientName},</h2>
      <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin:0 0 24px;">
        We've prepared a proposal for you. Please review it at your earliest convenience and let us know if you'd like to proceed or have any questions.
      </p>
      <div style="background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.3);border-radius:12px;padding:20px;margin-bottom:28px;">
        <div style="color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Proposal</div>
        <div style="color:#fff;font-size:16px;font-weight:600;">${proposalTitle}</div>
        <div style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:4px;">Ref: ${proposalId}</div>
      </div>
      <a href="${process.env.PORTAL_URL || 'http://localhost:3000'}/portal" 
         style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:14px;">
        View Proposal →
      </a>
      <p style="color:rgba(255,255,255,0.3);font-size:12px;margin-top:28px;">
        This proposal is valid for 30 days. If you have any questions, reply to this email or contact your project manager.
      </p>
    `, `Your proposal "${proposalTitle}" is ready for review`),
  }),

  projectUpdate: (clientName: string, projectName: string, phase: string, progress: number) => ({
    subject: `🚀 Project Update — ${projectName} is now ${progress}% complete`,
    html: baseTemplate(`
      <h2 style="color:#fff;font-size:22px;margin:0 0 8px;">Project Update</h2>
      <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin:0 0 24px;">
        Hi ${clientName}, great news! Your project <strong style="color:#fff;">${projectName}</strong> has moved to a new phase.
      </p>
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:24px;">
        <div style="color:rgba(255,255,255,0.4);font-size:11px;margin-bottom:12px;text-transform:uppercase;letter-spacing:1px;">Current Phase</div>
        <div style="color:#a78bfa;font-size:18px;font-weight:700;margin-bottom:16px;">${phase}</div>
        <div style="height:8px;background:rgba(255,255,255,0.08);border-radius:4px;overflow:hidden;">
          <div style="height:100%;width:${progress}%;background:linear-gradient(90deg,#7c3aed,#2563eb);border-radius:4px;"></div>
        </div>
        <div style="color:rgba(255,255,255,0.4);font-size:12px;margin-top:8px;text-align:right;">${progress}% Complete</div>
      </div>
      <a href="${process.env.PORTAL_URL || 'http://localhost:3000'}/portal/dashboard"
         style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:14px;">
        View in Portal →
      </a>
    `, `${projectName} is ${progress}% complete`),
  }),

  invoiceDue: (clientName: string, invoiceId: string, amount: number, dueDate: string) => ({
    subject: `🧾 Invoice ${invoiceId} Due on ${dueDate}`,
    html: baseTemplate(`
      <h2 style="color:#fff;font-size:22px;margin:0 0 8px;">Invoice Reminder</h2>
      <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin:0 0 24px;">
        Hi ${clientName}, this is a friendly reminder that the following invoice is due soon.
      </p>
      <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);border-radius:12px;padding:24px;margin-bottom:28px;">
        <div style="color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Invoice</div>
        <div style="color:#fff;font-size:16px;font-weight:700;margin-bottom:16px;">${invoiceId}</div>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="color:rgba(255,255,255,0.4);font-size:13px;">Amount Due</td>
            <td align="right" style="color:#fff;font-size:20px;font-weight:700;">₹${amount.toLocaleString('en-IN')}</td>
          </tr>
          <tr>
            <td style="color:rgba(255,255,255,0.4);font-size:13px;padding-top:8px;">Due Date</td>
            <td align="right" style="color:#f59e0b;font-size:14px;font-weight:600;padding-top:8px;">${dueDate}</td>
          </tr>
        </table>
      </div>
      <a href="${process.env.PORTAL_URL || 'http://localhost:3000'}/portal/dashboard"
         style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:14px;">
        View & Pay Invoice →
      </a>
    `, `Invoice ${invoiceId} for ₹${amount.toLocaleString('en-IN')} is due ${dueDate}`),
  }),

  deliverableReady: (clientName: string, projectName: string, fileName: string) => ({
    subject: `📦 Deliverable Ready — ${fileName}`,
    html: baseTemplate(`
      <h2 style="color:#fff;font-size:22px;margin:0 0 8px;">Your file is ready!</h2>
      <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin:0 0 24px;">
        Hi ${clientName}, a new deliverable has been uploaded for your project <strong style="color:#fff;">${projectName}</strong>.
      </p>
      <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:12px;padding:20px;margin-bottom:28px;">
        <div style="color:rgba(255,255,255,0.4);font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">File Ready</div>
        <div style="color:#34d399;font-size:15px;font-weight:600;">📄 ${fileName}</div>
      </div>
      <a href="${process.env.PORTAL_URL || 'http://localhost:3000'}/portal/dashboard"
         style="display:inline-block;background:linear-gradient(135deg,#059669,#0284c7);color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:14px;">
        Download File →
      </a>
    `, `${fileName} is ready for download`),
  }),

  // ── Drip sequence ──────────────────────────────────────────────────────────

  dripWelcome: (clientName: string) => ({
    subject: `✦ Welcome to Grekam Visuals, ${clientName}!`,
    html: baseTemplate(`
      <h2 style="color:#fff;font-size:24px;margin:0 0 8px;">Welcome aboard, ${clientName}! 🎉</h2>
      <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin:0 0 20px;">
        We're excited to start working with you. Here's everything you need to know to get started with your Grekam Client Portal.
      </p>
      ${['Track your project in real-time', 'Download deliverables instantly', 'Review and approve proposals', 'View and pay invoices'].map(item =>
        `<div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
          <span style="color:#7c3aed;font-size:18px;">✓</span>
          <span style="color:rgba(255,255,255,0.7);font-size:14px;">${item}</span>
        </div>`).join('')}
      <br/>
      <a href="${process.env.PORTAL_URL || 'http://localhost:3000'}/portal"
         style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:14px;margin-top:12px;">
        Access Your Portal →
      </a>
    `, `Welcome to Grekam Visuals — your portal is ready`),
  }),

  dripFollowUp3Days: (clientName: string, projectName: string) => ({
    subject: `👋 Quick check-in on ${projectName}`,
    html: baseTemplate(`
      <h2 style="color:#fff;font-size:22px;margin:0 0 8px;">How are things going?</h2>
      <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin:0 0 20px;">
        Hi ${clientName}, it's been a few days since we kicked off <strong style="color:#fff;">${projectName}</strong>.
        We just wanted to check in — do you have any questions or feedback so far?
      </p>
      <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin:0 0 24px;">
        You can reply directly to this email or message your project manager through the portal.
      </p>
      <a href="${process.env.PORTAL_URL || 'http://localhost:3000'}/portal/dashboard"
         style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:14px;">
        Open Portal →
      </a>
    `, `Quick check-in on your project with Grekam`),
  }),

  dripWeekly: (clientName: string, projectName: string, progress: number, nextMilestone: string) => ({
    subject: `📊 Weekly Update — ${projectName} (${progress}% done)`,
    html: baseTemplate(`
      <h2 style="color:#fff;font-size:22px;margin:0 0 8px;">Weekly Project Update</h2>
      <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin:0 0 20px;">
        Hi ${clientName}, here's your weekly update for <strong style="color:#fff;">${projectName}</strong>.
      </p>
      <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:24px;">
        <div style="color:rgba(255,255,255,0.4);font-size:12px;margin-bottom:12px;">Overall Progress</div>
        <div style="height:10px;background:rgba(255,255,255,0.08);border-radius:5px;overflow:hidden;margin-bottom:8px;">
          <div style="height:100%;width:${progress}%;background:linear-gradient(90deg,#7c3aed,#2563eb);border-radius:5px;"></div>
        </div>
        <div style="color:#fff;font-size:18px;font-weight:700;">${progress}% Complete</div>
        <div style="color:rgba(255,255,255,0.4);font-size:13px;margin-top:12px;">Next Milestone: <span style="color:#a78bfa;">${nextMilestone}</span></div>
      </div>
      <a href="${process.env.PORTAL_URL || 'http://localhost:3000'}/portal/dashboard"
         style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:14px;">
        View Full Details →
      </a>
    `, `${projectName} is ${progress}% complete — weekly update`),
  }),
};

// ─── Send Function ────────────────────────────────────────────────────────────

export async function sendEmail(to: string, template: { subject: string; html: string }) {
  const t = await getTransporter();
  const from = process.env.SMTP_FROM || '"Grekam Visuals" <no-reply@grekam.in>';

  const info = await t.sendMail({ from, to, subject: template.subject, html: template.html });

  // Log Ethereal preview URL in dev
  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log(`[EmailService] Preview URL: ${previewUrl}`);
  }

  return { messageId: info.messageId, previewUrl: previewUrl || null };
}
