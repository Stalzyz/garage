import { FastifyInstance } from 'fastify';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { decrypt } from '../settings/integrations.router';

/**
 * Resolves the Gemini API key dynamically from:
 * 1. Organization table (org.geminiApiKey)
 * 2. IntegrationKey table (service = 'GEMINI', keyName = 'GEMINI_API_KEY')
 * 3. Environment variables (process.env.GEMINI_API_KEY)
 */
export async function getGeminiApiKey(app: FastifyInstance): Promise<string | null> {
  // 1. Organization Table
  try {
    const org = await app.prisma.organization.findFirst();
    if ((org as any)?.geminiApiKey && (org as any).geminiApiKey.trim().length > 0 && (org as any).geminiApiKey !== 'dummy_key') {
      return (org as any).geminiApiKey.trim();
    }
  } catch (e) {
    // Ignore DB read errors
  }

  // 2. IntegrationKey Table
  try {
    const keyRecord = await app.prisma.integrationKey.findFirst({
      where: { service: 'GEMINI', keyName: 'GEMINI_API_KEY', isActive: true },
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
  const envKey = process.env.GEMINI_API_KEY;
  if (envKey && envKey.trim().length > 0 && envKey !== 'dummy_key') {
    return envKey.trim();
  }

  return null;
}

/**
 * Instantiates a Google Generative AI client using the resolved API key.
 * Throws a clean user-facing error if no key is configured.
 */
export async function getGeminiClient(app: FastifyInstance): Promise<GoogleGenerativeAI> {
  const apiKey = await getGeminiApiKey(app);
  if (!apiKey) {
    throw new Error('Gemini API Key is not configured. Please add your free key from https://aistudio.google.com/apikey under Settings → Integrations.');
  }
  return new GoogleGenerativeAI(apiKey);
}

/**
 * Helper: Generate text from Gemini and parse as JSON.
 * Uses gemini-2.0-flash-exp model with JSON response mode.
 */
export async function generateJsonFromGemini(
  app: FastifyInstance,
  systemPrompt: string,
  userPrompt: string
): Promise<any> {
  const genAI = await getGeminiClient(app);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.7,
    },
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContent(userPrompt);
  const text = result.response.text();
  return JSON.parse(text);
}

/**
 * Helper: Generate plain text from Gemini.
 */
export async function generateTextFromGemini(
  app: FastifyInstance,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const genAI = await getGeminiClient(app);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.7,
    },
    systemInstruction: systemPrompt,
  });

  const result = await model.generateContent(userPrompt);
  return result.response.text();
}
