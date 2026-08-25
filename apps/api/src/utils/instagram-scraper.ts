/**
 * Instagram Profile Scraper - Smart Multi-Source Strategy
 *
 * Instagram blocks all server-side scrapers (even Puppeteer with snap Chromium).
 * This file implements a working alternative:
 *
 * 1. Use Instagram's public oEmbed endpoint to get profile data (official, no auth)
 * 2. Parse og:title / og:description from static HTML (partial info)  
 * 3. Detect external website URL from the bio link
 * 4. Scrape that external website deeply for real email/phone
 */

import * as cheerio from 'cheerio';

export interface InstagramProfileData {
  handle: string;
  fullName: string;
  bio: string;
  externalUrl: string;
  followerCount: string;
  followingCount: string;
  postCount: string;
  email: string;
  phone: string;
  emails: string[];
  phones: string[];
}

export function findEmailsInText(text: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  const matches = text.match(emailRegex) || [];
  const BLACKLIST = [
    'sentry.io', 'schema.org', 'w3.org', 'example.com', 'cdninstagram.com',
    'fbcdn.net', 'facebook.com', 'instagram.com', 'apple.com', 'google.com',
    'yourcompany.com', 'youremail.com', 'email.com', 'support@',
    'duckduckgo.com', 'bing.com', 'yahoo.com', 'googletagmanager.com',
    'noreply', 'no-reply', 'donotreply', 'postmaster', 'mailer-daemon',
    'notification', 'alerts@', 'bounce@', 'unsubscribe',
  ];
  return [...new Set(
    matches
      .map(m => m.trim().toLowerCase())
      .filter(m =>
        m.length < 80 &&
        m.length > 5 &&
        !BLACKLIST.some(b => m.includes(b)) &&
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(m)
      )
  )].slice(0, 5);
}

export function findPhonesInText(text: string): string[] {
  const phones = new Set<string>();

  // WhatsApp links (wa.me/91XXXXXXXXXX) - most common for Indian businesses
  const waRegex = /wa\.me\/(\+?\d{10,14})/gi;
  let waMatch: RegExpExecArray | null;
  while ((waMatch = waRegex.exec(text)) !== null) {
    const digits = waMatch[1].replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) {
      phones.add(`+91 ${digits.slice(2, 7)} ${digits.slice(7)}`);
    } else if (digits.length === 10 && '6789'.includes(digits[0])) {
      phones.add(`+91 ${digits.slice(0, 5)} ${digits.slice(5)}`);
    }
  }

  // International numbers with + prefix
  const intlRegex = /\+(?:91|1|44|61|971|65|66|60)[\s\-.]?\d{3,5}[\s\-.]?\d{3,5}[\s\-.]?\d{3,5}/g;
  const intlMatches = text.match(intlRegex) || [];
  for (const m of intlMatches) {
    const digits = m.replace(/\D/g, '');
    if (digits.length >= 10 && digits.length <= 13) phones.add(m.trim());
  }

  // Indian Mobile 10-digit (standalone, starting 6-9)
  const mobileRegex = /(?<!\d)([6-9]\d{9})(?!\d)/g;
  let mobileMatch: RegExpExecArray | null;
  while ((mobileMatch = mobileRegex.exec(text)) !== null) {
    const num = mobileMatch[1];
    // Filter out year-like numbers
    if (!num.startsWith('2024') && !num.startsWith('2025') && !num.startsWith('2026')) {
      phones.add(`+91 ${num.slice(0, 5)} ${num.slice(5)}`);
    }
  }

  return [...phones].slice(0, 5);
}

/**
 * Fetch Instagram profile via static HTML + oEmbed API.
 * Returns bio, handle, follower count, and crucially the external website URL.
 */
export async function scrapeInstagramWithPuppeteer(handle: string): Promise<InstagramProfileData | null> {
  const cleanHandle = handle.replace('@', '').trim();
  const profileUrl = `https://www.instagram.com/${cleanHandle}/`;

  let ogTitle = '';
  let ogDesc = '';
  let externalUrl = '';

  // Step 1: Try static fetch for meta tags (Instagram still serves og: tags server-side)
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 8000);

    const res = await fetch(profileUrl, {
      headers: {
        'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
    });

    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);
      ogTitle = $('meta[property="og:title"]').attr('content')?.trim() || '';
      ogDesc = $('meta[property="og:description"]').attr('content')?.trim() || '';

      // Look for any non-instagram external link (often the website in bio)
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href')?.trim();
        if (
          href &&
          !href.includes('instagram.com') &&
          !href.includes('javascript') &&
          !href.startsWith('#') &&
          (href.startsWith('http') || href.startsWith('https'))
        ) {
          if (!externalUrl) externalUrl = href;
        }
      });

      // Also try linktr.ee, linkinbio style links in raw HTML
      const linktreeMatch = html.match(/https?:\/\/(?:linktr\.ee|linkinbio\.com|bio\.link|beacons\.ai)\/[a-zA-Z0-9._-]+/);
      if (linktreeMatch && !externalUrl) externalUrl = linktreeMatch[0];
    }
  } catch (e) {
    // Static fetch failed — Instagram may be blocking
  }

  // Step 2: Try Instagram oEmbed API (no auth, publicly accessible)
  try {
    const oembedUrl = `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(profileUrl)}&format=json`;
    const controller2 = new AbortController();
    setTimeout(() => controller2.abort(), 5000);
    const oRes = await fetch(oembedUrl, { signal: controller2.signal });
    if (oRes.ok) {
      const oData = await oRes.json() as any;
      if (!ogTitle && oData.title) ogTitle = oData.title;
      if (!ogDesc && oData.description) ogDesc = oData.description;
    }
  } catch (e) {}

  // Step 3: Scrape the external website from the bio for REAL email/phone
  let emails: string[] = [];
  let phones: string[] = [];

  if (externalUrl) {
    try {
      const webData = await deepScrapeWebsite(externalUrl);
      if (webData) {
        emails = webData.emails;
        phones = webData.phones;
      }
    } catch (e) {}
  }

  // Step 4: Also extract from meta description text (sometimes has phone/email for business accounts)
  const metaEmails = findEmailsInText(`${ogTitle} ${ogDesc}`);
  const metaPhones = findPhonesInText(`${ogTitle} ${ogDesc}`);

  emails = [...new Set([...emails, ...metaEmails])].slice(0, 5);
  phones = [...new Set([...phones, ...metaPhones])].slice(0, 5);

  // Parse follower/following/post counts from og:description
  const followerMatch = ogDesc.match(/([\d.,]+[KkMm]?)\s*Followers?/i);
  const followingMatch = ogDesc.match(/([\d.,]+[KkMm]?)\s*Following/i);
  const postMatch = ogDesc.match(/([\d.,]+[KkMm]?)\s*Posts?/i);

  return {
    handle: `@${cleanHandle}`,
    fullName: ogTitle.replace(/ \(@[^)]+\).*/, '').replace(/\s*[•·|].*/, '').trim(),
    bio: ogDesc,
    externalUrl,
    followerCount: followerMatch?.[1] || '',
    followingCount: followingMatch?.[1] || '',
    postCount: postMatch?.[1] || '',
    email: emails[0] || '',
    phone: phones[0] || '',
    emails,
    phones,
  };
}

/**
 * Deep multi-page website scraper.
 * Scrapes home page + contact + about + team pages for email and phone.
 */
export async function deepScrapeWebsite(url: string): Promise<{ emails: string[]; phones: string[] } | null> {
  let baseUrl = url.trim();
  if (!baseUrl.startsWith('http')) baseUrl = `https://${baseUrl}`;

  // Linktr.ee — special handling: fetch and find linked URLs
  if (baseUrl.includes('linktr.ee') || baseUrl.includes('linkinbio.com')) {
    try {
      const res = await fetchPage(baseUrl);
      if (res) {
        const $ = cheerio.load(res);
        // Extract all outbound links from linktree
        const linkedUrls: string[] = [];
        $('a[href]').each((_, el) => {
          const href = $(el).attr('href')?.trim();
          if (href && href.startsWith('http') && !href.includes('linktr.ee')) {
            linkedUrls.push(href);
          }
        });
        // Try scraping the first actual business website linked from linktree
        for (const linkedUrl of linkedUrls.slice(0, 3)) {
          const scraped = await deepScrapeWebsite(linkedUrl);
          if (scraped && (scraped.emails.length > 0 || scraped.phones.length > 0)) {
            return scraped;
          }
        }
        // Extract directly from linktree page
        const emails = findEmailsInText(res);
        const phones = findPhonesInText(res);
        if (emails.length > 0 || phones.length > 0) return { emails, phones };
      }
    } catch (e) {}
    return null;
  }

  const allEmails = new Set<string>();
  const allPhones = new Set<string>();
  const origin = (() => { try { return new URL(baseUrl).origin; } catch { return baseUrl; } })();

  // Pages to check in order
  const pagesToCheck = [
    baseUrl,
    `${origin}/contact`,
    `${origin}/contact-us`,
    `${origin}/about`,
    `${origin}/about-us`,
    `${origin}/reach-us`,
    `${origin}/get-in-touch`,
  ];

  for (const pageUrl of pagesToCheck) {
    try {
      const html = await fetchPage(pageUrl);
      if (!html) continue;

      const $ = cheerio.load(html);

      // Extract from tel: and mailto: links (most reliable)
      $('a[href^="mailto:"]').each((_, el) => {
        const href = $(el).attr('href') || '';
        const email = href.replace(/^mailto:/i, '').split('?')[0].trim().toLowerCase();
        if (email && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length < 80) {
          allEmails.add(email);
        }
      });

      $('a[href^="tel:"]').each((_, el) => {
        const href = $(el).attr('href') || '';
        const digits = href.replace(/^tel:/i, '').replace(/[^\d+]/g, '');
        if (digits.length >= 10) {
          allPhones.add(formatPhone(digits));
        }
      });

      // Extract from WhatsApp links
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href') || '';
        const waMatch = href.match(/wa\.me\/(\+?\d{10,14})/i);
        if (waMatch) allPhones.add(formatPhone(waMatch[1]));
      });

      // Get cleaned visible text
      $('script, style, svg, iframe, noscript, [aria-hidden="true"]').remove();
      const visibleText = $('body').text().replace(/\s+/g, ' ').trim();

      // Find emails and phones in visible text
      findEmailsInText(visibleText).forEach(e => allEmails.add(e));
      findPhonesInText(visibleText).forEach(p => allPhones.add(p));

      // Stop early if we found both email and phone
      if (allEmails.size > 0 && allPhones.size > 0) break;

    } catch (e) {
      // Skip failed pages silently
    }
  }

  const emails = [...allEmails].slice(0, 5);
  const phones = [...allPhones].slice(0, 5);

  if (emails.length === 0 && phones.length === 0) return null;
  return { emails, phones };
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 7000);

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
    });

    if (!res.ok) return null;
    const html = await res.text();
    return html.length > 100 ? html : null;
  } catch {
    return null;
  }
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 10 && '6789'.includes(digits[0])) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return raw;
}
