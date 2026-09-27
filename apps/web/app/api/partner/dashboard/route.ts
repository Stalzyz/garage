import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await auth()
    const email = session?.user?.email || "reseller@grekam.com"

    let partner = await prisma.partner.findFirst({
      where: {
        user: { email },
      },
      include: {
        wallet: true,
        whiteLabel: true,
        packages: true,
      },
    })

    // Fallback to first active partner if not found
    if (!partner) {
      partner = await prisma.partner.findFirst({
        include: {
          wallet: true,
          whiteLabel: true,
          packages: true,
        },
      })
    }

    if (!partner) {
      return NextResponse.json({ error: "Partner account not found" }, { status: 404 })
    }

    // Fetch partner's organizations/customers
    const customers = await prisma.organization.findMany({
      where: { partnerId: partner.id },
      orderBy: { createdAt: "desc" },
    })

    const totalCustomers = customers.length
    const activeCustomers = customers.filter((c) => c.status === "ACTIVE").length
    const pendingCustomers = customers.filter((c) => c.status === "PENDING" || c.status === "PENDING_ACTIVATION").length

    // Fetch recent invoices
    const invoices = await prisma.partnerInvoice.findMany({
      where: { partnerId: partner.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    })

    // Calculate total sales & margins
    const paidInvoices = await prisma.partnerInvoice.findMany({
      where: { partnerId: partner.id, status: "PAID" },
    })

    const thisMonthSales = paidInvoices.reduce((acc, inv) => acc + inv.total, 0)
    const myEarnings = paidInvoices.reduce((acc, inv) => acc + inv.partnerMargin, 0)

    // Commissions for reseller model
    const commissions = await prisma.partnerCommission.findMany({
      where: { partnerId: partner.id },
    })
    const totalCommissions = commissions.reduce((acc, comm) => acc + comm.commissionAmount, 0)

    // Recent activity logs
    const activities = await prisma.partnerActivityLog.findMany({
      where: { partnerId: partner.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    })

    return NextResponse.json({
      success: true,
      partner: {
        id: partner.id,
        partnerCode: partner.partnerCode,
        partnerType: partner.partnerType,
        companyName: partner.companyName || "Apex Auto Solutions",
        status: partner.status,
        kycStatus: partner.kycStatus,
        walletBalance: partner.wallet?.balance ?? partner.walletBalance ?? 0.0,
        whiteLabelEnabled: partner.whiteLabelEnabled,
        maxPriceMultiplier: partner.maxPriceMultiplier,
        commissionPercent: partner.commissionPercent,
        whiteLabel: partner.whiteLabel,
      },
      stats: {
        totalCustomers,
        activeCustomers,
        pendingCustomers,
        thisMonthSales,
        myEarnings: partner.partnerType === "WHITE_LABEL" ? myEarnings : totalCommissions,
        walletBalance: partner.wallet?.balance ?? partner.walletBalance ?? 0.0,
      },
      recentCustomers: customers.slice(0, 5),
      recentInvoices: invoices,
      recentActivities: activities,
    })
  } catch (error: any) {
    console.error("Partner dashboard API error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch dashboard data" }, { status: 500 })
  }
}
