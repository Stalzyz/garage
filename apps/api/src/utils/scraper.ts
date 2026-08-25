import * as cheerio from 'cheerio';

export interface ScrapedSiteData {
  url: string;
  title: string;
  description: string;
  headings: string[];
  snippetText: string;
}

/**
 * Native, zero-cost live web scraper.
 * Fetches HTML from a target domain or website URL, parses metadata and page text using Cheerio.
 */
export async function scrapeWebsiteText(urlInput: string): Promise<ScrapedSiteData | null> {
  try {
    let cleanUrl = urlInput.trim();
    if (!cleanUrl) return null;

    // Check if user entered a company name instead of a URL or domain
    if (!cleanUrl.includes('.') && !cleanUrl.startsWith('http')) {
      return null;
    }

    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    // 1. Fetch live HTML with standard browser headers to prevent bot blocks
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout

    const response = await fetch(cleanUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept':
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webkit,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      return null;
    }

    const html = await response.text();
    if (!html || html.length < 50) return null;

    // 2. Parse HTML using Cheerio
    const $ = cheerio.load(html);

    // Remove noise elements (scripts, styles, tracking tags, SVG icons, menus)
    $('script, style, svg, iframe, noscript, nav, footer, header, form, button').remove();

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
    };
  } catch (error) {
    // If scraping fails (e.g. timeout or connection refusal), return null gracefully
    return null;
  }
}
