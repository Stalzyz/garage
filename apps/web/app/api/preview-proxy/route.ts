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
    const timeoutId = setTimeout(() => controller.abort(), 9000) // 9s timeout

    const response = await fetch(parsedUrl.toString(), {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 GrekamPreviewEngine/3.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
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
    
    // If it's HTML, rewrite all relative URLs and inject polyfills
    if (contentType.includes("text/html")) {
      let html = await response.text()
      
      // Determine the final origin and path after any redirects
      let finalOrigin = parsedUrl.origin
      let finalPath = parsedUrl.pathname || "/"
      try {
        if (response.url) {
          const resParsed = new URL(response.url)
          finalOrigin = resParsed.origin
          finalPath = resParsed.pathname || "/"
        }
      } catch (e) {}

      // Robust relative URL rewrites to prevent 404s on subresources
      // 1. Rewrite href="/..." to href="https://origin/..."
      html = html.replace(/(href=["'])\/(?!\/)([^"'>\s]*)(["'])/gi, `$1${finalOrigin}/$2$3`)
      // 2. Rewrite src="/..." to src="https://origin/..."
      html = html.replace(/(src=["'])\/(?!\/)([^"'>\s]*)(["'])/gi, `$1${finalOrigin}/$2$3`)
      // 3. Rewrite srcset="/..."
      html = html.replace(/(srcset=["'])\/(?!\/)([^"'>\s]*)(["'])/gi, `$1${finalOrigin}/$2$3`)
      // 4. Rewrite CSS url('/...')
      html = html.replace(/url\((['"]?)\/(?!\/)([^'")\s]*)(['"]?\))/gi, `url($1${finalOrigin}/$2$3)`)

      // Remove meta tags that block framing
      html = html.replace(/<\s*meta[^>]+(?:http-equiv=["']?(?:Content-Security-Policy|X-Frame-Options|frame-options)["']?|name=["']?(?:referrer)["']?)[^>]*>/gim, '')

      const injectedHeadContent = `
        <base href="${finalOrigin}/">
        <script>
          (function() {
            var targetOrigin = ${JSON.stringify(finalOrigin)};
            var targetPath = ${JSON.stringify(finalPath)};

            // Safe Framebuster neutralizer
            try {
              Object.defineProperty(window, 'top', { get: function() { return window.self; }, configurable: true });
              Object.defineProperty(window, 'parent', { get: function() { return window.self; }, configurable: true });
            } catch(e) {}

            // Intercept relative fetch calls to point to the real target domain
            var originalFetch = window.fetch;
            if (originalFetch) {
              window.fetch = function(input, init) {
                if (typeof input === 'string') {
                  if (input.startsWith('/') && !input.startsWith('//')) {
                    input = targetOrigin + input;
                  }
                } else if (input && input.url && input.url.startsWith('/') && !input.url.startsWith('//')) {
                  input = new Request(targetOrigin + input.url, input);
                }
                return originalFetch.call(this, input, init);
              };
            }

            // Intercept XMLHttpRequest relative URLs
            if (window.XMLHttpRequest) {
              var originalOpen = window.XMLHttpRequest.prototype.open;
              window.XMLHttpRequest.prototype.open = function(method, url) {
                if (typeof url === 'string' && url.startsWith('/') && !url.startsWith('//')) {
                  url = targetOrigin + url;
                }
                return originalOpen.apply(this, arguments);
              };
            }

            // Keep internal navigation inside frame
            document.addEventListener('click', function(e) {
              var a = e.target.closest('a');
              if (a && (a.target === '_top' || a.target === '_parent')) {
                a.target = '_self';
              }
            }, true);
          })();
        </script>
      `
      
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

    // For non-HTML assets (images, fonts, scripts, json)
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
      `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Live Preview</title>
  <style>
    body {
      background: #09090b;
      color: #fff;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 24px;
      box-sizing: border-box;
    }
    .card {
      text-align: center;
      max-width: 460px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 36px 28px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(12px);
    }
    .icon-box {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2));
      border: 1px solid rgba(99, 102, 241, 0.3);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
      color: #818cf8;
    }
    h3 {
      margin: 0 0 10px 0;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.01em;
    }
    p {
      color: #a1a1aa;
      font-size: 14px;
      line-height: 1.6;
      margin: 0 0 24px 0;
    }
    .btn-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .btn-primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      color: #fff;
      text-decoration: none;
      padding: 13px 24px;
      border-radius: 14px;
      font-size: 14px;
      font-weight: 600;
      box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4);
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }
    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 14px 28px -5px rgba(37, 99, 235, 0.6);
    }
    .btn-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #e4e4e7;
      text-decoration: none;
      padding: 11px 20px;
      border-radius: 14px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-box">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
    </div>
    <h3>Live Client Showcase</h3>
    <p>This web application requires direct browser execution.</p>
    <div class="btn-group">
      <a href="${targetUrl}" target="_blank" rel="noopener noreferrer" class="btn-primary">
        Open Live Website ↗
      </a>
      <button onclick="window.location.reload()" class="btn-secondary">
        ↻ Retry Connection
      </button>
    </div>
  </div>
</body>
</html>`,
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
