/**
 * Instagram Profile Scraper - Smart Multi-Source Strategy
 *
 * Instagram blocks all server-side scrapers (even Puppeteer with snap Chromium).
 * This file implements a working alternative:
 *
 * 1. Use Instagram's public oEmbed endpoint to get profile data (official, no auth)
 * 2. Parse og:title / og:description from static HTML (partial info)  
 * 3. Detect external website URL from the bio link
 * 4. Scrape that external website deeply for real email/phone using Chrome Puppeteer
 */

import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

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
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}/gi;
  const matches = text.match(emailRegex) || [];
  const BLACKLIST = [
    'sentry.io', 'schema.org', 'w3.org', 'example.com', 'cdninstagram.com',
    'fbcdn.net', 'facebook.com', 'instagram.com', 'apple.com', 'google.com',
    'yourcompany.com', 'youremail.com', 'email.com', 'support@',
    'duckduckgo', 'bing.com', 'yahoo.com', 'googletagmanager.com',
    'noreply', 'no-reply', 'donotreply', 'postmaster', 'mailer-daemon',
    'notification', 'alerts@', 'bounce@', 'unsubscribe',
  ];
  return [...new Set(
    matches
      .map(m => {
        let email = m.trim().toLowerCase();
        // Clean trailing words from TLDs like .comvisit or .comabout
        const tldMatch = email.match(/\.([a-z]{2,6})([a-z]+)$/);
        if (tldMatch) {
          const tld = tldMatch[1];
          const trailing = tldMatch[2];
          const commonTlds = ['com', 'org', 'net', 'edu', 'gov', 'mil', 'co', 'io', 'biz', 'info', 'my', 'in', 'us', 'uk', 'ca', 'au'];
          if (commonTlds.includes(tld)) {
            email = email.slice(0, email.length - trailing.length);
          }
        }
        return email;
      })
      .filter(m =>
        m.length < 80 &&
        m.length > 5 &&
        !BLACKLIST.some(b => m.includes(b)) &&
        /^[^\s@]+@[^\s@]+\.[^\s@]{2,6}$/.test(m)
      )
  )].slice(0, 5);
}

export function findPhonesInText(text: string): string[] {
  const phones = new Set<string>();

  // WhatsApp links (wa.me/91XXXXXXXXXX) - most common for Indian/Malaysian businesses
  const waRegex = /wa\.me\/(\+?\d{10,14})/gi;
  let waMatch: RegExpExecArray | null;
  while ((waMatch = waRegex.exec(text)) !== null) {
    const digits = waMatch[1].replace(/\D/g, '');
    
    // Discard Unix timestamps (10-digit integers between 1.5B and 2B)
    const val = parseInt(digits, 10);
    if (val >= 1500000000 && val <= 2000000000) continue;

    if (digits.length === 12 && digits.startsWith('91')) {
      phones.add(`+91 ${digits.slice(2, 7)} ${digits.slice(7)}`);
    } else if (digits.length === 10 && '6789'.includes(digits[0])) {
      phones.add(`+91 ${digits.slice(0, 5)} ${digits.slice(5)}`);
    } else if (digits.length >= 10 && digits.length <= 13) {
      phones.add(`+${digits}`);
    }
  }

  // International numbers with + prefix
  const intlRegex = /\+(?:91|1|44|61|971|65|66|60)[\s\-.]?\d{3,5}[\s\-.]?\d{3,5}[\s\-.]?\d{3,5}/g;
  const intlMatches = text.match(intlRegex) || [];
  for (const m of intlMatches) {
    const digits = m.replace(/\D/g, '');
    const val = parseInt(digits, 10);
    if (val >= 1500000000 && val <= 2000000000) continue;

    if (digits.length >= 10 && digits.length <= 13) phones.add(m.trim());
  }

  // Indian/Malaysian Mobile 10-digit / 11-digit (starting 6-9 or 1)
  const mobileRegex = /(?<!\d)([6-9]\d{9}|1\d{9,10})(?!\d)/g;
  let mobileMatch: RegExpExecArray | null;
  while ((mobileMatch = mobileRegex.exec(text)) !== null) {
    const num = mobileMatch[1];
    
    const val = parseInt(num, 10);
    if (val >= 1500000000 && val <= 2000000000) continue;

    if (!num.startsWith('2024') && !num.startsWith('2025') && !num.startsWith('2026')) {
      if (num.startsWith('1')) {
        // Malaysian format: +60 1X-XXXX XXXX
        phones.add(`+60 ${num.slice(0, 2)} ${num.slice(2, 6)} ${num.slice(6)}`);
      } else {
        phones.add(`+91 ${num.slice(0, 5)} ${num.slice(5)}`);
      }
    }
  }

  return [...phones].slice(0, 5);
}

/**
 * Fetch Instagram profile via static HTML + oEmbed API.
 */
export async function scrapeInstagramWithPuppeteer(handle: string): Promise<InstagramProfileData | null> {
  const cleanHandle = handle.replace('@', '').trim();
  const profileUrl = `https://www.instagram.com/${cleanHandle}/`;

  let ogTitle = '';
  let ogDesc = '';
  let externalUrl = '';

  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 6000);

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

      const linktreeMatch = html.match(/https?:\/\/(?:linktr\.ee|linkinbio\.com|bio\.link|beacons\.ai)\/[a-zA-Z0-9._-]+/);
      if (linktreeMatch && !externalUrl) externalUrl = linktreeMatch[0];
    }
  } catch (e) {}

  try {
    const oembedUrl = `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(profileUrl)}&format=json`;
    const controller2 = new AbortController();
    setTimeout(() => controller2.abort(), 4000);
    const oRes = await fetch(oembedUrl, { signal: controller2.signal });
    if (oRes.ok) {
      const oData = await oRes.json() as any;
      if (!ogTitle && oData.title) ogTitle = oData.title;
      if (!ogDesc && oData.description) ogDesc = oData.description;
    }
  } catch (e) {}

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

  const metaEmails = findEmailsInText(`${ogTitle} ${ogDesc}`);
  const metaPhones = findPhonesInText(`${ogTitle} ${ogDesc}`);

  emails = [...new Set([...emails, ...metaEmails])].slice(0, 5);
  phones = [...new Set([...phones, ...metaPhones])].slice(0, 5);

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
 * Uses Chrome Puppeteer with a rendering wait time to bypass blocks and load dynamic sites (like Linktree & Google Sites).
 */
/**
 * Deep multi-page website scraper.
 * Uses a single Chrome Puppeteer browser instance sequentially to load pages and extract contacts.
 * Follows redirects on homepage to resolve the correct www/non-www origin before loading contact/about subpages.
 */
export async function deepScrapeWebsite(url: string, limitDepth = true): Promise<{ emails: string[]; phones: string[] } | null> {
  let baseUrl = url.trim();
  if (!baseUrl.startsWith('http')) baseUrl = `https://${baseUrl}`;

  const isLinktree = baseUrl.includes('linktr.ee') || baseUrl.includes('linkinbio.com') || baseUrl.includes('bio.link') || baseUrl.includes('beacons.ai');
  
  if (isLinktree && limitDepth) {
    try {
      const res = await fetchPage(baseUrl);
      if (res) {
        const $ = cheerio.load(res);
        const linkedUrls: string[] = [];
        $('a[href]').each((_, el) => {
          const href = $(el).attr('href')?.trim();
          if (href && href.startsWith('http') && !href.includes('linktr.ee') && !href.includes('instagram.com') && !href.includes('facebook.com')) {
            linkedUrls.push(href);
          }
        });

        // Parallel deep scrape of top 2 outbound links
        const scrapePromises = linkedUrls.slice(0, 2).map(linkedUrl => deepScrapeWebsite(linkedUrl, false));
        const results = await Promise.all(scrapePromises);

        const allEmails = new Set<string>(findEmailsInText(res));
        const allPhones = new Set<string>(findPhonesInText(res));

        for (const r of results) {
          if (r) {
            r.emails.forEach(e => allEmails.add(e));
            r.phones.forEach(p => allPhones.add(p));
          }
        }

        return {
          emails: [...allEmails].slice(0, 5),
          phones: [...allPhones].slice(0, 5)
        };
      }
    } catch (e) {}
    return null;
  }

  const allEmails = new Set<string>();
  const allPhones = new Set<string>();
  
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome-stable',
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
      ]
    });

    // 1. Load Homepage and resolve redirect origin (e.g. non-www to www)
    let resolvedOrigin = (() => { try { return new URL(baseUrl).origin; } catch { return baseUrl; } })();
    const pagesToCheck: string[] = [
      `${resolvedOrigin}/contact`,
      `${resolvedOrigin}/contact-us`,
      `${resolvedOrigin}/about`,
      `${resolvedOrigin}/about-us`,
    ];

    try {
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1280, height: 800 });
      
      const response = await page.goto(baseUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
      if (response && response.ok()) {
        await new Promise(r => setTimeout(r, 2000));
        
        const finalUrl = page.url();
        try {
          resolvedOrigin = new URL(finalUrl).origin;
          
          // Re-update default check paths if origin changed
          pagesToCheck[0] = `${resolvedOrigin}/contact`;
          pagesToCheck[1] = `${resolvedOrigin}/contact-us`;
          pagesToCheck[2] = `${resolvedOrigin}/about`;
          pagesToCheck[3] = `${resolvedOrigin}/about-us`;
        } catch {}
        
        const html = await page.content();
        if (html) {
          const $ = cheerio.load(html);
          extractContactsFromCheerio($, html, allEmails, allPhones);

          // Dynamically extract contact/about pages listed in the homepage anchor tags
          $('a[href]').each((_, el) => {
            try {
              const href = $(el).attr('href')?.trim();
              if (href) {
                const lowerHref = href.toLowerCase();
                const keywords = ['contact', 'about', 'support', 'help', 'info', 'reach'];
                if (keywords.some(kw => lowerHref.includes(kw))) {
                  const absoluteUrl = new URL(href, resolvedOrigin).href;
                  // Only queue pages on the same domain/origin
                  if (absoluteUrl.startsWith(resolvedOrigin)) {
                    pagesToCheck.push(absoluteUrl);
                  }
                }
              }
            } catch {}
          });
        }
      }
      await page.close();
    } catch (err) {
      console.warn(`[Scraper] Homepage fetch failed for ${baseUrl}:`, err.message);
    }

    // 2. Load Contact and About pages using resolved origin (and dynamic pages)
    const uniquePages = [...new Set(pagesToCheck)];

    for (const pageUrl of uniquePages) {
      try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
        
        const response = await page.goto(pageUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
        if (response && response.ok()) {
          await new Promise(r => setTimeout(r, 2000));
          const html = await page.content();
          if (html) {
            const $ = cheerio.load(html);
            extractContactsFromCheerio($, html, allEmails, allPhones);
          }
        }
        await page.close();
      } catch (err) {
        // Quietly fail subpages, some might not exist
      }
    }

  } catch (err) {
    console.error("[Scraper] Single browser scraping session failed:", err.message);
  } finally {
    if (browser) await browser.close();
  }

  const finalEmails = [...allEmails].slice(0, 5);
  const finalPhones = [...allPhones].slice(0, 5);

  if (finalEmails.length === 0 && finalPhones.length === 0) return null;

  return {
    emails: finalEmails,
    phones: finalPhones
  };
}

function extractContactsFromCheerio($: cheerio.CheerioAPI, html: string, allEmails: Set<string>, allPhones: Set<string>) {
  // 1. Mailto and Tel links
  $('a[href^="mailto:"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const email = href.replace(/^mailto:/i, '').split('?')[0].trim().toLowerCase();
    if (email && /^[^\s@]+@[^\s@]+\.[^\s@]{2,6}$/.test(email) && email.length < 80) {
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

  // 2. WhatsApp links
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const waMatch = href.match(/wa\.me\/(\+?\d{10,14})/i);
    if (waMatch) {
      allPhones.add(formatPhone(waMatch[1]));
    }
    const apiWaMatch = href.match(/api\.whatsapp\.com\/send\/?\?phone=([^&]+)/i);
    if (apiWaMatch) {
      const decoded = decodeURIComponent(apiWaMatch[1]);
      allPhones.add(formatPhone(decoded));
    }
  });

  // 3. Text regex extraction
  $('script, style, svg, iframe, noscript').remove();
  const text = $('body').text();
  findEmailsInText(text).forEach(e => allEmails.add(e));
  findPhonesInText(text).forEach(p => allPhones.add(p));
}

/**
 * Launches Chrome Puppeteer headless browser to render JavaScript and bypass blocks.
 * Falls back to native node-fetch if Puppeteer fails.
 */
export async function fetchPage(url: string): Promise<string | null> {
  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome-stable',
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
      ]
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1280, height: 800 });
    
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 12000 });
    // Wait for JS rendering to complete
    await new Promise(r => setTimeout(r, 2000));
    
    const html = await page.content();
    return html.length > 100 ? html : null;
  } catch (err) {
    // Fallback to static fetch if Chrome/Puppeteer has any issue
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        },
        signal: controller.signal,
      });
      if (res.ok) {
        const text = await res.text();
        return text.length > 50 ? text : null;
      }
    } catch {}
    return null;
  } finally {
    if (browser) await browser.close();
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
