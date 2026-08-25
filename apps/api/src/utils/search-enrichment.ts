/**
 * Google Search-Based Contact Enrichment
 *
 * When Instagram / social media blocks server-side scraping,
 * we query Google's search results page (which IS publicly accessible)
 * and extract:
 *   1. The website URL from Google's result
 *   2. Contact email and phone from Knowledge Panel / business listing
 *   3. Then deep-scrape that actual website for full contact details
 */

import * as cheerio from 'cheerio';
import { deepScrapeWebsite, findEmailsInText, findPhonesInText } from './instagram-scraper';

export interface GoogleEnrichmentResult {
  websiteUrl: string;
  emails: string[];
  phones: string[];
  description: string;
  businessName: string;
}

const FETCH_HEADERS: Record<string, string> = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate',
};

async function safeFetch(url: string, timeoutMs = 8000): Promise<string | null> {
  try {
    const controller = new AbortController();
    const tid = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { headers: FETCH_HEADERS, signal: controller.signal }).finally(() => clearTimeout(tid));
    if (!res.ok) return null;
    const text = await res.text();
    return text.length > 100 ? text : null;
  } catch {
    return null;
  }
}

/**
 * Search DuckDuckGo HTML version (no JS required, no bot detection, publicly accessible from VPS IPs)
 * Returns the top organic result URLs and visible text
 */
async function searchDuckDuckGo(query: string): Promise<{ urls: string[]; html: string } | null> {
  const searchUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
  const html = await safeFetch(searchUrl);
  if (!html) return null;

  const $ = cheerio.load(html);
  const urls: string[] = [];

  // DuckDuckGo HTML result links
  $('a.result__a').each((_, el) => {
    const href = $(el).attr('href');
    if (href && href.startsWith('http') && !href.includes('duckduckgo.com')) {
      if (!urls.includes(href)) urls.push(href);
    }
  });

  // Also extract URLs from redirect links (/l/?uddg=...)
  $('a[href*="uddg="]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const match = href.match(/uddg=([^&]+)/);
    if (match) {
      try {
        const decoded = decodeURIComponent(match[1]);
        if (decoded.startsWith('http') && !decoded.includes('duckduckgo.com') && !urls.includes(decoded)) {
          urls.push(decoded);
        }
      } catch {}
    }
  });

  return { urls: urls.slice(0, 5), html };
}

/**
 * Main enrichment function.
 * Given an Instagram handle or company name, finds their real website and contact details.
 */
export async function enrichViaGoogleSearch(input: string): Promise<GoogleEnrichmentResult | null> {
  // Clean handle
  let handle = input.trim();
  let searchQuery = '';
  let isInstagram = false;

  if (handle.includes('instagram.com')) {
    const match = handle.match(/instagram\.com\/([a-zA-Z0-9._]+)/i);
    handle = match ? match[1] : handle;
    isInstagram = true;
  }

  if (handle.startsWith('@')) handle = handle.slice(1);

  // Search for: Instagram handle + contact + email + phone
  if (isInstagram) {
    searchQuery = `"@${handle}" OR "instagram.com/${handle}" contact email phone website`;
  } else {
    searchQuery = `"${handle}" official website contact email phone`;
  }

  const searchResult = await searchDuckDuckGo(searchQuery);
  if (!searchResult) return null;

  const { urls, html: searchHtml } = searchResult;

  // Extract any emails/phones already visible in search result snippets
  const searchPageEmails = findEmailsInText(searchHtml);
  const searchPagePhones = findPhonesInText(searchHtml);

  // Filter out search engine result pages and social media URLs
  const SKIP_DOMAINS = ['duckduckgo.com', 'google.com', 'bing.com', 'facebook.com', 'twitter.com', 'youtube.com', 'instagram.com', 'linkedin.com'];
  const targetUrls = urls.filter(u => !SKIP_DOMAINS.some(d => u.includes(d)));

  let bestEmails: string[] = [...searchPageEmails];
  let bestPhones: string[] = [...searchPagePhones];
  let websiteUrl = '';
  let description = '';
  let businessName = handle;

  // Deep-scrape top result websites
  for (const url of targetUrls.slice(0, 3)) {
    try {
      const websiteData = await deepScrapeWebsite(url);
      if (websiteData) {
        websiteData.emails.forEach(e => { if (!bestEmails.includes(e)) bestEmails.push(e); });
        websiteData.phones.forEach(p => { if (!bestPhones.includes(p)) bestPhones.push(p); });
      }

      // Also grab title/description for context
      if (!websiteUrl) {
        const html = await safeFetch(url, 5000);
        if (html) {
          const $ = cheerio.load(html);
          websiteUrl = url;
          businessName = $('title').first().text().trim().split(/[|\-–]/)[0].trim() || handle;
          description =
            $('meta[name="description"]').attr('content')?.trim() ||
            $('meta[property="og:description"]').attr('content')?.trim() ||
            '';

          // Also mine directly from this page's HTML
          findEmailsInText(html).forEach(e => { if (!bestEmails.includes(e)) bestEmails.push(e); });
          findPhonesInText(html).forEach(p => { if (!bestPhones.includes(p)) bestPhones.push(p); });
        }
      }

      if (bestEmails.length > 0 && bestPhones.length > 0) break;
    } catch {}
  }

  return {
    websiteUrl,
    emails: bestEmails.slice(0, 5),
    phones: bestPhones.slice(0, 5),
    description,
    businessName,
  };
}
