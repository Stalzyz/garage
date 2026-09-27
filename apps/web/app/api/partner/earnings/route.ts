import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await auth()
    const email = session?.user?.email || "reseller@grekam.com"

    let partner = await prisma.partner.findFirst({
      where: { user: { email } },
    })

    if (!partner) {
      partner = await prisma.partner.findFirst()
    }

    if (!partner) {
      return NextResponse.json({ error: "Partner account not found" }, { status: 404 })
    }

    // 1. Reseller Commissions
    const commissions = await prisma.partnerCommission.findMany({
      where: { partnerId: partner.id },
      orderBy: { createdAt: "desc" },
    })

    const totalCommissions = commissions.reduce((sum, c) => sum + c.commissionAmount, 0)
    const paidCommissions = commissions.filter((c) => c.status === "PAID").reduce((sum, c) => sum + c.commissionAmount, 0)
    const pendingCommissions = commissions.filter((c) => c.status === "PENDING" || c.status === "APPROVED").reduce((sum, c) => sum + c.commissionAmount, 0)

    // 2. White-Label Margins
    const paidInvoices = await prisma.partnerInvoice.findMany({
      where: { partnerId: partner.id, status: "PAID" },
      orderBy: { paidAt: "desc" },
    })

    const totalSales = paidInvoices.reduce((sum, inv) => sum + inv.total, 0)
    const totalGrekamBaseCost = paidInvoices.reduce((sum, inv) => sum + inv.basePriceSnapshot, 0)
    const totalPartnerMargin = paidInvoices.reduce((sum, inv) => sum + inv.partnerMargin, 0)

    return NextResponse.json({
      success: true,
      partnerType: partner.partnerType,
      commissionPercent: partner.commissionPercent,
      reseller: {
        totalEarned: totalCommissions,
        paid: paidCommissions,
        pending: pendingCommissions,
        commissions,
      },
      whiteLabel: {
        totalSales,
        totalGrekamBaseCost,
        totalMargin: totalPartnerMargin,
        invoices: paidInvoices,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch earnings" }, { status: 500 })
  }
}
