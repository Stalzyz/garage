import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")
    const status = searchParams.get("status")

    const where: any = {}
    if (type && type !== "ALL") where.partnerType = type
    if (status && status !== "ALL") where.status = status

    const partners = await prisma.partner.findMany({
      where,
      include: {
        user: { select: { email: true, firstName: true, lastName: true, phone: true } },
        wallet: true,
        whiteLabel: true,
        kyc: true,
        _count: {
          select: {
            invoices: true,
            packages: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Compute customer counts per partner
    const partnerCustomerCounts = await prisma.organization.groupBy({
      by: ["partnerId"],
      _count: { id: true },
      where: { partnerId: { not: null } },
    })

    const countMap = new Map<string, number>()
    partnerCustomerCounts.forEach((c) => {
      if (c.partnerId) countMap.set(c.partnerId, c._count.id)
    })

    const enriched = partners.map((p) => ({
      id: p.id,
      name: `${p.user?.firstName || ""} ${p.user?.lastName || ""}`.trim() || p.companyName || "Partner",
      company: p.companyName || "Independent Partner",
      email: p.user?.email,
      phone: p.user?.phone,
      type: p.partnerType,
      status: p.status,
      kycStatus: p.kycStatus,
      walletBalance: p.wallet?.balance ?? p.walletBalance ?? 0.0,
      customerCount: countMap.get(p.id) || 0,
      commissionPercent: p.commissionPercent,
      whiteLabelEnabled: p.whiteLabelEnabled,
      maxPriceMultiplier: p.maxPriceMultiplier,
      whiteLabel: p.whiteLabel,
      createdAt: p.createdAt,
    }))

    return NextResponse.json({
      success: true,
      partners: enriched,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch partners" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, firstName, lastName, companyName, partnerType, commissionPercent, whiteLabelEnabled } = body

    if (!email || !firstName) {
      return NextResponse.json({ error: "Email and first name are required." }, { status: 400 })
    }

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          firstName,
          lastName: lastName || "",
          role: "PARTNER",
          status: "ACTIVE",
          passwordHash: "demo_hash_partner",
        },
      })
    }

    const partnerCode = `PRT-${Date.now().toString().slice(-4)}`

    const partner = await prisma.partner.create({
      data: {
        userId: user.id,
        partnerCode,
        partnerType: partnerType || "RESELLER",
        companyName: companyName || `${firstName}'s Agency`,
        status: "ACTIVE",
        kycStatus: "APPROVED",
        commissionPercent: commissionPercent ? parseFloat(commissionPercent) : 20.0,
        whiteLabelEnabled: !!whiteLabelEnabled,
        walletBalance: 0.0,
      },
    })

    // Initialize wallet
    await prisma.partnerWallet.create({
      data: {
        partnerId: partner.id,
        balance: 0.0,
        status: "ACTIVE",
      },
    })

    return NextResponse.json({
      success: true,
      partner,
      message: `Partner "${companyName || firstName}" created and approved successfully.`,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create partner" }, { status: 500 })
  }
}
