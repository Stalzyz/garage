import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/require-admin"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status") || "All"

    const whereClause: any = {}
    if (status !== "All") {
      if (status === "Paid") whereClause.status = "COMPLETED"
      if (status === "Pending") whereClause.status = "PENDING"
      if (status === "Failed" || status === "Refunded") whereClause.status = "REJECTED"
    }

    const transactions = await prisma.partnerWalletTransaction.findMany({
      where: whereClause,
      include: {
        partner: {
          select: {
            companyName: true,
            partnerType: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json({
      success: true,
      payments: transactions.map((t) => ({
        id: t.id,
        amount: `₹${Math.abs(t.amount).toLocaleString()}`,
        garage: t.description,
        reseller: t.partner?.companyName || "Direct / Admin",
        plan: t.paymentMode || t.type,
        date: new Date(t.createdAt).toISOString().split("T")[0],
        status: t.status === "COMPLETED" ? "Paid" : t.status === "PENDING" ? "Pending" : "Failed",
        utrNumber: t.utrNumber,
      }))
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch payments" }, { status: 500 })
  }
}
