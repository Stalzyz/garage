import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await auth()
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "All"

    const whereClause: any = {}
    if (type === "Direct") {
      whereClause.partnerId = null
    } else if (type === "Reseller") {
      whereClause.partnerId = { not: null }
    }

    const organizations = await prisma.organization.findMany({
      where: whereClause,
      include: {
        partner: {
          select: {
            id: true,
            companyName: true,
            partnerType: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({
      success: true,
      garages: organizations.map((org) => ({
        id: org.id,
        name: org.name,
        owner: org.ownerName || "Garage Owner",
        email: org.ownerEmail || "N/A",
        phone: org.ownerPhone || "N/A",
        type: org.partnerId ? "Reseller" : "Direct",
        plan: org.subscription === "ACTIVE" ? "Pro Garage Plan" : "Starter Plan",
        reseller: org.partner?.companyName || "Direct Customer",
        status: org.status === "ACTIVE" ? "Active" : org.status === "PENDING_ACTIVATION" ? "Pending Activation" : org.status,
        renewal: new Date(new Date(org.createdAt).setFullYear(new Date(org.createdAt).getFullYear() + 1)).toISOString().split("T")[0],
        domain: org.domain,
        createdAt: org.createdAt,
      }))
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch garages" }, { status: 500 })
  }
}
