import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await auth()
    // Verify admin access
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || "ALL"

    const whereClause: any = {
      referenceType: "OFFLINE_DEPOSIT",
    }

    if (status !== "ALL") {
      whereClause.status = status
    }

    const deposits = await prisma.partnerWalletTransaction.findMany({
      where: whereClause,
      include: {
        partner: {
          select: {
            id: true,
            companyName: true,
            partnerType: true,
            walletBalance: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({
      success: true,
      deposits: deposits.map((d) => ({
        id: d.id,
        partnerId: d.partnerId,
        partnerName: d.partner ? `${d.partner.user?.firstName} ${d.partner.user?.lastName}` : "Unknown",
        partnerCompany: d.partner?.companyName || "N/A",
        partnerEmail: d.partner?.user?.email || "N/A",
        partnerType: d.partner?.partnerType || "WHITE_LABEL",
        currentWalletBalance: d.partner?.walletBalance ?? 0,
        amount: d.amount,
        paymentMode: d.paymentMode || "NEFT",
        utrNumber: d.utrNumber || d.referenceId || "N/A",
        status: d.status,
        notes: d.notes,
        approvedBy: d.approvedBy,
        approvedAt: d.approvedAt,
        createdAt: d.createdAt,
      }))
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch deposits" }, { status: 500 })
  }
}
