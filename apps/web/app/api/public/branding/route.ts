import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const queryDomain = url.searchParams.get("domain")
    const hostHeader = req.headers.get("x-forwarded-host") || req.headers.get("host") || ""
    const rawHost = queryDomain || hostHeader
    const cleanHost = rawHost.toLowerCase().split(":")[0].trim()

    // 1. Try resolving by Tenant customDomain or slug
    if (cleanHost && cleanHost !== "localhost" && cleanHost !== "127.0.0.1") {
      // Direct custom domain match
      let tenant = await prisma.tenant.findFirst({
        where: {
          OR: [
            { customDomain: cleanHost },
            { slug: cleanHost }
          ]
        },
        include: { branding: true }
      })

      // Subdomain resolution (e.g., demo.grekam.in -> slug: demo)
      if (!tenant && cleanHost.includes(".")) {
        const parts = cleanHost.split(".")
        if (parts.length >= 3) {
          const sub = parts[0]
          if (sub !== "app" && sub !== "dashboard" && sub !== "www" && sub !== "api") {
            tenant = await prisma.tenant.findFirst({
              where: { slug: sub },
              include: { branding: true }
            })
          }
        }
      }

      if (tenant && tenant.branding) {
        const tb = tenant.branding
        return NextResponse.json({
          success: true,
          data: {
            id: tenant.id,
            name: tenant.name,
            companyName: tb.companyName || tenant.name,
            logoUrl: tb.logoUrl || null,
            faviconUrl: tb.faviconUrl || null,
            primaryColor: tb.primaryColor || "#2563eb",
            secondaryColor: tb.secondaryColor || "#7c3aed",
            accentColor: tb.accentColor || "#10b981",
            darkModeDefault: tb.darkModeDefault ?? true,
            supportEmail: tb.supportEmail || null,
            supportPhone: tb.supportPhone || null,
          }
        })
      }

      // 2. Try resolving by Partner WhiteLabel customDomain
      const partnerWl = await prisma.partnerWhiteLabel.findFirst({
        where: { customDomain: cleanHost },
        include: { partner: { include: { user: true } } }
      })

      if (partnerWl) {
        return NextResponse.json({
          success: true,
          data: {
            id: partnerWl.id,
            name: partnerWl.brandName || partnerWl.partner?.companyName || "Garage Portal",
            companyName: partnerWl.partner?.companyName || partnerWl.brandName,
            logoUrl: partnerWl.logoUrl || null,
            faviconUrl: null,
            primaryColor: "#2563eb",
            secondaryColor: "#7c3aed",
            accentColor: "#10b981",
            darkModeDefault: true,
            supportEmail: partnerWl.partner?.user?.email || null,
          }
        })
      }

      // 3. Try resolving by Organization domain / slug
      const org = await prisma.organization.findFirst({
        where: {
          OR: [
            { domain: cleanHost },
            { slug: cleanHost }
          ]
        }
      })

      if (org) {
        return NextResponse.json({
          success: true,
          data: {
            id: org.id,
            name: org.name || "Grekam Garage OS",
            companyName: org.companyName || "Grekam Garage & Technologies Pvt Ltd",
            logoUrl: org.logoUrl || null,
            faviconUrl: org.faviconUrl || null,
            primaryColor: org.primaryColor || "#2563eb",
            secondaryColor: org.secondaryColor || "#7c3aed",
            accentColor: org.accentColor || "#10b981",
            darkModeDefault: org.darkModeDefault ?? true,
            supportEmail: org.supportEmail || "support@grekam.in",
          }
        })
      }
    }

    // Default platform fallback
    const defaultOrg = await prisma.organization.findFirst({
      where: {
        OR: [
          { workspaceId: "ws_default_admin" },
          { domain: "grekam.in" },
          { ownerEmail: { equals: "admin@grekam.in", mode: "insensitive" } },
        ]
      }
    }) || await prisma.organization.findFirst()

    return NextResponse.json({
      success: true,
      data: {
        id: defaultOrg?.id || "default",
        name: defaultOrg?.name || "Grekam Garage OS",
        companyName: defaultOrg?.companyName || "Grekam Garage & Technologies Pvt Ltd",
        logoUrl: defaultOrg?.logoUrl || null,
        faviconUrl: defaultOrg?.faviconUrl || null,
        primaryColor: defaultOrg?.primaryColor || "#2563eb",
        secondaryColor: defaultOrg?.secondaryColor || "#7c3aed",
        accentColor: defaultOrg?.accentColor || "#10b981",
        darkModeDefault: defaultOrg?.darkModeDefault ?? true,
        supportEmail: defaultOrg?.supportEmail || "support@grekam.in",
      }
    })
  } catch (error: any) {
    console.error("Public branding resolver error:", error)
    return NextResponse.json({
      success: true,
      data: {
        name: "Grekam Garage OS",
        primaryColor: "#2563eb",
        darkModeDefault: true
      }
    })
  }
}
