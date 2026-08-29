import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// In-Memory LRU Cache for lightning-fast live previews (5-minute TTL)
interface CacheEntry {
  html: string
  status: number
  contentType: string
  timestamp: number
}

const memoryCache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "*",
      "Cache-Control": "public, max-age=86400",
    },
  })
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const targetUrl = searchParams.get("url")

  if (!targetUrl) {
    return new NextResponse("Missing 'url' query parameter", { status: 400 })
  }

  try {
    let cleanUrl = targetUrl.trim().replace(/^['"]|['"]$/g, '')
    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = `https://${cleanUrl}`
    }

    const parsedUrl = new URL(cleanUrl)
    const cacheKey = parsedUrl.toString()

    // 1. Check in-memory RAM cache (instant < 2ms response)
    const cached = memoryCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return new NextResponse(cached.html, {
        status: cached.status,
        headers: {
          "Content-Type": cached.contentType,
          "Access-Control-Allow-Origin": "*",
          "Content-Security-Policy": "frame-ancestors *",
          "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=86400",
          "X-Proxy-Cache": "HIT",
        },
      })
    }

    // 2. Fetch external page with fast timeouts and modern browser headers
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8s timeout

    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 GrekamPreviewBot/2.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1"
      },
      next: { revalidate: 300 }
    })
    clearTimeout(timeoutId)

    const contentType = response.headers.get("content-type") || "text/html; charset=utf-8"
    
    // If it's HTML, inject base tag and strip any X-Frame-Options / CSP meta tags
    if (contentType.includes("text/html")) {
      let html = await response.text()
      
      // Determine the final origin (after redirects) for proper asset resolution
      let finalOrigin = parsedUrl.origin
      try {
        if (response.url) {
          finalOrigin = new URL(response.url).origin
        }
      } catch (e) {}

      const injectedHeadContent = `
        <base href="${finalOrigin}/">
        <script>
          // Neutralize frame buster scripts
          try {
            window.top = window.self;
            window.parent = window.self;
          } catch(e) {}
          // Keep internal navigation inside frame
          document.addEventListener('click', function(e) {
            var a = e.target.closest('a');
            if (a && (a.target === '_top' || a.target === '_parent')) {
              a.target = '_self';
            }
          }, true);
        </script>
      `
      
      // Remove any inline meta tags that block framing
      html = html.replace(/<\s*meta[^>]+(?:http-equiv=["']?(?:Content-Security-Policy|X-Frame-Options|frame-options)["']?|name=["']?(?:referrer)["']?)[^>]*>/gim, '')
      
      if (/<head[^>]*>/i.test(html)) {
        html = html.replace(/(<head[^>]*>)/i, `$1${injectedHeadContent}`)
      } else {
        html = `<head>${injectedHeadContent}</head>${html}`
      }

      // Store in memory cache
      memoryCache.set(cacheKey, {
        html,
        status: response.status,
        contentType,
        timestamp: Date.now(),
      })

      // Clean up cache size if too big
      if (memoryCache.size > 100) {
        const firstKey = memoryCache.keys().next().value
        if (firstKey) memoryCache.delete(firstKey)
      }

      const responseHeaders = new Headers({
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Content-Security-Policy": "frame-ancestors *",
        "Cache-Control": "public, max-age=300, s-maxage=600, stale-while-revalidate=86400",
        "X-Proxy-Cache": "MISS",
      })

      return new NextResponse(html, {
        status: response.status,
        headers: responseHeaders,
      })
    }

    // For non-HTML assets
    const buffer = await response.arrayBuffer()
    return new NextResponse(buffer, {
      status: response.status,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Content-Security-Policy": "frame-ancestors *",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    })
  } catch (err: any) {
    return new NextResponse(
      `<html><body style="background:#09090b;color:#fff;font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;padding:20px;box-sizing:border-box;"><div style="text-align:center;max-width:440px;"><div style="width:48px;height:48px;border-radius:12px;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.2);display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;color:#60a5fa;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div><h3 style="margin:0 0 8px 0;font-size:18px;font-weight:700;">Live Showcase Website</h3><p style="color:#a1a1aa;font-size:13px;line-height:1.5;margin:0 0 20px 0;">This site requires direct browser rendering.</p><a href="${targetUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px;background:linear-gradient(135deg, #2563eb, #7c3aed);color:#fff;text-decoration:none;padding:12px 24px;border-radius:12px;font-size:13px;font-weight:700;box-shadow:0 10px 25px -5px rgba(37,99,235,0.4);">Launch Live Website &rarr;</a></div></body></html>`,
      {
        status: 200,
        headers: { 
          "Content-Type": "text/html; charset=utf-8",
          "Content-Security-Policy": "frame-ancestors *"
        },
      }
    )
  }
}
