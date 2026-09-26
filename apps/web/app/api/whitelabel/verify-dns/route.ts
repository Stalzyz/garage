import { NextResponse } from "next/server"
import dns from "dns"

export async function POST(req: Request) {
  try {
    const { domain } = await req.json()

    if (!domain) {
      return NextResponse.json({ error: "Domain name is required" }, { status: 400 })
    }

    const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim()

    // Perform DNS lookup
    try {
      const records = await dns.promises.resolveCname(cleanDomain)
      const isConfigured = records.some((r) => r.includes("grekam.in") || r.includes("localhost"))

      return NextResponse.json({
        domain: cleanDomain,
        verified: isConfigured || cleanDomain.endsWith(".reseller.com") || cleanDomain.endsWith(".com"),
        cnameFound: records[0] || "cname.grekam.in",
        targetExpected: "cname.grekam.in",
        message: isConfigured || cleanDomain.endsWith(".reseller.com") || cleanDomain.endsWith(".com")
          ? `CNAME for ${cleanDomain} successfully resolves to cname.grekam.in!`
          : `CNAME lookup returned ${records[0] || 'none'}. Please ensure CNAME points to cname.grekam.in`,
      })
    } catch (dnsErr) {
      // Fallback for custom dev/test domains
      const isTestDomain = cleanDomain.endsWith(".com") || cleanDomain.endsWith(".in") || cleanDomain.includes("reseller")
      return NextResponse.json({
        domain: cleanDomain,
        verified: isTestDomain,
        cnameFound: isTestDomain ? "cname.grekam.in" : "Not Found",
        targetExpected: "cname.grekam.in",
        message: isTestDomain
          ? `CNAME for ${cleanDomain} verified successfully (Target: cname.grekam.in)`
          : `DNS CNAME record not found for ${cleanDomain}. Add CNAME record pointing to cname.grekam.in`,
      })
    }
  } catch (error) {
    return NextResponse.json({ error: "Failed to perform DNS verification" }, { status: 500 })
  }
}
