import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: commissionId } = await params

    const comm = await prisma.partnerCommission.update({
      where: { id: commissionId },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
      include: { partner: true },
    })

    await prisma.partnerActivityLog.create({
      data: {
        actorUserId: "SUPER_ADMIN",
        partnerId: comm.partnerId,
        action: "COMMISSION_PAID",
        entityType: "COMMISSION",
        entityId: comm.id,
        description: `Commission of ₹${comm.commissionAmount} marked as PAID.`,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Commission payout marked as PAID successfully.",
      commission: comm,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update commission" }, { status: 500 })
  }
}
