import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await auth()
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "All"

    // 1. Fetch all Organizations (Partner / Reseller customers & Direct)
    const orgWhere: any = {}
    if (type === "Direct") {
      orgWhere.partnerId = null
    } else if (type === "Reseller") {
      orgWhere.partnerId = { not: null }
    }

    const organizations = await prisma.organization.findMany({
      where: orgWhere,
      orderBy: { createdAt: "desc" }
    })

    // Fetch Partners for name lookup
    const partners = await prisma.partner.findMany({
      select: {
        id: true,
        companyName: true,
        partnerType: true,
      }
    })
    const partnerMap = new Map<string, any>()
    partners.forEach(p => partnerMap.set(p.id, p))

    // 2. Fetch all Tenants (Workspaces created via Direct Provisioning)
    const tenants = await prisma.tenant.findMany({
      include: {
        branding: true,
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    // Map and consolidate garages
    const garagesMap = new Map<string, any>()

    // Add organizations first
    for (const org of organizations) {
      garagesMap.set(org.id, {
        id: org.id,
        name: org.name,
        owner: org.ownerName || "Garage Owner",
        email: org.ownerEmail || "N/A",
        phone: org.ownerPhone || "N/A",
        type: org.partnerId ? "Reseller" : "Direct",
        plan: org.subscription === "ACTIVE" ? "Growth Plan" : "Starter Plan",
        reseller: org.partnerId ? (partnerMap.get(org.partnerId)?.companyName || "Reseller Partner") : "Direct Customer",
        status: org.status === "ACTIVE" ? "Active" : org.status === "PENDING_ACTIVATION" ? "Pending Activation" : (org.status || "Active"),
        renewal: new Date(new Date(org.createdAt).setFullYear(new Date(org.createdAt).getFullYear() + 1)).toISOString().split("T")[0],
        domain: org.domain || (org.name ? `${org.name.toLowerCase().replace(/[^a-z0-9]/g, "")}.grekam.in` : null),
        createdAt: org.createdAt,
      })
    }

    // Add or merge tenants
    for (const t of tenants) {
      if (!garagesMap.has(t.id)) {
        const ownerMember = t.members.find(m => m.role === "OWNER") || t.members[0]
        const ownerUser = ownerMember?.user

        const isDirect = true // Tenants created directly in DB
        if (type === "Reseller") {
          continue // skip direct tenants if filter is Reseller only
        }

        garagesMap.set(t.id, {
          id: t.id,
          name: t.name,
          owner: ownerUser ? `${ownerUser.firstName} ${ownerUser.lastName}`.trim() : "Garage Owner",
          email: ownerUser?.email || "N/A",
          phone: ownerUser?.phone || "N/A",
          type: "Direct",
          plan: t.plan === "ENTERPRISE" ? "Enterprise Plan" : t.plan === "GROWTH" ? "Growth Plan" : "Starter Plan",
          reseller: "Direct Customer",
          status: t.status === "ACTIVE" ? "Active" : t.status,
          renewal: new Date(new Date(t.createdAt).setFullYear(new Date(t.createdAt).getFullYear() + 1)).toISOString().split("T")[0],
          domain: t.customDomain || `${t.slug}.grekam.in`,
          createdAt: t.createdAt,
        })
      }
    }

    const garagesList = Array.from(garagesMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json({
      success: true,
      garages: garagesList,
      count: garagesList.length
    })
  } catch (error: any) {
    console.error("Admin garages API error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch garages" }, { status: 500 })
  }
}
