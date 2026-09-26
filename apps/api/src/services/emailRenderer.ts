import { FastifyInstance } from 'fastify';
import { sendEmail, buildMasterEmailHtml, OrgEmailTheme } from '../integrations/email.service';

export interface EmailRenderResult {
  subject: string;
  html: string;
}

export function renderEmailTemplate(
  templateBody: string,
  subjectPattern: string,
  data: Record<string, any>,
  theme?: OrgEmailTheme
): EmailRenderResult {
  let renderedBody = templateBody || '';
  let renderedSubject = subjectPattern || '';

  const primary = theme?.primaryColor || '#2563eb';

  // Replace all {{variable}} placeholders with data values
  Object.keys(data).forEach((key) => {
    const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`{{\\s*${escapedKey}\\s*}}`, 'gi');
    const val = data[key] !== undefined && data[key] !== null ? String(data[key]) : '';
    renderedBody = renderedBody.replace(regex, val);
    renderedSubject = renderedSubject.replace(regex, val);
  });

  // Automatically inline button and paragraph styles with organization primary color
  renderedBody = renderedBody.replace(
    /class=["']btn-primary["']/gi,
    `style="display:inline-block;background-color:${primary};color:#ffffff !important;text-decoration:none !important;font-weight:600;font-size:14px;padding:13px 26px;border-radius:8px;text-align:center;box-shadow:0 2px 4px rgba(0,0,0,0.1);"`
  );

  renderedBody = renderedBody.replace(
    /class=["']button-container["']/gi,
    `style="margin:26px 0;text-align:center;"`
  );

  // Wrap inside the master client-safe responsive email layout
  const html = buildMasterEmailHtml(renderedBody, renderedSubject, '', theme);

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

    const org = await app.prisma.organization.findFirst({
      select: { primaryColor: true, secondaryColor: true, accentColor: true, companyName: true, name: true, logoUrl: true }
    });

    const orgTheme: OrgEmailTheme | undefined = org ? {
      primaryColor: org.primaryColor || '#2563eb',
      secondaryColor: org.secondaryColor || '#1e293b',
      accentColor: org.accentColor || '#38bdf8',
      companyName: org.companyName || org.name || 'Grekam Visuals',
      logoUrl: org.logoUrl || undefined
    } : undefined;

    const { subject, html } = renderEmailTemplate(
      template.bodyHtml,
      template.subject,
      options.data,
      orgTheme
    );

    // Send email using real SMTP transport!
    const result = await sendEmail(options.to, { subject, html });
    app.log.info(`[EMAIL TRANSMITTED] To: ${options.to} | Subject: ${subject} | MessageId: ${result.messageId}`);
    return { success: true, subject, html, messageId: result.messageId, previewUrl: result.previewUrl };
  } catch (err: any) {
    app.log.error(`Failed to send templated email (${options.code}): ${err.message}`);
    return false;
  }
}
