import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const targetUrl = searchParams.get("url")

  if (!targetUrl) {
    return new NextResponse("Missing 'url' query parameter", { status: 400 })
  }

  try {
    const parsedUrl = new URL(targetUrl)
    
    // Fetch external page
    const response = await fetch(parsedUrl.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 GrekamPreviewBot/1.0",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      },
      next: { revalidate: 0 }
    })

    const contentType = response.headers.get("content-type") || "text/html; charset=utf-8"
    
    // If it's HTML, inject a base tag so relative links and assets load correctly
    if (contentType.includes("text/html")) {
      let html = await response.text()
      const baseTag = `<base href="${parsedUrl.origin}/">`
      
      if (html.includes("<head>")) {
        html = html.replace("<head>", `<head>${baseTag}`)
      } else if (html.includes("<HEAD>")) {
        html = html.replace("<HEAD>", `<HEAD>${baseTag}`)
      } else {
        html = `${baseTag}${html}`
      }

      return new NextResponse(html, {
        status: response.status,
        headers: {
          "Content-Type": contentType,
          "Access-Control-Allow-Origin": "*",
        },
      })
    }

    // For non-HTML
    const buffer = await response.arrayBuffer()
    return new NextResponse(buffer, {
      status: response.status,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (err: any) {
    return new NextResponse(
      `<html><body style="background:#09090b;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;"><div style="text-align:center;"><h3>Unable to load live preview</h3><p style="color:#a1a1aa;font-size:14px;">${err.message || 'Direct iframe connection restricted'}</p></div></body></html>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html; charset=utf-8" },
      }
    )
  }
}
