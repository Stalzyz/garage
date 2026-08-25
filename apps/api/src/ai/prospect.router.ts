import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getOpenAiClient } from '../utils/openai';
import { scrapeWebsiteText } from '../utils/scraper';

const ProspectSchema = z.object({
  urlInput: z.string().min(1, 'Please enter a website domain, company name, or LinkedIn profile URL.'),
});

export default async function aiProspectRouter(app: FastifyInstance) {
  app.post('/prospect', async (req, reply) => {
    const { urlInput } = ProspectSchema.parse(req.body);

    try {
      const openai = await getOpenAiClient(app);

      // 1. Perform live web scraping in background (0-cost)
      app.log.info(`[Prospect Scraper] Scraping target: ${urlInput}`);
      const scrapedData = await scrapeWebsiteText(urlInput);

      const systemPrompt = `
You are an expert B2B sales intelligence & prospect enrichment assistant.
You analyze prospect inputs and live scraped website content to return enriched business intelligence and 3 hyper-personalized sales outreach icebreakers.

Response MUST be valid JSON only with this exact structure:
{
  "name": "Person Name or Key Decision Maker / Founder",
  "company": "Company Name",
  "role": "Job Title / Executive Role",
  "industry": "Industry / Sector",
  "location": "City, Country or Region",
  "bio": "A concise 2-sentence summary of what the company/person does based on their live website",
  "scrapedLive": true,
  "icebreakers": [
    { "type": "Email Subject", "text": "Compelling email subject line tailored specifically to their live products/services" },
    { "type": "Cold Call Opener", "text": "Natural, value-focused 2-sentence phone script opener mentioning their exact offering" },
    { "type": "LinkedIn DM", "text": "Professional, personalized 2-3 sentence LinkedIn message connecting their value to yours" }
  ]
}
Do NOT include markdown formatting or extra text outside JSON.
`.trim();

      let userPrompt = `Target Prospect Input: "${urlInput}"\n`;

      if (scrapedData) {
        app.log.info(`[Prospect Scraper] Successfully scraped ${scrapedData.title}`);
        userPrompt += `\n--- REAL-TIME LIVE SCRAPED WEBPAGE DATA ---
Site URL: ${scrapedData.url}
Page Title: ${scrapedData.title}
Meta Description: ${scrapedData.description}
Key Headings: ${scrapedData.headings.join(' | ')}
Extracted Text Content:
${scrapedData.snippetText}
------------------------------------------
Use the above live scraped data to generate 100% accurate, tailored intelligence and icebreakers.`;
      } else {
        app.log.warn(`[Prospect Scraper] Could not scrape live HTML for ${urlInput}, relying on AI knowledge base.`);
        userPrompt += `\nProvide realistic, intelligence-backed enrichment data and icebreakers for this prospect based on your knowledge base.`;
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.6,
      });

      const rawContent = response.choices[0]?.message?.content || '{}';
      
      // Parse JSON safely
      let cleanedJson = rawContent.trim();
      if (cleanedJson.startsWith('```')) {
        cleanedJson = cleanedJson.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
      }

      const result = JSON.parse(cleanedJson);
      result.scrapedLive = !!scrapedData;

      return reply.send({
        success: true,
        prospect: result,
      });
    } catch (error: any) {
      app.log.error({ err: error }, 'AI Prospecting Enrichment Error');
      return reply.code(500).send({
        success: false,
        error: error.message || 'Failed to generate prospect enrichment.',
      });
    }
  });
}
