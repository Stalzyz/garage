import nodemailer from 'nodemailer';
import { prisma } from '../db';
import { decrypt } from '../settings/integrations.router';
import { Resend } from 'resend';

export const EmailService = {
  async sendEmail(to: string, subject: string, htmlContent: string) {
    try {
      // 1. Check if Organization has Resend API Key
      const org = await prisma.organization.findFirst();
      if (org?.resendApiKey) {
        const resend = new Resend(org.resendApiKey);
        const data = await resend.emails.send({
          from: 'Grekam OS <onboarding@resend.dev>', // Should ideally be configured or verified domain
          to: [to],
          subject,
          html: htmlContent
        });
        console.log(`[EmailService] Sent email via Resend to ${to} | ID: ${data.data?.id}`);
        return true;
      }

      // 2. Fallback to SMTP
      const keys = await prisma.integrationKey.findMany({
        where: { service: 'SMTP', isActive: true }
      });

      let host = process.env.SMTP_HOST || 'smtp.ethereal.email';
      let port = parseInt(process.env.SMTP_PORT || '587');
      let user = process.env.SMTP_USER || 'ethereal_user';
      let pass = process.env.SMTP_PASS || 'ethereal_pass';
      let fromAddress = '"Grekam OS" <noreply@grekam.com>';

      for (const k of keys) {
        if (k.keyName === 'SMTP_HOST') host = decrypt(k.encryptedValue);
        if (k.keyName === 'SMTP_PORT') port = parseInt(decrypt(k.encryptedValue));
        if (k.keyName === 'SMTP_USER') user = decrypt(k.encryptedValue);
        if (k.keyName === 'SMTP_PASS') pass = decrypt(k.encryptedValue);
        if (k.keyName === 'SMTP_FROM') fromAddress = decrypt(k.encryptedValue);
      }

      const transporter = nodemailer.createTransport({
        host,
        port,
        auth: { user, pass },
      });

      const info = await transporter.sendMail({
        from: fromAddress,
        to,
        subject,
        html: htmlContent,
      });
      console.log(`[EmailService] Sent email via SMTP to ${to} | MessageId: ${info.messageId}`);
      
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
