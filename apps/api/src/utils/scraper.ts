import * as cheerio from 'cheerio';
import { scrapeInstagramWithPuppeteer, deepScrapeWebsite, findEmailsInText, findPhonesInText } from './instagram-scraper';

export interface ScrapedSiteData {
  url: string;
  title: string;
  description: string;
  headings: string[];
  snippetText: string;
  emails: string[];
  phones: string[];
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
}

/**
 * Extracts emails using mailto: links and regex patterns across clean visible text & HTML
 */
function extractEmails(html: string, $: cheerio.CheerioAPI): string[] {
  const emails = new Set<string>();

  // 1. Extract from mailto: hrefs
  $('a[href^="mailto:"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) {
      const email = href.replace(/^mailto:/i, '').split('?')[0].trim().toLowerCase();
      if (isValidEmail(email)) emails.add(email);
    }
  });

  // 2. Extract via regex across HTML
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  const matches = html.match(emailRegex) || [];
  for (const match of matches) {
    const clean = match.trim().toLowerCase();
    if (
      isValidEmail(clean) &&
      !clean.endsWith('.png') &&
      !clean.endsWith('.jpg') &&
      !clean.endsWith('.jpeg') &&
      !clean.endsWith('.svg') &&
      !clean.endsWith('.webp') &&
      !clean.endsWith('.gif') &&
      !clean.includes('example.com') &&
      !clean.includes('domain.com') &&
      !clean.includes('sentry.io') &&
      !clean.includes('w3.org') &&
      !clean.includes('schema.org')
    ) {
      emails.add(clean);
    }
  }

  return Array.from(emails).slice(0, 5);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length < 80;
}

/**
 * Robust, strict phone number extractor.
 * Supports tel: links, wa.me WhatsApp links, meta descriptions, and visible text.
 */
function extractPhones($: cheerio.CheerioAPI, extraText: string = ''): string[] {
  const phones = new Set<string>();

  // 1. Extract from explicit tel: href links
  $('a[href^="tel:"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) {
      const cleanPhone = href.replace(/^tel:/i, '').replace(/[^\d+]/g, '').trim();
      if (cleanPhone.length >= 8 && cleanPhone.length <= 15) {
        phones.add(formatPhoneNumber(cleanPhone));
      }
    }
  });

  // 2. Extract from WhatsApp links (wa.me/91... or api.whatsapp.com/send?phone=...)
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')?.trim();
    if (href) {
      const waMatch = href.match(/(?:wa\.me\/|api\.whatsapp\.com\/send\?phone=)(\+?\d{10,14})/i);
      if (waMatch && waMatch[1]) {
        phones.add(formatPhoneNumber(waMatch[1]));
      }
    }
  });

  // 3. Extract from visible text nodes & extra meta text
  const $clean = cheerio.load($.html());
  $clean('script, style, svg, path, code, pre, noscript, iframe, head, [type="application/ld+json"]').remove();
  const visibleText = `${$clean('body').text()} ${extraText}`.replace(/\s+/g, ' ');

  // Also check wa.me / whatsapp links inside extraText string
  const textWaMatch = visibleText.match(/(?:wa\.me\/|whatsapp\.com\/send\?phone=)(\+?\d{10,14})/gi) || [];
  for (const tw of textWaMatch) {
    const digits = tw.replace(/\D/g, '');
    if (digits.length >= 10 && digits.length <= 13) {
      phones.add(formatPhoneNumber(digits));
    }
  }

  // Pattern A: International formatted numbers with leading +
  const intlRegex = /\+(?:91|1|44|61|86|971|49|33|81)[-.\s]?\d{2,5}[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
  const intlMatches = visibleText.match(intlRegex) || [];
  for (const m of intlMatches) {
    const digits = m.replace(/\D/g, '');
    if (digits.length >= 10 && digits.length <= 13) {
      phones.add(m.trim());
    }
  }

  // Pattern B: Indian Mobile 10-digit numbers (starting with 6, 7, 8, 9)
  const indianMobileRegex = /(?:^|[^\d+])([6-9]\d{9})(?:[^\d]|$)/g;
  let match: RegExpExecArray | null;
  while ((match = indianMobileRegex.exec(visibleText)) !== null) {
    const rawNum = match[1];
    if (rawNum && !rawNum.startsWith('202') && !rawNum.startsWith('199')) {
      phones.add(`+91 ${rawNum.slice(0, 5)} ${rawNum.slice(5)}`);
    }
  }

  // Pattern C: Indian Toll-Free numbers (e.g. 1800 123 4567)
  const tollFreeRegex = /1800[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
  const tfMatches = visibleText.match(tollFreeRegex) || [];
  for (const tf of tfMatches) {
    phones.add(tf.trim());
  }

  // Pattern D: Landline with STD Code
  const stdLandlineRegex = /(?:^|[^\d])(0\d{2,4}[-.\s]?\d{6,8})(?:[^\d]|$)/g;
  let stdMatch: RegExpExecArray | null;
  while ((stdMatch = stdLandlineRegex.exec(visibleText)) !== null) {
    const rawLandline = stdMatch[1];
    const digits = rawLandline.replace(/\D/g, '');
    if (digits.length >= 10 && digits.length <= 11) {
      phones.add(rawLandline.trim());
    }
  }

  return Array.from(phones).slice(0, 5);
}

function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10 && ['6', '7', '8', '9'].includes(digits[0])) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

/**
 * Extracts social media links
 */
function extractSocials($: cheerio.CheerioAPI): ScrapedSiteData['socialLinks'] {
  const socials: ScrapedSiteData['socialLinks'] = {};

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href')?.trim();
    if (!href) return;

    if (!socials.linkedin && href.includes('linkedin.com/')) {
      socials.linkedin = href;
    } else if (!socials.twitter && (href.includes('twitter.com/') || href.includes('x.com/'))) {
      socials.twitter = href;
    } else if (!socials.facebook && href.includes('facebook.com/')) {
      socials.facebook = href;
    } else if (!socials.instagram && href.includes('instagram.com/')) {
      socials.instagram = href;
    }
  });

  return socials;
}

/**
 * Instagram Profile Scraper using Puppeteer headless browser.
 * Falls back to Cheerio static parse if Puppeteer is unavailable.
 */
export async function scrapeInstagramProfile(urlInput: string): Promise<ScrapedSiteData | null> {
  let cleanUrl = urlInput.trim();
  if (!cleanUrl.startsWith('http')) cleanUrl = `https://${cleanUrl}`;

  const matchHandle = cleanUrl.match(/instagram\.com\/([a-zA-Z0-9._]+)/i);
  const handle = matchHandle ? matchHandle[1] : '';

  // 1. Try Puppeteer (renders full JS page, extracts real contact info)
  try {
    const igData = await scrapeInstagramWithPuppeteer(handle);
    if (igData) {
      const snippetText = [
        `Instagram Profile: @${handle}`,
        `Full Name: ${igData.fullName}`,
        `Bio: ${igData.bio}`,
        igData.externalUrl ? `Website in Bio: ${igData.externalUrl}` : '',
        igData.followerCount ? `Followers: ${igData.followerCount}` : '',
      ].filter(Boolean).join('\n');

      return {
        url: cleanUrl,
        title: igData.fullName || `Instagram Profile @${handle}`,
        description: igData.bio,
        headings: [`@${handle}`, igData.fullName].filter(Boolean),
        snippetText,
        emails: igData.emails,
        phones: igData.phones,
        socialLinks: { instagram: cleanUrl },
      };
    }
  } catch (puppeteerErr: any) {
    console.warn(`[Instagram] Puppeteer failed (${puppeteerErr.message}), falling back to static parse`);
  }

  // 2. Fallback: Cheerio static HTML parse (limited — no JS data)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) return null;

    const html = await response.text();
    const $ = cheerio.load(html);

    const ogTitle = $('meta[property="og:title"]').attr('content')?.trim() || $('title').text().trim() || '';
    const ogDesc = $('meta[property="og:description"]').attr('content')?.trim() || '';

    let jsonLdBio = '';
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        const json = JSON.parse($(el).html() || '{}');
        if (json.description) jsonLdBio += ` ${json.description}`;
      } catch (e) {}
    });

    const allText = `${ogTitle} ${ogDesc} ${jsonLdBio} ${html}`;
    const emails = extractEmails(allText, $);
    const phones = extractPhones($, `${ogTitle} ${ogDesc} ${jsonLdBio}`);

    const snippetText = `Instagram Profile: @${handle}\nTitle/Name: ${ogTitle}\nMeta Profile Details: ${ogDesc}${jsonLdBio ? `\nBio: ${jsonLdBio}` : ''}`;

    return {
      url: cleanUrl,
      title: ogTitle || `Instagram @${handle}`,
      description: ogDesc,
      headings: [`@${handle}`, ogTitle].filter(Boolean),
      snippetText,
      emails,
      phones,
      socialLinks: { instagram: cleanUrl },
    };
  } catch (err) {
    return null;
  }
}

/**
 * Native, zero-cost live web scraper.
 * Multi-page: scrapes home + contact + about pages for email and phone.
 */
export async function scrapeWebsiteText(urlInput: string): Promise<ScrapedSiteData | null> {
  try {
    let cleanUrl = urlInput.trim();
    if (!cleanUrl) return null;

    // Route Instagram URLs to Instagram scraper
    if (cleanUrl.toLowerCase().includes('instagram.com')) {
      return scrapeInstagramProfile(cleanUrl);
    }

    if (!cleanUrl.includes('.') && !cleanUrl.startsWith('http')) {
      return null;
    }

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const fetchOptions: RequestInit = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
    };

    const response = await fetch(cleanUrl, fetchOptions).finally(() => clearTimeout(timeoutId));
    if (!response.ok) return null;

    const html = await response.text();
    if (!html || html.length < 50) return null;

    const $ = cheerio.load(html);

    const title =
      $('title').first().text().trim() ||
      $('meta[property="og:title"]').attr('content')?.trim() ||
      $('meta[name="twitter:title"]').attr('content')?.trim() ||
      '';

    const description =
      $('meta[name="description"]').attr('content')?.trim() ||
      $('meta[property="og:description"]').attr('content')?.trim() ||
      $('meta[name="twitter:description"]').attr('content')?.trim() ||
      '';

    const socialLinks = extractSocials($);

    // Deep multi-page scrape for emails and phones (home + contact + about + more)
    const deepResult = await deepScrapeWebsite(cleanUrl);
    const emails = deepResult?.emails || findEmailsInText(html);
    const phones = deepResult?.phones || findPhonesInText(`${title} ${description} ${html}`);

    // Clean noise elements for AI snippet text
    $('script, style, svg, iframe, noscript').remove();

    const headings: string[] = [];
    $('h1, h2, h3').each((_, el) => {
      const txt = $(el).text().replace(/\s+/g, ' ').trim();
      if (txt && txt.length > 3 && txt.length < 120 && !headings.includes(txt)) {
        if (headings.length < 10) headings.push(txt);
      }
    });

    const bodyParagraphs: string[] = [];
    $('p, article, section').each((_, el) => {
      const pText = $(el).text().replace(/\s+/g, ' ').trim();
      if (pText && pText.length > 25 && !bodyParagraphs.includes(pText)) {
        if (bodyParagraphs.length < 8) bodyParagraphs.push(pText);
      }
    });

    const snippetText = bodyParagraphs.join('\n\n').slice(0, 3000);

    return {
      url: cleanUrl,
      title,
      description,
      headings,
      snippetText,
      emails,
      phones,
      socialLinks,
    };
  } catch (error) {
    return null;
  }
}
