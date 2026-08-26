/**
 * Meta Graph API Enrichment Service
 *
 * Uses Meta's Instagram Business Discovery Graph API to resolve Instagram profiles
 * and get biographies and websites without hitting platform blocks.
 *
 * Graph API endpoints used:
 *   - Instagram Business Discovery: GET /v21.0/{ig_account_id}?fields=business_discovery.username({username}){username,name,biography,website,followers_count}
 */

import { FastifyInstance } from 'fastify';
import { decrypt } from '../settings/integrations.router';
import { scrapeWebsiteText } from './scraper';
import { findEmailsInText, findPhonesInText } from './instagram-scraper';

export interface MetaEnrichmentResult {
  businessName: string;
  phone: string;
  emails: string[];
  phones: string[];
  website: string;
  category: string;
  about: string;
  location: string;
  facebookPageUrl: string;
  instagramUsername: string;
}

const GRAPH_API_BASE = 'https://graph.facebook.com/v21.0';

/**
 * Resolves the Meta Access Token from the database.
 */
export async function getMetaAccessToken(app: FastifyInstance): Promise<string | null> {
  try {
    const tokenRecord = await app.prisma.integrationKey.findFirst({
      where: { service: 'META', keyName: 'META_ACCESS_TOKEN', isActive: true },
    });
    if (tokenRecord?.encryptedValue) {
      const decrypted = decrypt(tokenRecord.encryptedValue);
      if (decrypted && decrypted.length > 10 && decrypted !== '***ENCRYPTED***') {
        return decrypted.trim();
      }
    }
  } catch (e) {}

  const envToken = process.env.META_ACCESS_TOKEN;
  if (envToken) return envToken;

  return null;
}

/**
 * Resolves the Instagram Business Account ID from DB integration_keys.
 * If not stored, dynamically queries the linked page to get the Instagram Business Account ID.
 */
export async function getMetaIGAccountId(app: FastifyInstance, token: string): Promise<string | null> {
  try {
    // 1. Check if stored in database
    const idRecord = await app.prisma.integrationKey.findFirst({
      where: { service: 'META', keyName: 'META_IG_ACCOUNT_ID', isActive: true },
    });
    if (idRecord?.encryptedValue) {
      const decrypted = decrypt(idRecord.encryptedValue);
      if (decrypted && decrypted.length > 5 && decrypted !== '***ENCRYPTED***') {
        return decrypted.trim();
      }
    }
  } catch (e) {}

  try {
    // 2. Fetch linked page account IDs dynamically
    app.log.info('[Meta Graph API] Querying linked Facebook Pages to discover Instagram Business Account ID...');
    const pagesRes = await fetch(`${GRAPH_API_BASE}/me/accounts?access_token=${token}`);
    if (pagesRes.ok) {
      const pagesData = await pagesRes.json() as any;
      const pages = pagesData?.data || [];
      for (const page of pages) {
        const detailsRes = await fetch(`${GRAPH_API_BASE}/${page.id}?fields=instagram_business_account&access_token=${token}`);
        if (detailsRes.ok) {
          const detailsData = await detailsRes.json() as any;
          if (detailsData?.instagram_business_account?.id) {
            const igId = detailsData.instagram_business_account.id;
            app.log.info(`[Meta Graph API] Discovered Instagram Business Account ID: ${igId}`);
            return igId;
          }
        }
      }
    }
  } catch (err: any) {
    app.log.error(`[Meta Graph API] Failed to resolve IG Account ID dynamically: ${err.message}`);
  }

  return null;
}

/**
 * Perform Instagram Business Discovery lookup for a profile username.
 * Returns public fields, then scrapes the business's own website if available.
 */
export async function enrichInstagramViaMetaGraphApi(
  app: FastifyInstance,
  instagramHandle: string
): Promise<MetaEnrichmentResult | null> {
  const cleanHandle = instagramHandle.replace('@', '').replace('instagram.com/', '').split('/')[0].trim().toLowerCase();
  
  const token = await getMetaAccessToken(app);
  if (!token) {
    app.log.warn('[Meta Graph API] No META_ACCESS_TOKEN configured in database.');
    return null;
  }

  const igAccountId = await getMetaIGAccountId(app, token);
  if (!igAccountId) {
    app.log.warn('[Meta Graph API] Could not resolve a valid Instagram Business Account ID from the token.');
    return null;
  }

  try {
    app.log.info(`[Meta Graph API] Executing Instagram Business Discovery for username: "${cleanHandle}"`);
    const discoveryUrl = `${GRAPH_API_BASE}/${igAccountId}?fields=business_discovery.username(${cleanHandle}){username,name,biography,website,followers_count}&access_token=${token}`;

    const controller = new AbortController();
    setTimeout(() => controller.abort(), 12000);

    const res = await fetch(discoveryUrl, {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });

    if (!res.ok) {
      const errBody = await res.text();
      app.log.error(`[Meta Graph API] Business discovery query failed: ${res.status} — ${errBody}`);
      return null;
    }

    const data = await res.json() as any;
    const discovery = data?.business_discovery;

    if (!discovery) {
      app.log.warn(`[Meta Graph API] No business discovery payload returned for username: "${cleanHandle}"`);
      return null;
    }

    app.log.info(`[Meta Graph API] Discovery Success for @${discovery.username} — Name: "${discovery.name}", Website: "${discovery.website || 'NONE'}"`);

    const website = discovery.website || '';
    const biography = discovery.biography || '';

    // Extract any emails/phones from the biography directly
    let emails = findEmailsInText(biography);
    let phones = findPhonesInText(biography);

    // Deep scrape the resolved website link using Puppeteer
    if (website) {
      app.log.info(`[Meta Graph API] Deep scraping discovered website: "${website}"...`);
      try {
        const scraped = await scrapeWebsiteText(website);
        if (scraped) {
          emails = [...new Set([...emails, ...scraped.emails])];
          phones = [...new Set([...phones, ...scraped.phones])];
        }
      } catch (scrapeErr: any) {
        app.log.error(`[Meta Graph API] Scraper error on ${website}: ${scrapeErr.message}`);
      }
    }

    return {
      businessName: discovery.name || discovery.username,
      phone: phones[0] || '',
      emails,
      phones,
      website,
      category: 'Instagram Profile',
      about: biography,
      location: '',
      facebookPageUrl: '',
      instagramUsername: discovery.username,
    };

  } catch (err: any) {
    app.log.error(`[Meta Graph API] Business discovery session error: ${err.message}`);
    return null;
  }
}

/**
 * Fallback Facebook Pages Search for company names.
 */
export async function searchMetaBusinessPage(
  app: FastifyInstance,
  query: string
): Promise<MetaEnrichmentResult | null> {
  // Direct redirect to Instagram handle lookup if input looks like a handle
  if (query.startsWith('@') || query.includes('instagram.com')) {
    return enrichInstagramViaMetaGraphApi(app, query);
  }
  return null;
}
