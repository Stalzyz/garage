import { FastifyInstance } from 'fastify';
import OpenAI from 'openai';
import { decrypt } from '../settings/integrations.router';

/**
 * Resolves the OpenAI API key dynamically from:
 * 1. Organization table (org.openAiKey)
 * 2. IntegrationKey table (service = 'OPENAI', keyName = 'OPENAI_API_KEY')
 * 3. Environment variables (process.env.OPENAI_API_KEY)
 */
export async function getOpenAiApiKey(app: FastifyInstance): Promise<string | null> {
  // 1. Organization Table
  try {
    const org = await app.prisma.organization.findFirst();
    if (org?.openAiKey && org.openAiKey.trim().length > 0 && org.openAiKey !== 'dummy_key') {
      return org.openAiKey.trim();
    }
  } catch (e) {
    // Ignore DB read errors
  }

  // 2. IntegrationKey Table
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

  // 3. Environment Variable
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
