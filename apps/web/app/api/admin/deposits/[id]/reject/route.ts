import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await auth()
    const adminEmail = session?.user?.email || "admin@grekam.com"

    const body = await req.json().catch(() => ({}))
    const { reason = "Bank transfer could not be verified" } = body

    const depositTx = await prisma.partnerWalletTransaction.findUnique({
      where: { id },
      include: { partner: true }
    })

    if (!depositTx) {
      return NextResponse.json({ error: "Deposit request not found" }, { status: 404 })
    }

    if (depositTx.status !== "PENDING") {
      return NextResponse.json({ 
        error: `Deposit request is already ${depositTx.status}.` 
      }, { status: 400 })
    }

    const updatedTx = await prisma.partnerWalletTransaction.update({
      where: { id },
      data: {
        status: "REJECTED",
        notes: reason,
        approvedBy: adminEmail,
        approvedAt: new Date(),
        description: `Offline Deposit REJECTED: ${reason} (Ref: ${depositTx.utrNumber})`,
      }
    })

    await prisma.partnerActivityLog.create({
      data: {
        actorUserId: adminEmail,
        partnerId: depositTx.partnerId,
        action: "OFFLINE_DEPOSIT_REJECTED",
        entityType: "WALLET_TRANSACTION",
        entityId: depositTx.id,
        description: `Admin rejected offline deposit request of ₹${depositTx.amount} (UTR: ${depositTx.utrNumber}). Reason: ${reason}.`,
      }
    })

    return NextResponse.json({
      success: true,
      message: `Deposit request marked as REJECTED.`,
      transaction: updatedTx,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to reject deposit" }, { status: 500 })
  }
}
