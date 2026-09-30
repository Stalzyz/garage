import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { encryptSecret, tryDecryptSecret, maskSecret } from '../utils/secret-vault';

function encrypt(text: string): string {
  return encryptSecret(text);
}

function decrypt(text: string): string {
  return tryDecryptSecret(text) ?? '***ENCRYPTED***';
}

function maskValue(value: string): string {
  return maskSecret(value);
}

const UpsertKeySchema = z.object({
  service:  z.enum(['RAZORPAY', 'PHONEPE', 'STRIPE', 'SMTP', 'WHATSAPP', 'GOOGLE', 'OPENAI', 'META', 'GEMINI']),
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
