/**
 * Meta Graph API Enrichment Service
 *
 * Uses Meta's Facebook Graph API to search for business pages and retrieve:
 *   - Business phone number
 *   - Business email
 *   - Website URL
 *   - Business description/category
 *   - Location
 *
 * Requires: META_APP_ID + META_APP_SECRET (App Access Token) OR META_ACCESS_TOKEN
 * These are stored in the IntegrationKey table under service = 'META'.
 *
 * Graph API endpoints used:
 *   - Pages Search: GET /v20.0/pages/search?q={query}&fields=name,phone,emails,website,category,about,location
 *   - Instagram Business: GET /v20.0/ig_hashtag_search (limited without user auth)
 */

import { FastifyInstance } from 'fastify';
import { decrypt } from '../settings/integrations.router';

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

const GRAPH_API_BASE = 'https://graph.facebook.com/v20.0';

/**
 * Resolves the Meta App Access Token from the IntegrationKey table.
 * Priority:
 * 1. META_ACCESS_TOKEN (a pre-generated long-lived token)
 * 2. META_APP_ID + META_APP_SECRET → App Access Token (generated on the fly)
 */
export async function getMetaAccessToken(app: FastifyInstance): Promise<string | null> {
  try {
    // Try META_ACCESS_TOKEN first (long-lived Page or System User token)
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

  try {
    // Fallback: Generate App Access Token from APP_ID + APP_SECRET
    const appIdRecord = await app.prisma.integrationKey.findFirst({
      where: { service: 'META', keyName: 'META_APP_ID', isActive: true },
    });
    const appSecretRecord = await app.prisma.integrationKey.findFirst({
      where: { service: 'META', keyName: 'META_APP_SECRET', isActive: true },
    });

    if (appIdRecord?.encryptedValue && appSecretRecord?.encryptedValue) {
      const appId = decrypt(appIdRecord.encryptedValue)?.trim();
      const appSecret = decrypt(appSecretRecord.encryptedValue)?.trim();

      if (appId && appSecret && appId !== '***ENCRYPTED***' && appSecret !== '***ENCRYPTED***') {
        // App Access Token format: {app_id}|{app_secret}
        return `${appId}|${appSecret}`;
      }
    }
  } catch (e) {}

  // Fallback: Environment variables
  const envAppId = process.env.META_APP_ID;
  const envAppSecret = process.env.META_APP_SECRET;
  if (envAppId && envAppSecret) return `${envAppId}|${envAppSecret}`;

  const envToken = process.env.META_ACCESS_TOKEN;
  if (envToken) return envToken;

  return null;
}

/**
 * Search Facebook Pages Graph API for a business and return contact details.
 *
 * This works for ANY business that has a Facebook Page (most Indian SMBs do).
 * Returns real phone, email, website, location.
 */
export async function searchMetaBusinessPage(
  app: FastifyInstance,
  query: string
): Promise<MetaEnrichmentResult | null> {
  const accessToken = await getMetaAccessToken(app);
  if (!accessToken) {
    app.log.warn('[Meta Graph API] No access token configured. Add META_APP_ID + META_APP_SECRET in Settings > Integrations.');
    return null;
  }

  try {
    const fields = 'id,name,phone,emails,website,about,category,location,username,instagram_business_account';
    const searchUrl = `${GRAPH_API_BASE}/pages/search?q=${encodeURIComponent(query)}&fields=${fields}&limit=5&access_token=${accessToken}`;

    const controller = new AbortController();
    setTimeout(() => controller.abort(), 10000);

    const res = await fetch(searchUrl, {
      headers: { 'Accept': 'application/json' },
      signal: controller.signal,
    });

    if (!res.ok) {
      const errBody = await res.text();
      app.log.error(`[Meta Graph API] Pages search failed: ${res.status} — ${errBody}`);
      return null;
    }

    const data = await res.json() as any;
    const pages: any[] = data?.data || [];

    if (pages.length === 0) {
      app.log.info(`[Meta Graph API] No pages found for query: "${query}"`);
      return null;
    }

    // Take the best matching page (first result)
    const page = pages[0];

    app.log.info(`[Meta Graph API] Found page: "${page.name}" — phone: ${page.phone || 'N/A'}, emails: ${JSON.stringify(page.emails || [])}`);

    const emails: string[] = Array.isArray(page.emails) ? page.emails : (page.emails ? [page.emails] : []);
    const phones: string[] = page.phone ? [page.phone] : [];

    const location = page.location
      ? [page.location.city, page.location.state, page.location.country].filter(Boolean).join(', ')
      : '';

    // Try to get Instagram username linked to the Facebook page
    let instagramUsername = '';
    if (page.instagram_business_account?.id) {
      try {
        const igRes = await fetch(
          `${GRAPH_API_BASE}/${page.instagram_business_account.id}?fields=username,biography,website&access_token=${accessToken}`
        );
        if (igRes.ok) {
          const igData = await igRes.json() as any;
          instagramUsername = igData?.username || '';
        }
      } catch {}
    }

    return {
      businessName: page.name || query,
      phone: phones[0] || '',
      emails,
      phones,
      website: page.website || '',
      category: page.category || '',
      about: page.about || '',
      location,
      facebookPageUrl: page.id ? `https://www.facebook.com/${page.username || page.id}` : '',
      instagramUsername,
    };
  } catch (err: any) {
    app.log.error(`[Meta Graph API] Error: ${err.message}`);
    return null;
  }
}

/**
 * Given an Instagram handle, look up the connected Facebook Page via Graph API.
 * Uses: GET /v20.0/ig_user_id_from_username (requires Instagram Business API permissions)
 * Falls back to searching the handle as a page name.
 */
export async function enrichInstagramViaMetaGraphApi(
  app: FastifyInstance,
  instagramHandle: string
): Promise<MetaEnrichmentResult | null> {
  const cleanHandle = instagramHandle.replace('@', '').trim();

  // Strategy 1: Search by Instagram handle as Facebook Page username
  const result = await searchMetaBusinessPage(app, cleanHandle);
  if (result && (result.phone || result.emails.length > 0)) {
    return result;
  }

  // Strategy 2: Search by handle with spaces (handles like "artistry.hut" → "artistry hut")
  const humanized = cleanHandle.replace(/[._-]/g, ' ');
  if (humanized !== cleanHandle) {
    const result2 = await searchMetaBusinessPage(app, humanized);
    if (result2 && (result2.phone || result2.emails.length > 0)) {
      return result2;
    }
    return result2 || result;
  }

  return result;
}
