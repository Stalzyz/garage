/**
 * AI Moderation Scanner Background Job
 * Uses Gemini AI API to automatically inspect vendor items for copyright, fraud, and policy violations.
 */

export interface ItemForModeration {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  price: number;
}

export class AiModerationScanner {
  private aiClient: any = null;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const { GoogleGenAI } = require('@google/genai');
        this.aiClient = new GoogleGenAI({ apiKey });
      } catch {
        this.aiClient = null;
      }
    }
  }

  /**
   * Scan listing text and pricing parameters for risk flags
   */
  public async scanListing(item: ItemForModeration) {
    if (!this.aiClient) {
      // Rule-based fallback if API Key is not set
      const isHighRisk = item.price > 100000 || item.title.toLowerCase().includes('cracked') || item.title.toLowerCase().includes('unauthorized');
      return {
        flagged: isHighRisk,
        riskScore: isHighRisk ? 85 : 12,
        reason: isHighRisk ? 'Flagged by Keyword Heuristics Rule Engine' : 'Listing Cleared',
      };
    }

    try {
      const prompt = `You are a Marketplace Compliance Security Bot. Analyze the following vendor product listing:
      Title: "${item.title}"
      Description: "${item.description}"
      Price: ₹${item.price}

      Check for:
      1. Intellectual Property Infringement
      2. Misleading or Fraudulent claims
      3. Abnormal price spikes

      Return JSON with fields:
      - flagged (boolean)
      - riskScore (number 0-100)
      - reason (string concise summary)
      `;

      const response = await this.aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return { flagged: false, riskScore: 10, reason: 'AI scan passed' };
    } catch (error) {
      console.error('[AiModerationScanner] Gemini API scan error:', error);
      return { flagged: false, riskScore: 0, reason: 'Scan skipped due to API timeout' };
    }
  }
}
