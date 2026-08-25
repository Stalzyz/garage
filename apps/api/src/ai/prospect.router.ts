import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getOpenAiClient } from '../utils/openai';
import { scrapeWebsiteText } from '../utils/scraper';
import { enrichViaGoogleSearch } from '../utils/search-enrichment';

const ProspectSchema = z.object({
  urlInput: z.string().min(1, 'Please enter a website domain, company name, or Instagram handle.'),
});

export default async function aiProspectRouter(app: FastifyInstance) {
  app.post('/prospect', async (req, reply) => {
    const { urlInput } = ProspectSchema.parse(req.body);

    try {
      const openai = await getOpenAiClient(app);

      app.log.info(`[Prospect] Starting enrichment for: ${urlInput}`);

      // Step 1: Try direct website scraping first (works for regular websites)
      let scrapedData = await scrapeWebsiteText(urlInput);
      app.log.info(`[Prospect] Direct scrape: ${scrapedData ? `${scrapedData.emails.length} emails, ${scrapedData.phones.length} phones` : 'no data'}`);

      // Step 2: If direct scrape gave no contact info, use Google/DuckDuckGo search enrichment
      // This is the fallback that works even when Instagram/social sites block VPS IPs
      let googleEnrichment = null;
      const needsEnrichment = !scrapedData || (scrapedData.emails.length === 0 && scrapedData.phones.length === 0);
      
      if (needsEnrichment) {
        app.log.info(`[Prospect] No contacts found via direct scrape — running search enrichment...`);
        googleEnrichment = await enrichViaGoogleSearch(urlInput);
        app.log.info(`[Prospect] Search enrichment: ${googleEnrichment ? `${googleEnrichment.emails.length} emails, ${googleEnrichment.phones.length} phones, website: ${googleEnrichment.websiteUrl}` : 'no data'}`);

        // If search found a website that direct scrape missed, scrape the actual website
        if (googleEnrichment?.websiteUrl && !scrapedData) {
          const websiteScrape = await scrapeWebsiteText(googleEnrichment.websiteUrl);
          if (websiteScrape) {
            scrapedData = websiteScrape;
            // Merge in Google search-found contacts
            googleEnrichment.emails.forEach(e => { if (!scrapedData!.emails.includes(e)) scrapedData!.emails.push(e); });
            googleEnrichment.phones.forEach(p => { if (!scrapedData!.phones.includes(p)) scrapedData!.phones.push(p); });
          }
        }
      }

      // Merge all contact sources
      const allEmails = [...new Set([
        ...(scrapedData?.emails || []),
        ...(googleEnrichment?.emails || []),
      ])].slice(0, 5);

      const allPhones = [...new Set([
        ...(scrapedData?.phones || []),
        ...(googleEnrichment?.phones || []),
      ])].slice(0, 5);

      const systemPrompt = `
You are an expert B2B sales intelligence & prospect enrichment assistant.
You analyze prospect inputs and live scraped website content to return enriched business intelligence and 3 hyper-personalized sales outreach icebreakers.

CRITICAL RULES:
- For "email" and "phone" fields: ONLY use values from "Verified Scraped Emails" and "Verified Scraped Phones" if provided. Do NOT invent or guess contact details.
- If no email/phone was scraped, set those fields to empty string "".
- For all other fields (name, company, role, bio, icebreakers): Use the scraped context to generate accurate, tailored output.

Response MUST be valid JSON only with this exact structure:
{
  "name": "Person Name or Key Decision Maker / Founder",
  "company": "Company Name",
  "role": "Job Title / Executive Role",
  "industry": "Industry / Sector",
  "location": "City, Country or Region",
  "email": "ONLY from Verified Scraped Emails — empty string if none",
  "phone": "ONLY from Verified Scraped Phones — empty string if none",
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

      if (scrapedData || googleEnrichment) {
        userPrompt += `\n--- REAL-TIME ENRICHMENT DATA ---`;

        if (scrapedData) {
          userPrompt += `
Website URL: ${scrapedData.url}
Page Title: ${scrapedData.title}
Meta Description: ${scrapedData.description}
Key Headings: ${scrapedData.headings.join(' | ')}
Extracted Content:
${scrapedData.snippetText?.slice(0, 2000) || ''}`;
        }

        if (googleEnrichment) {
          userPrompt += `
Business Name from Search: ${googleEnrichment.businessName}
Website Found via Search: ${googleEnrichment.websiteUrl}
Search Description: ${googleEnrichment.description}`;
        }

        userPrompt += `
Verified Scraped Emails: ${allEmails.join(', ') || 'NONE — do NOT invent an email'}
Verified Scraped Phones: ${allPhones.join(', ') || 'NONE — do NOT invent a phone number'}
----------------------------------
Use the above live data to generate accurate, tailored intelligence and icebreakers.
For email and phone: use ONLY the verified values above. If "NONE", leave the field as empty string.`;
      } else {
        userPrompt += `\nNote: Live scraping returned no data. Generate accurate intelligence based on your knowledge base.
IMPORTANT: Set email and phone to "" (empty string) since no verified contact data was scraped.`;
      }

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.4,
      });

      const rawContent = response.choices[0]?.message?.content || '{}';

      let cleanedJson = rawContent.trim();
      if (cleanedJson.startsWith('```')) {
        cleanedJson = cleanedJson.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
      }

      const result = JSON.parse(cleanedJson);

      // Always override email/phone with verified scraped values
      // AI MUST NOT invent contact details
      result.scrapedLive = !!(scrapedData || googleEnrichment);
      result.emails = allEmails;
      result.phones = allPhones;
      result.socials = scrapedData?.socialLinks || {};

      // Set primary email/phone from verified list only
      result.email = allEmails[0] || '';
      result.phone = allPhones[0] || '';

      if (googleEnrichment?.websiteUrl) {
        result.website = googleEnrichment.websiteUrl;
      }

      app.log.info(`[Prospect] Final result — email: ${result.email || 'none'}, phone: ${result.phone || 'none'}`);

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
