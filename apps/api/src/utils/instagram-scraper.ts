/**
 * Instagram Puppeteer Scraper
 * Uses headless Chromium to render the full Instagram profile page (JS included)
 * and extract contact email, phone, bio, website, follower count.
 */
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

function findEmailsInText(text: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  const matches = text.match(emailRegex) || [];
  const BLACKLIST = ['sentry.io', 'schema.org', 'w3.org', 'example.com', 'cdninstagram.com', 'fbcdn.net'];
  return [...new Set(
    matches
      .map(m => m.trim().toLowerCase())
      .filter(m => m.length < 80 && !BLACKLIST.some(b => m.includes(b)))
  )].slice(0, 5);
}

function findPhonesInText(text: string): string[] {
  const phones = new Set<string>();

  // WhatsApp links (wa.me/91XXXXXXXXXX)
  const waMatches = text.match(/wa\.me\/(\+?\d{10,14})/gi) || [];
  for (const wa of waMatches) {
    const digits = wa.replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) {
      phones.add(`+91 ${digits.slice(2, 7)} ${digits.slice(7)}`);
    } else if (digits.length === 10 && '6789'.includes(digits[0])) {
      phones.add(`+91 ${digits.slice(0, 5)} ${digits.slice(5)}`);
    }
  }

  // International numbers with +
  const intlMatches = text.match(/\+(?:91|1|44|61|971|65|66|60)[\s\-.]?\d{3,5}[\s\-.]?\d{3,5}[\s\-.]?\d{3,5}/g) || [];
  for (const m of intlMatches) {
    const digits = m.replace(/\D/g, '');
    if (digits.length >= 10 && digits.length <= 13) phones.add(m.trim());
  }

  // Indian Mobile 10-digit starting with 6-9
  const mobileMatches = text.match(/(?<!\d)([6-9]\d{9})(?!\d)/g) || [];
  for (const m of mobileMatches) {
    phones.add(`+91 ${m.slice(0, 5)} ${m.slice(5)}`);
  }

  return [...phones].slice(0, 5);
}

export async function scrapeInstagramWithPuppeteer(handle: string): Promise<InstagramProfileData | null> {
  let url = handle.trim();
  if (url.includes('instagram.com')) {
    const match = url.match(/instagram\.com\/([a-zA-Z0-9._]+)/i);
    if (!match) return null;
    handle = match[1];
  }
  url = `https://www.instagram.com/${handle.replace('@', '')}/`;

  let browser: any = null;
  try {
    // Try system Chromium first (cheaper on VPS), fallback to puppeteer's bundled
    const executablePath =
      process.env.CHROMIUM_PATH ||
      (await findSystemChromium());

    const launchOpts: any = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-extensions',
      ],
    };
    if (executablePath) launchOpts.executablePath = executablePath;

    browser = await puppeteer.launch(launchOpts);
    const page = await browser.newPage();

    // Set realistic browser headers so Instagram doesn't block
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    );
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    });
    await page.setViewport({ width: 1280, height: 900 });

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });

    // Wait for profile section to hydrate (Instagram uses React)
    await page.waitForSelector('meta[property="og:description"]', { timeout: 10000 }).catch(() => {});

    const data = await page.evaluate(() => {
      // Extract from meta tags (most reliable)
      const ogTitle = (document.querySelector('meta[property="og:title"]') as HTMLMetaElement)?.content || '';
      const ogDesc = (document.querySelector('meta[property="og:description"]') as HTMLMetaElement)?.content || '';
      const pageTitle = document.title || '';

      // Get ALL visible text on page
      const bodyText = document.body?.innerText || '';

      // Try JSON-LD scripts
      let jsonLdText = '';
      document.querySelectorAll('script[type="application/ld+json"]').forEach(s => {
        jsonLdText += (s.textContent || '') + ' ';
      });

      // Try to get the external URL from the link in bio
      let externalUrl = '';
      const linkEls = Array.from(document.querySelectorAll('a[href]')) as HTMLAnchorElement[];
      for (const a of linkEls) {
        if (a.href && !a.href.includes('instagram.com') && !a.href.includes('javascript')) {
          externalUrl = a.href;
          break;
        }
      }

      return { ogTitle, ogDesc, pageTitle, bodyText, jsonLdText, externalUrl };
    });

    const fullText = `${data.ogTitle} ${data.ogDesc} ${data.bodyText} ${data.jsonLdText}`;

    const emails = findEmailsInText(fullText);
    const phones = findPhonesInText(fullText);

    // Parse follower/following/post counts from og:description
    // Instagram og:description format: "1.2M Followers, 500 Following, 300 Posts – See Instagram photos..."
    const followerMatch = data.ogDesc.match(/([\d.,]+[KkMm]?)\s*Followers?/i);
    const followingMatch = data.ogDesc.match(/([\d.,]+[KkMm]?)\s*Following/i);
    const postMatch = data.ogDesc.match(/([\d.,]+[KkMm]?)\s*Posts?/i);

    const handleClean = handle.startsWith('@') ? handle : `@${handle}`;

    return {
      handle: handleClean,
      fullName: data.ogTitle.replace(/ \(@[^)]+\).*/, '').replace(/\s*•.*/, '').trim(),
      bio: data.ogDesc,
      externalUrl: data.externalUrl,
      followerCount: followerMatch?.[1] || '',
      followingCount: followingMatch?.[1] || '',
      postCount: postMatch?.[1] || '',
      email: emails[0] || '',
      phone: phones[0] || '',
      emails,
      phones,
    };
  } catch (err: any) {
    console.error(`[InstagramPuppeteer] Failed to scrape ${url}: ${err.message}`);
    return null;
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

async function findSystemChromium(): Promise<string | undefined> {
  const { execSync } = await import('child_process');
  const candidates = [
    '/snap/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    'chromium-browser',
    'chromium',
    'google-chrome-stable',
    'google-chrome',
  ];
  for (const c of candidates) {
    try {
      // Check fixed paths directly
      if (c.startsWith('/')) {
        const { existsSync } = await import('fs');
        if (existsSync(c)) return c;
        continue;
      }
      const path = execSync(`which ${c} 2>/dev/null`, { encoding: 'utf8' }).trim();
      if (path) return path;
    } catch (_) {}
  }
  return undefined;
}
