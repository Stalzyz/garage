import { FastifyInstance } from 'fastify';

export default async function meRouter(app: FastifyInstance) {
  app.get('/me', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const userId = req.user.id;

    const user = await app.prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: { select: { id: true } },
        employee: { select: { id: true } },
        clientProfile: { select: { id: true } },
      }
    });

    if (!user) {
      return reply.notFound('User not found in database');
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        studentId: user.student?.id || null,
        employeeId: user.employee?.id || null,
        clientId: user.clientProfile?.id || null,
        avatarUrl: user.avatarUrl,
      }
    };
  });

  app.post('/password', {
    preHandler: [app.requireAuth],
    schema: {
      body: require('zod').z.object({
        currentPassword: require('zod').z.string(),
        newPassword: require('zod').z.string().min(8)
      })
    }
  }, async (req: any, reply) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await app.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return reply.notFound('User not found');

    const bcrypt = require('bcryptjs');
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) return reply.status(400).send({ error: 'Invalid current password' });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await app.prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    return { success: true };
  });

  app.post('/forgot-password', {
    schema: {
      body: require('zod').z.object({
        email: require('zod').z.string().email(),
        portalType: require('zod').z.enum(['ADMIN', 'CLIENT']).default('CLIENT')
      })
    }
  }, async (req: any, reply) => {
    const { email, portalType } = req.body;

    const user = await app.prisma.user.findUnique({ where: { email } });
    if (!user) {
      return { success: true, message: 'If an account exists, a temporary password has been sent.' };
    }

    const tempPassword = Math.random().toString(36).slice(-8) + "!";
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    await app.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash }
    });

    const loginUrl = portalType === 'CLIENT' 
      ? (process.env.PORTAL_URL || 'https://garage.grekam.in/portal')
      : (process.env.AUTH_URL || 'https://garage.grekam.in/auth/login');

    const emailHtml = `
      <div style="font-family: 'Inter', -apple-system, sans-serif; background-color: #f9fafb; padding: 40px 20px; color: #1f2937;">
        <div style="max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="background-color: #1e3a8a; padding: 32px; text-align: center;">
            <h2 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.025em;">Password Recovery</h2>
          </div>
          <div style="padding: 40px 32px;">
            <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin-top: 0;">Hi ${user.firstName},</p>
            <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">You requested a password reset. You can log in using your new temporary password below:</p>
            
            <div style="background-color: #f3f4f6; border-radius: 8px; padding: 20px; margin: 28px 0; border: 1px solid #e5e7eb;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #6b7280; font-weight: 600; width: 100px;">Portal Link</td>
                  <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #1e3a8a;"><a href="${loginUrl}" style="color: #1e3a8a; text-decoration: underline;">${loginUrl}</a></td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #6b7280; font-weight: 600;">Email</td>
                  <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #111827;">${user.email}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #6b7280; font-weight: 600;">Temporary Password</td>
                  <td style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #b91c1c; font-family: monospace; letter-spacing: 1px;">${tempPassword}</td>
                </tr>
              </table>
            </div>

            <div style="text-align: center; margin: 28px 0 16px 0;">
              <a href="${loginUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 14px; text-decoration: none; display: inline-block;">Log In</a>
            </div>

            <p style="font-size: 12px; line-height: 1.5; color: #9ca3af; text-align: center; margin-top: 36px; border-top: 1px solid #f3f4f6; padding-top: 20px;">
              Please change this password immediately after logging in.
            </p>
          </div>
        </div>
      </div>
    `;

    const { EmailService } = require('../automations/email.service');
    await EmailService.sendEmail(
      user.email,
      'Your Temporary Password',
      emailHtml,
      '"Grekam OS" <admin@grekam.in>'
    );

    return { success: true, message: 'Temporary password sent.' };
  });
}
