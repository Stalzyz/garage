import { EmailService } from '../automations/email.service';

async function test() {
  console.log("Sending test email to mstalinkumar05@gmail.com...");
  const success = await EmailService.sendEmail(
    'mstalinkumar05@gmail.com',
    'Grekam OS Test Email via EmailService',
    '<h1>Test Email</h1><p>If you receive this, the email service is working perfectly!</p>'
  );
  console.log("Email sent success?", success);
}
test();
