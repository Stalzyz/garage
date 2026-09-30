import nodemailer from 'nodemailer';
import { prisma } from '../db';
import { decrypt } from '../settings/integrations.router';
import { Resend } from 'resend';

/**
 * Resolve the Resend API key, preferring the encrypted vault.
 *
 * Order:
 *   1. integration_keys  (service RESEND / RESEND_API_KEY) — encrypted at rest.
 *   2. organization.resendApiKey — legacy plaintext column, kept so an existing
 *      deployment that set it there keeps delivering mail.
 */
async function getResendApiKey(): Promise<string | null> {
  try {
    const key = await prisma.integrationKey.findFirst({
      where: { service: 'RESEND', keyName: 'RESEND_API_KEY', isActive: true },
    });
    if (key?.encryptedValue) {
      const value = decrypt(key.encryptedValue);
      if (value && value.trim().length > 0) return value.trim();
    }
  } catch (e) {
    // Fall through to the legacy column rather than failing the send.
  }

  try {
    const org = await prisma.organization.findFirst();
    if (org?.resendApiKey && org.resendApiKey.trim().length > 0) {
      return org.resendApiKey.trim();
    }
  } catch (e) {
    // Ignore DB read errors.
  }

  return null;
}

export const EmailService = {
  async sendEmail(to: string, subject: string, htmlContent: string, fromOverride?: string) {
    try {
      const defaultCc = 'greeksacademy@gmail.com';
      const ccList = to.toLowerCase() !== defaultCc.toLowerCase() ? [defaultCc] : undefined;

      // 1. Resend API key, preferring the encrypted IntegrationKey vault.
      //    The legacy org.resendApiKey column is plaintext and is read only as a
      //    fallback so an existing deployment keeps working; setting the key under
      //    Settings > Integrations moves it into the vault. (The org page that
      //    used to be the only place to enter it has been removed as a duplicate.)
      const resendKey = await getResendApiKey();
      if (resendKey) {
        const resend = new Resend(resendKey);
        const data = await resend.emails.send({
          from: fromOverride || 'Grekam OS <onboarding@resend.dev>', // Should ideally be configured or verified domain
          to: [to],
          cc: ccList,
          subject,
          html: htmlContent
        });
        console.log(`[EmailService] Sent email via Resend to ${to} (CC: ${ccList || 'none'}) | ID: ${data.data?.id}`);
        return true;
      }

      // 2. Fallback to SMTP
      const keys = await prisma.integrationKey.findMany({
        where: { service: 'SMTP', isActive: true }
      });
      console.log('[EmailService Automations] Found SMTP keys:', keys.length);

      let host = process.env.SMTP_HOST || 'smtp.ethereal.email';
      let port = parseInt(process.env.SMTP_PORT || '587');
      let user = process.env.SMTP_USER || 'ethereal_user';
      let pass = process.env.SMTP_PASS || 'ethereal_pass';
      let fromAddress = fromOverride || '"Grekam OS" <noreply@grekam.com>';

      for (const k of keys) {
        if (k.keyName === 'SMTP_HOST') host = decrypt(k.encryptedValue);
        if (k.keyName === 'SMTP_PORT') port = parseInt(decrypt(k.encryptedValue));
        if (k.keyName === 'SMTP_USER') user = decrypt(k.encryptedValue);
        if (k.keyName === 'SMTP_PASS') pass = decrypt(k.encryptedValue);
        if (!fromOverride && k.keyName === 'SMTP_FROM') fromAddress = decrypt(k.encryptedValue);
      }

      if (fromAddress && !fromAddress.includes('<')) {
        fromAddress = `"${fromAddress}" <${user}>`;
      }

      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });

      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        cc: ccList,
        subject,
        html: htmlContent,
      });
      console.log(`[EmailService] Sent email via SMTP to ${to} (CC: ${ccList || 'none'}) | MessageId: ${info.messageId}`);
      
      if (info.messageId && nodemailer.getTestMessageUrl(info)) {
         console.log(`[EmailService] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
      
      return true;
    } catch (err) {
      console.error(`[EmailService] Failed to send email to ${to}`, err);
      return false;
    }
  }
};
