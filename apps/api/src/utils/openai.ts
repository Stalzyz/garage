import { FastifyInstance } from 'fastify';
import OpenAI from 'openai';
import { decrypt } from '../settings/integrations.router';

/**
 * Resolves the OpenAI API key dynamically from:
 * 1. IntegrationKey table (service = 'OPENAI', keyName = 'OPENAI_API_KEY')
 * 2. Environment variables (process.env.OPENAI_API_KEY)
 *
 * The key used to be read from organization.openAiKey first. That column stores
 * the secret in plaintext, was echoed back in plaintext by
 * GET /settings/organization, and took priority over the encrypted vault key —
 * so a stale value typed there would silently override the real one. The only UI
 * that could set it (the duplicate Organization & Branding page) is gone, the
 * column is NULL everywhere in production, and the error message below already
 * points users at Settings > Integrations, so the branch is removed rather than
 * left as a shadowing trap.
 */
export async function getOpenAiApiKey(app: FastifyInstance): Promise<string | null> {
  // 1. IntegrationKey Table
  try {
    const keyRecord = await app.prisma.integrationKey.findFirst({
      where: { service: 'OPENAI', keyName: 'OPENAI_API_KEY', isActive: true },
    });
    if (keyRecord?.encryptedValue) {
      const decrypted = decrypt(keyRecord.encryptedValue);
      if (decrypted && decrypted !== '***ENCRYPTED***' && decrypted !== 'dummy_key') {
        return decrypted.trim();
      }
    }
  } catch (e) {
    // Ignore DB read errors
  }

  // 2. Environment Variable
  const envKey = process.env.OPENAI_API_KEY;
  if (envKey && envKey.trim().length > 0 && envKey !== 'dummy_key') {
    return envKey.trim();
  }

  return null;
}

/**
 * Instantiates an OpenAI SDK client using the resolved API key.
 * Throws a clean user-facing error if no key is configured.
 */
export async function getOpenAiClient(app: FastifyInstance): Promise<OpenAI> {
  const apiKey = await getOpenAiApiKey(app);
  if (!apiKey) {
    throw new Error('OpenAI API Key is not configured. Please add your key under Settings > Integrations in the dashboard.');
  }

  return new OpenAI({ apiKey });
}
