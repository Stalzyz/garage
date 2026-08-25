import * as cheerio from 'cheerio';

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
 * Extracts emails using mailto: links and regex patterns across HTML
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

  // 2. Extract via regex across full HTML
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  const matches = html.match(emailRegex) || [];
  for (const match of matches) {
    const clean = match.trim().toLowerCase();
    // Filter out common false positives like asset filenames or dummy placeholders
    if (
      isValidEmail(clean) &&
      !clean.endsWith('.png') &&
      !clean.endsWith('.jpg') &&
      !clean.endsWith('.jpeg') &&
      !clean.endsWith('.svg') &&
      !clean.endsWith('.webp') &&
      !clean.includes('example.com') &&
      !clean.includes('domain.com') &&
      !clean.includes('sentry.io') &&
      !clean.includes('w3.org')
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
 * Extracts phone numbers from tel: links and regex
 */
function extractPhones(html: string, $: cheerio.CheerioAPI): string[] {
  const phones = new Set<string>();

  // 1. Extract from tel: hrefs
  $('a[href^="tel:"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) {
      const phone = href.replace(/^tel:/i, '').trim();
      if (phone.length >= 7) phones.add(phone);
    }
  });

  // 2. Regex search for international & Indian phone patterns (e.g. +91 9876543210, +1 (555) 000-0000, 1800-123-456)
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,5}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
  const rawMatches = html.match(phoneRegex) || [];
  for (const match of rawMatches) {
    const clean = match.trim();
    const digitsOnly = clean.replace(/\D/g, '');
    if (digitsOnly.length >= 8 && digitsOnly.length <= 14) {
      // Avoid matching dates (e.g. 2026-08-25) or timestamps
      if (!clean.startsWith('202') && !clean.startsWith('199')) {
        phones.add(clean);
      }
    }
  }

  return Array.from(phones).slice(0, 5);
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
 * Native, zero-cost live web scraper.
 * Fetches HTML from a target domain or website URL, parses metadata, emails, phone numbers, and text using Cheerio.
 */
export async function scrapeWebsiteText(urlInput: string): Promise<ScrapedSiteData | null> {
  try {
    let cleanUrl = urlInput.trim();
    if (!cleanUrl) return null;

    if (!cleanUrl.includes('.') && !cleanUrl.startsWith('http')) {
      return null;
    }

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout

    const fetchOptions = {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webkit,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
    };

    const response = await fetch(cleanUrl, fetchOptions).finally(() => clearTimeout(timeoutId));

    if (!response.ok) return null;

    let html = await response.text();
    if (!html || html.length < 50) return null;

    let $ = cheerio.load(html);

    // Extract Emails, Phone Numbers, and Social Links BEFORE removing headers/footers
    const emails = extractEmails(html, $);
    const phones = extractPhones(html, $);
    const socialLinks = extractSocials($);

    // Extract Title & Meta Description
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

    // If no emails/phones found on home page, try to fetch /contact or /contact-us
    if (emails.length === 0 && phones.length === 0) {
      try {
        const contactLink = $('a[href*="contact"]').first().attr('href');
        if (contactLink) {
          let contactUrl = contactLink;
          if (!contactUrl.startsWith('http')) {
            const origin = new URL(cleanUrl).origin;
            contactUrl = contactUrl.startsWith('/') ? `${origin}${contactUrl}` : `${origin}/${contactUrl}`;
          }

          const cController = new AbortController();
          const cTimeout = setTimeout(() => cController.abort(), 4000);
          const cRes = await fetch(contactUrl, { ...fetchOptions, signal: cController.signal }).finally(() => clearTimeout(cTimeout));
          
          if (cRes.ok) {
            const cHtml = await cRes.text();
            const c$ = cheerio.load(cHtml);
            const cEmails = extractEmails(cHtml, c$);
            const cPhones = extractPhones(cHtml, c$);
            
            cEmails.forEach(e => { if (!emails.includes(e)) emails.push(e); });
            cPhones.forEach(p => { if (!phones.includes(p)) phones.push(p); });
          }
        }
      } catch (e) {
        // Silently skip contact page secondary scrap
      }
    }

    // Now clean noise elements (scripts, styles, etc.) for AI prompt snippet extraction
    $('script, style, svg, iframe, noscript').remove();

    // Extract H1, H2, H3 Headings
    const headings: string[] = [];
    $('h1, h2, h3').each((_, el) => {
      const txt = $(el).text().replace(/\s+/g, ' ').trim();
      if (txt && txt.length > 3 && txt.length < 120 && !headings.includes(txt)) {
        if (headings.length < 10) headings.push(txt);
      }
    });

    // Extract Paragraph Text Content
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
