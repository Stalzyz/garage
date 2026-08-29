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
    const rawUrl = targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`
    const parsedUrl = new URL(rawUrl)
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
    const timeoutId = setTimeout(() => controller.abort(), 6000) // 6s timeout

    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 GrekamPreviewBot/2.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      next: { revalidate: 300 }
    })
    clearTimeout(timeoutId)

    const contentType = response.headers.get("content-type") || "text/html; charset=utf-8"
    
    // If it's HTML, inject base tag and strip any X-Frame-Options / CSP meta tags
    if (contentType.includes("text/html")) {
      let html = await response.text()
      const baseTag = `<base href="${parsedUrl.origin}/">`
      
      // Remove any inline meta tags that block framing
      html = html.replace(/<meta[^>]+http-equiv=["']?(?:X-Frame-Options|Content-Security-Policy)["']?[^>]*>/gi, '')
      
      if (html.includes("<head>")) {
        html = html.replace("<head>", `<head>${baseTag}`)
      } else if (html.includes("<HEAD>")) {
        html = html.replace("<HEAD>", `<HEAD>${baseTag}`)
      } else {
        html = `${baseTag}${html}`
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
      `<html><body style="background:#09090b;color:#fff;font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;padding:20px;box-sizing:border-box;"><div style="text-align:center;max-width:400px;"><div style="width:48px;height:48px;border-radius:12px;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.2);display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;color:#f87171;"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg></div><h3 style="margin:0 0 8px 0;font-size:18px;font-weight:700;">Direct Live Preview</h3><p style="color:#a1a1aa;font-size:13px;line-height:1.5;margin:0 0 20px 0;">This external server took too long or requires a full browser session.</p><a href="${targetUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px;background:#2563eb;color:#fff;text-decoration:none;padding:10px 20px;border-radius:10px;font-size:13px;font-weight:600;">Open Live Site Directly &rarr;</a></div></body></html>`,
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
