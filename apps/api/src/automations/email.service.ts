import nodemailer from 'nodemailer';
import { prisma } from '../db';
import { decrypt } from '../settings/integrations.router';

export const EmailService = {
  async sendEmail(to: string, subject: string, htmlContent: string) {
    try {
      // 1. Fetch SMTP keys from database
      const keys = await prisma.integrationKey.findMany({
        where: { service: 'SMTP', isActive: true }
      });

      // 2. Fallback to process.env if no keys in DB
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

      // 3. Create transporter dynamically
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
      console.log(`[EmailService] Sent email to ${to} | MessageId: ${info.messageId}`);
      
      // If using Ethereal, log the preview URL so we can actually see the emails during dev
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
