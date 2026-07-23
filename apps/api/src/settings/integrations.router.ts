import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const SECRET = (process.env.ENCRYPTION_SECRET || 'grekam-os-default-secret-32bytes!').slice(0, 32);
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  try {
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encrypted = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(SECRET), iv);
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch {
    return '***ENCRYPTED***';
  }
}

function maskValue(value: string): string {
  if (value.length <= 6) return '••••••';
  return value.slice(0, 4) + '••••' + value.slice(-4);
}

const UpsertKeySchema = z.object({
  service:  z.enum(['RAZORPAY', 'PHONEPE', 'STRIPE', 'SMTP', 'WHATSAPP', 'GOOGLE', 'OPENAI']),
  keyName:  z.string().min(1),
  value:    z.string().min(1),
  isActive: z.boolean().optional().default(true),
});

export default async function integrationKeysRouter(app: FastifyInstance) {
  // GET /api/v1/settings/integrations — list all keys (masked)
  app.get('/integrations', async (req, reply) => {
    const keys = await app.prisma.integrationKey.findMany({
      orderBy: [{ service: 'asc' }, { keyName: 'asc' }],
    });
    // Return masked values so secrets don't leak to the frontend
    return keys.map(k => ({
      ...k,
      encryptedValue: maskValue(decrypt(k.encryptedValue)),
    }));
  });

  // POST /api/v1/settings/integrations — upsert a key
  app.post('/integrations', async (req, reply) => {
    const { service, keyName, value, isActive } = UpsertKeySchema.parse(req.body);
    const encryptedValue = encrypt(value);

    const key = await app.prisma.integrationKey.upsert({
      where: { service_keyName: { service, keyName } },
      update: { encryptedValue, isActive },
      create: { service, keyName, encryptedValue, isActive },
    });

    return { ...key, encryptedValue: maskValue(value) };
  });

  // DELETE /api/v1/settings/integrations/:id
  app.delete('/integrations/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    await app.prisma.integrationKey.delete({ where: { id } });
    return reply.code(204).send();
  });
}

// Export decrypt helper for use in services
export { decrypt };
