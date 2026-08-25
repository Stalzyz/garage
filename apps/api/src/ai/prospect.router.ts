import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getOpenAiClient } from '../utils/openai';

const ProspectSchema = z.object({
  urlInput: z.string().min(1, 'Please enter a website domain, company name, or LinkedIn profile URL.'),
});

export default async function aiProspectRouter(app: FastifyInstance) {
  app.post('/prospect', async (req, reply) => {
    const { urlInput } = ProspectSchema.parse(req.body);

    try {
      const openai = await getOpenAiClient(app);

      const systemPrompt = `
You are an expert B2B sales intelligence & prospect enrichment assistant.
Given a website URL, LinkedIn profile URL, or company/person name input, analyze and return a JSON object with enriched prospect information and highly personalized sales outreach icebreakers.

Response MUST be valid JSON only with this exact structure:
{
  "name": "Person Name or Key Decision Maker",
  "company": "Company Name",
  "role": "Job Title / Role",
  "industry": "Industry / Sector",
  "location": "City, Country or Region",
  "bio": "A concise 2-sentence summary of the company/person",
  "icebreakers": [
    { "type": "Email Subject", "text": "Compelling email subject line tailored to this target" },
    { "type": "Cold Call Opener", "text": "Natural, value-focused 2-sentence phone script opener" },
    { "type": "LinkedIn DM", "text": "Professional, personalized 2-3 sentence LinkedIn message" }
  ]
}
Do NOT include markdown formatting or extra text outside JSON.
`.trim();

      const userPrompt = `Target Prospect Input: "${urlInput}"\nProvide realistic, intelligence-backed enrichment data and icebreakers for this prospect.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
      });

      const rawContent = response.choices[0]?.message?.content || '{}';
      
      // Parse JSON safely
      let cleanedJson = rawContent.trim();
      if (cleanedJson.startsWith('```')) {
        cleanedJson = cleanedJson.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
      }

      const result = JSON.parse(cleanedJson);

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
