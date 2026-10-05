import nodemailer from "nodemailer";

/**
 * Minimal SMTP transport for apps/web.
 *
 * apps/web has no email dependency of its own — the API keeps its mailer in
 * apps/api/src/integrations/email.service.ts, but password reset is a Next route
 * handler so it needs to send from here. Deliberately small: if this grows, move
 * it to packages/ and have the API import from there instead.
 */
function getTransporter(): nodemailer.Transporter | null {
  const host = process.env.SMTP_HOST;
  if (!host) return null;

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const transporter = getTransporter();
  if (!transporter) {
    throw new Error(
      "SMTP_HOST is not configured — cannot send email. Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS."
    );
  }

  await transporter.sendMail({
    from: process.env.SMTP_FROM || "Grekam <no-reply@grekam.in>",
    to,
    subject,
    html,
  });
}