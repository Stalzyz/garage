import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getOpenAiClient } from '../utils/openai';
import { scrapeWebsiteText } from '../utils/scraper';
import { enrichViaGoogleSearch } from '../utils/search-enrichment';
import { enrichInstagramViaMetaGraphApi, searchMetaBusinessPage } from '../utils/meta-enrichment';

const ProspectSchema = z.object({
  urlInput: z.string().min(1, 'Please enter a website domain, company name, or Instagram handle.'),
});

export default async function aiProspectRouter(app: FastifyInstance) {
  app.post('/prospect', async (req, reply) => {
    const { urlInput } = ProspectSchema.parse(req.body);

    try {
      const openai = await getOpenAiClient(app);

      const input = urlInput.trim();
      const isInstagram = input.toLowerCase().includes('instagram.com') || input.startsWith('@');
      const isWebsite = input.includes('.') && !isInstagram;

      app.log.info(`[Prospect] Starting enrichment for: "${input}" (instagram=${isInstagram}, website=${isWebsite})`);

      let scrapedData: Awaited<ReturnType<typeof scrapeWebsiteText>> = null;
      let metaData: Awaited<ReturnType<typeof enrichInstagramViaMetaGraphApi>> = null;
      let googleData: Awaited<ReturnType<typeof enrichViaGoogleSearch>> = null;

      // ── STEP 1: Direct website scrape (best for real websites) ──
      if (isWebsite) {
        scrapedData = await scrapeWebsiteText(input);
        app.log.info(`[Prospect] Website scrape: ${scrapedData ? `✓ ${scrapedData.emails.length} emails, ${scrapedData.phones.length} phones` : '✗ no data'}`);
      }

      // ── STEP 2: Meta Graph API (Facebook Pages Search) ──
      // Primary source for Instagram handles and company names — returns real phone/email
      if (isInstagram) {
        const handle = input.replace(/.*instagram\.com\//i, '').replace('@', '').split('/')[0].trim();
        metaData = await enrichInstagramViaMetaGraphApi(app, handle);
        app.log.info(`[Prospect] Meta Graph API (Instagram): ${metaData ? `✓ phone=${metaData.phone}, emails=${metaData.emails.join(',')}` : '✗ no data (token not set?)'}`);
      } else if (!isWebsite) {
        // Company name input — search Meta Pages
        metaData = await searchMetaBusinessPage(app, input);
        app.log.info(`[Prospect] Meta Graph API (company name): ${metaData ? `✓ phone=${metaData.phone}` : '✗ no data'}`);
      }

      // ── STEP 3: Website scrape of Meta-found website ──
      if (metaData?.website && !scrapedData) {
        scrapedData = await scrapeWebsiteText(metaData.website);
        app.log.info(`[Prospect] Scraping Meta-found website ${metaData.website}: ${scrapedData ? `✓ ${scrapedData.emails.length} emails` : '✗'}`);
      }

      // ── STEP 4: DuckDuckGo search fallback (when Meta token not set / no result, ONLY for non-Instagram queries) ──
      const hasContacts = (metaData && (metaData.phone || metaData.emails.length > 0)) ||
        (scrapedData && (scrapedData.emails.length > 0 || scrapedData.phones.length > 0));

      if (!hasContacts && !isInstagram) {
        app.log.info(`[Prospect] No contacts yet — falling back to DuckDuckGo search enrichment...`);
        googleData = await enrichViaGoogleSearch(input);
        app.log.info(`[Prospect] DuckDuckGo: ${googleData ? `✓ ${googleData.emails.length} emails, ${googleData.phones.length} phones` : '✗'}`);

        // Scrape the website found via DuckDuckGo
        if (googleData?.websiteUrl && !scrapedData) {
          scrapedData = await scrapeWebsiteText(googleData.websiteUrl);
        }
      }

      // ── Merge all contact sources (Meta > scraped > google) ──
      const allEmails = [...new Set([
        ...(metaData?.emails || []),
        ...(scrapedData?.emails || []),
        ...(googleData?.emails || []),
      ])].slice(0, 5);

      const allPhones = [...new Set([
        ...(metaData?.phones || []),
        ...(scrapedData?.phones || []),
        ...(googleData?.phones || []),
      ])].slice(0, 5);

      const websiteUrl = metaData?.website || scrapedData?.url || googleData?.websiteUrl || '';

      // ── Build AI prompt ──
      const systemPrompt = `
You are an expert B2B sales intelligence & prospect enrichment assistant.
You analyze prospect inputs and enriched data to return business intelligence and 3 hyper-personalized sales outreach icebreakers.

CRITICAL RULES:
- For "email" and "phone" fields: ONLY use the exact values from "Verified Contact Data". Do NOT invent or guess.
- If Verified Contact Data shows "NONE", set those fields to "".
- All other fields (name, company, role, bio, icebreakers) should be accurate and tailored based on the data provided.

Response MUST be valid JSON only:
{
  "name": "Key decision maker or founder name",
  "company": "Exact company/brand name",
  "role": "Job title or role",
  "industry": "Industry or category",
  "location": "City, Country",
  "email": "ONLY from Verified Contact Data — else empty string",
  "phone": "ONLY from Verified Contact Data — else empty string",
  "bio": "Concise 2-sentence description of what they do",
  "scrapedLive": true,
  "icebreakers": [
    { "type": "Email Subject", "text": "..." },
    { "type": "Cold Call Opener", "text": "..." },
    { "type": "LinkedIn DM", "text": "..." }
  ]
}
Do NOT wrap in markdown. Return raw JSON only.
`.trim();

      let userPrompt = `Prospect Input: "${input}"\n\n`;

      userPrompt += `=== VERIFIED CONTACT DATA (USE THESE ONLY) ===\n`;
      userPrompt += `Emails: ${allEmails.length > 0 ? allEmails.join(', ') : 'NONE'}\n`;
      userPrompt += `Phones: ${allPhones.length > 0 ? allPhones.join(', ') : 'NONE'}\n`;
      userPrompt += `Website: ${websiteUrl || 'NONE'}\n\n`;

      if (metaData) {
        userPrompt += `=== META GRAPH API DATA ===\n`;
        userPrompt += `Business Name: ${metaData.businessName}\n`;
        userPrompt += `Category: ${metaData.category}\n`;
        userPrompt += `About: ${metaData.about}\n`;
        userPrompt += `Location: ${metaData.location}\n`;
        userPrompt += `Facebook Page: ${metaData.facebookPageUrl}\n`;
        if (metaData.instagramUsername) userPrompt += `Instagram: @${metaData.instagramUsername}\n`;
        userPrompt += '\n';
      }

      if (scrapedData) {
        userPrompt += `=== LIVE WEBSITE DATA ===\n`;
        userPrompt += `URL: ${scrapedData.url}\n`;
        userPrompt += `Title: ${scrapedData.title}\n`;
        userPrompt += `Description: ${scrapedData.description}\n`;
        userPrompt += `Headings: ${scrapedData.headings.slice(0, 6).join(' | ')}\n`;
        userPrompt += `Content:\n${scrapedData.snippetText?.slice(0, 1500) || ''}\n\n`;
      }

      if (googleData) {
        userPrompt += `=== SEARCH ENGINE DATA ===\n`;
        userPrompt += `Business Name: ${googleData.businessName}\n`;
        userPrompt += `Description: ${googleData.description}\n\n`;
      }

      userPrompt += `Generate accurate, tailored prospect intelligence. For email/phone: use ONLY the Verified Contact Data values above.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.35,
      });

      const rawContent = response.choices[0]?.message?.content || '{}';
      let cleanedJson = rawContent.trim().replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');

      // Safe JSON parsing — AI sometimes returns prose or malformed JSON
      let result: any = {};
      try {
        result = JSON.parse(cleanedJson);
      } catch (parseErr) {
        // Try to extract JSON object from within the response (handle extra text)
        const jsonMatch = cleanedJson.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            result = JSON.parse(jsonMatch[0]);
          } catch {
            // AI returned completely non-JSON — build minimal result from what we know
            app.log.warn(`[Prospect] AI returned non-JSON, building minimal result`);
            result = {
              name: googleData?.businessName || metaData?.businessName || input,
              company: googleData?.businessName || metaData?.businessName || input,
              role: '',
              industry: metaData?.category || '',
              location: metaData?.location || '',
              bio: metaData?.about || scrapedData?.description || googleData?.description || '',
              icebreakers: [],
            };
          }
        } else {
          result = {
            name: googleData?.businessName || metaData?.businessName || input,
            company: googleData?.businessName || metaData?.businessName || input,
            role: '',
            industry: metaData?.category || '',
            location: metaData?.location || '',
            bio: metaData?.about || scrapedData?.description || '',
            icebreakers: [],
          };
        }
      }

      // Enforce: email/phone MUST come from verified scraped data only (never AI-invented)
      result.scrapedLive = !!(scrapedData || metaData || googleData);
      result.emails = allEmails;
      result.phones = allPhones;
      result.email = allEmails[0] || '';
      result.phone = allPhones[0] || '';
      result.socials = {
        ...(scrapedData?.socialLinks || {}),
        ...(metaData?.facebookPageUrl ? { facebook: metaData.facebookPageUrl } : {}),
        ...(metaData?.instagramUsername ? { instagram: `https://instagram.com/${metaData.instagramUsername}` } : {}),
      };
      if (websiteUrl) result.website = websiteUrl;
      if (metaData?.location && !result.location) result.location = metaData.location;

      app.log.info(`[Prospect] ✓ Done — email: ${result.email || 'none'}, phone: ${result.phone || 'none'}, scrapedLive: ${result.scrapedLive}`);

      return reply.send({ success: true, prospect: result });
    } catch (error: any) {
      app.log.error({ err: error }, 'AI Prospecting Enrichment Error');
      return reply.code(500).send({
        success: false,
        error: error.message || 'Failed to generate prospect enrichment.',
      });
    }
  });
}
