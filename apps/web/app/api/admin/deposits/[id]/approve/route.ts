import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/require-admin"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  try {
    const { id } = await params
    const adminEmail = guard.session!.user.email || "admin@grekam.com"

    const depositTx = await prisma.partnerWalletTransaction.findUnique({
      where: { id },
      include: {
        partner: {
          include: { wallet: true }
        }
      }
    })

    if (!depositTx) {
      return NextResponse.json({ error: "Deposit request not found" }, { status: 404 })
    }

    if (depositTx.status !== "PENDING") {
      return NextResponse.json({ 
        error: `Deposit request is already ${depositTx.status}. Cannot approve again.` 
      }, { status: 400 })
    }

    const rechargeAmount = depositTx.amount

    // Atomically approve and credit wallet
    const result = await prisma.$transaction(async (tx) => {
      let wallet = await tx.partnerWallet.findUnique({
        where: { partnerId: depositTx.partnerId }
      })

      if (!wallet) {
        wallet = await tx.partnerWallet.create({
          data: {
            partnerId: depositTx.partnerId,
            balance: 0.0,
            status: "ACTIVE",
          }
        })
      }

      const balanceBefore = wallet.balance
      const balanceAfter = Math.round((wallet.balance + rechargeAmount) * 100) / 100

      const updatedWallet = await tx.partnerWallet.update({
        where: { id: wallet.id },
        data: { balance: balanceAfter }
      })

      await tx.partner.update({
        where: { id: depositTx.partnerId },
        data: { walletBalance: balanceAfter }
      })

      const updatedTx = await tx.partnerWalletTransaction.update({
        where: { id: depositTx.id },
        data: {
          balanceBefore,
          balanceAfter,
          status: "COMPLETED",
          approvedBy: adminEmail,
          approvedAt: new Date(),
          description: `Offline Deposit Verified (₹${rechargeAmount.toLocaleString()}) via ${depositTx.paymentMode || "NEFT"} - UTR: ${depositTx.utrNumber}`,
        }
      })

      await tx.partnerActivityLog.create({
        data: {
          actorUserId: adminEmail,
          partnerId: depositTx.partnerId,
          action: "OFFLINE_DEPOSIT_APPROVED",
          entityType: "WALLET_TRANSACTION",
          entityId: depositTx.id,
          description: `Admin approved offline deposit of ₹${rechargeAmount.toLocaleString()} (UTR: ${depositTx.utrNumber}). New wallet balance: ₹${balanceAfter.toLocaleString()}.`,
        }
      })

      return {
        wallet: updatedWallet,
        transaction: updatedTx,
      }
    })

    return NextResponse.json({
      success: true,
      message: `Deposit of ₹${rechargeAmount.toLocaleString()} approved and credited to ${depositTx.partner?.companyName || "Partner"} successfully!`,
      wallet: result.wallet,
      transaction: result.transaction,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to approve deposit" }, { status: 500 })
  }
}
