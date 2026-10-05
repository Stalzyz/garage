import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/require-admin"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  try {
    // 1. Live Database Counts
    const totalGarages = await prisma.organization.count()
    const directGarages = await prisma.organization.count({
      where: { partnerId: null }
    })
    const resellerGarages = await prisma.organization.count({
      where: { partnerId: { not: null } }
    })
    const totalResellers = await prisma.partner.count()
    const activeSubscriptions = await prisma.organization.count({
      where: { status: "ACTIVE" }
    })

    // 2. Verified Float in Escrow / Revenue
    const walletTxs = await prisma.partnerWalletTransaction.findMany({
      where: { type: "RECHARGE", status: "COMPLETED" },
    })
    const totalRevenue = walletTxs.reduce((sum, tx) => sum + (tx.amount || 0), 0)

    // 3. Live Recent Activity Logs
    const recentLogs = await prisma.partnerActivityLog.findMany({
      take: 6,
      orderBy: { createdAt: "desc" }
    })

    // 4. Live Recent Wallet & Payment Transactions
    const recentPayments = await prisma.partnerWalletTransaction.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        partner: {
          select: {
            companyName: true,
            partnerType: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      stats: {
        totalGarages,
        directGarages,
        resellerGarages,
        totalResellers,
        activeSubscriptions,
        expiringSoon: 0,
        thisMonthRevenue: `₹${totalRevenue.toLocaleString()}`,
        revenueRaw: totalRevenue,
      },
      recentActivity: recentLogs.map((log) => ({
        id: log.id,
        who: log.actorUserId || "Platform User",
        action: log.action.replace(/_/g, " "),
        target: log.description,
        date: new Date(log.createdAt).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      })),
      recentPayments: recentPayments.map((p) => ({
        id: p.id,
        garage: p.description,
        reseller: p.partner?.companyName || "Direct / Admin",
        amount: `₹${Math.abs(p.amount).toLocaleString()}`,
        date: new Date(p.createdAt).toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric"
        }),
        status: p.status === "COMPLETED" ? "Paid" : p.status === "PENDING" ? "Pending" : "Rejected",
        type: p.type
      }))
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch admin dashboard" }, { status: 500 })
  }
}
