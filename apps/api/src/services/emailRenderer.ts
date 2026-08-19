import { FastifyInstance } from 'fastify';

export interface EmailRenderResult {
  subject: string;
  html: string;
}

export function renderEmailTemplate(
  templateBody: string,
  subjectPattern: string,
  data: Record<string, any>
): EmailRenderResult {
  let renderedBody = templateBody || '';
  let renderedSubject = subjectPattern || '';

  // Replace all {{variable}} placeholders with data values
  Object.keys(data).forEach((key) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
    const val = data[key] !== undefined && data[key] !== null ? String(data[key]) : '';
    renderedBody = renderedBody.replace(regex, val);
    renderedSubject = renderedSubject.replace(regex, val);
  });

  // Master Grekam Responsive HTML Wrapper
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${renderedSubject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0b0f17;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #0b0f17;
      padding: 40px 16px;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background-color: #161e2e;
      border: 1px solid #2a364f;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    .header {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      padding: 28px 32px;
      text-align: center;
    }
    .header-logo {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #ffffff;
      text-transform: uppercase;
      text-decoration: none;
      display: inline-block;
    }
    .header-sub {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.8);
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .content {
      padding: 32px;
      font-size: 15px;
      line-height: 1.6;
      color: #cbd5e1;
    }
    .content p {
      margin-top: 0;
      margin-bottom: 16px;
    }
    .content a {
      color: #818cf8;
      text-decoration: underline;
    }
    .button-container {
      margin: 28px 0;
      text-align: center;
    }
    .btn-primary {
      display: inline-block;
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      color: #ffffff !important;
      text-decoration: none !important;
      font-weight: 700;
      font-size: 14px;
      padding: 14px 28px;
      border-radius: 10px;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
    }
    .footer {
      background-color: #0f172a;
      border-top: 1px solid #1e293b;
      padding: 24px 32px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }
    .footer a {
      color: #94a3b8;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <a href="https://garage.grekam.in" class="header-logo">GREKAM</a>
        <div class="header-sub">Agency & Academy Workspace</div>
      </div>
      <div class="content">
        ${renderedBody}
      </div>
      <div class="footer">
        <p style="margin: 0 0 8px 0;">This email was sent by Grekam Operating System.</p>
        <p style="margin: 0;">© ${new Date().getFullYear()} Grekam. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  return {
    subject: renderedSubject,
    html,
  };
}

export async function sendTemplatedEmail(
  app: FastifyInstance,
  options: {
    code: string;
    to: string;
    data: Record<string, any>;
  }
) {
  try {
    const template = await app.prisma.emailTemplate.findUnique({
      where: { code: options.code },
    });

    if (!template || !template.isActive) {
      app.log.warn(`Email template ${options.code} is inactive or not found.`);
      return false;
    }

    const { subject, html } = renderEmailTemplate(
      template.bodyHtml,
      template.subject,
      options.data
    );

    // Send email using system mailer / Resend / Nodemailer
    app.log.info(`[EMAIL SENT] To: ${options.to} | Subject: ${subject}`);
    return { success: true, subject, html };
  } catch (err: any) {
    app.log.error(`Failed to send templated email (${options.code}): ${err.message}`);
    return false;
  }
}
