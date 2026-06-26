import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import * as OTPAuth from 'otpauth';
import * as QRCode from 'qrcode';
import crypto from 'crypto';

function generateBackupCodes(count = 8): string[] {
  return Array.from({ length: count }, () => crypto.randomBytes(4).toString('hex').toUpperCase());
}

export default async function twoFaRouter(app: FastifyInstance) {

  // POST /api/v1/auth/2fa/setup — Generate secret + QR code for authenticated user
  app.post('/2fa/setup', async (req: any, reply) => {
    const userId = req.user?.id;
    if (!userId) return reply.unauthorized();

    const user = await app.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return reply.notFound();

    // Generate TOTP secret
    const totp = new OTPAuth.TOTP({
      issuer: 'Grekam OS',
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: new OTPAuth.Secret({ size: 16 }),
    });

    const secret = totp.secret.base32;
    const otpAuthUrl = totp.toString();

    // Generate QR code as data URI
    const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

    // Generate backup codes
    const backupCodes = generateBackupCodes();

    // Store secret temporarily — user must verify before it's activated
    await app.prisma.user.update({
      where: { id: userId },
      data: {
        twoFaSecret: secret,
        twoFaEnabled: false, // Not active until verified
        twoFaBackupCodes: JSON.stringify(backupCodes),
      } as any,
    });

    return { qrCode: qrCodeDataUrl, secret, backupCodes };
  });

  // POST /api/v1/auth/2fa/verify — Verify the 6-digit code to activate 2FA
  app.post('/2fa/verify', async (req: any, reply) => {
    const { code } = z.object({ code: z.string().length(6) }).parse(req.body);
    const userId = req.user?.id;
    if (!userId) return reply.unauthorized();

    const user = await app.prisma.user.findUnique({ where: { id: userId } }) as any;
    if (!user?.twoFaSecret) return reply.badRequest('2FA setup not initiated.');

    const totp = new OTPAuth.TOTP({
      issuer: 'Grekam OS',
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: OTPAuth.Secret.fromBase32(user.twoFaSecret),
    });

    const delta = totp.validate({ token: code, window: 1 });
    if (delta === null) return reply.badRequest('Invalid or expired code.');

    await app.prisma.user.update({
      where: { id: userId },
      data: { twoFaEnabled: true } as any,
    });

    return { success: true, message: '2FA has been enabled on your account.' };
  });

  // POST /api/v1/auth/2fa/disable
  app.post('/2fa/disable', async (req: any, reply) => {
    const { code } = z.object({ code: z.string().min(6) }).parse(req.body);
    const userId = req.user?.id;
    if (!userId) return reply.unauthorized();

    const user = await app.prisma.user.findUnique({ where: { id: userId } }) as any;
    if (!user?.twoFaEnabled) return reply.badRequest('2FA is not enabled.');

    const totp = new OTPAuth.TOTP({
      secret: OTPAuth.Secret.fromBase32(user.twoFaSecret),
      algorithm: 'SHA1', digits: 6, period: 30,
    });

    const delta = totp.validate({ token: code, window: 1 });
    if (delta === null) return reply.badRequest('Invalid code.');

    await app.prisma.user.update({
      where: { id: userId },
      data: { twoFaEnabled: false, twoFaSecret: null, twoFaBackupCodes: null } as any,
    });

    return { success: true };
  });
}
