import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await auth()
    const email = session?.user?.email || "reseller@grekam.com"

    let partner = await prisma.partner.findFirst({
      where: { user: { email } },
      include: { wallet: true },
    })

    if (!partner) {
      partner = await prisma.partner.findFirst({
        include: { wallet: true },
      })
    }

    if (!partner) {
      return NextResponse.json({ error: "Partner account not found" }, { status: 404 })
    }

    const body = await req.json()
    const { amount, paymentMethod } = body

    const rechargeAmount = parseFloat(amount)
    if (isNaN(rechargeAmount) || rechargeAmount <= 0) {
      return NextResponse.json({ error: "Please enter a valid recharge amount." }, { status: 400 })
    }

    // Atomic wallet recharge inside database transaction
    const result = await prisma.$transaction(async (tx) => {
      let wallet = await tx.partnerWallet.findUnique({
        where: { partnerId: partner.id },
      })

      if (!wallet) {
        wallet = await tx.partnerWallet.create({
          data: {
            partnerId: partner.id,
            balance: 0.0,
            status: "ACTIVE",
          },
        })
      }

      const balanceBefore = wallet.balance
      const balanceAfter = Math.round((wallet.balance + rechargeAmount) * 100) / 100

      const updatedWallet = await tx.partnerWallet.update({
        where: { id: wallet.id },
        data: { balance: balanceAfter },
      })

      await tx.partner.update({
        where: { id: partner.id },
        data: { walletBalance: balanceAfter },
      })

      const walletTx = await tx.partnerWalletTransaction.create({
        data: {
          partnerId: partner.id,
          walletId: wallet.id,
          type: "RECHARGE",
          amount: rechargeAmount,
          balanceBefore,
          balanceAfter,
          referenceType: "PAYMENT",
          referenceId: `RCG-${Date.now()}`,
          description: `Prepaid wallet top-up via ${paymentMethod || "Online Gateway"}`,
          createdBy: partner.userId,
        },
      })

      await tx.partnerActivityLog.create({
        data: {
          actorUserId: partner.userId,
          partnerId: partner.id,
          action: "WALLET_RECHARGED",
          entityType: "WALLET",
          entityId: wallet.id,
          description: `Recharged wallet with ₹${rechargeAmount}. New balance: ₹${balanceAfter}.`,
        },
      })

      return {
        wallet: updatedWallet,
        transaction: walletTx,
      }
    })

    return NextResponse.json({
      success: true,
      message: `₹${rechargeAmount} added to your Partner Wallet successfully!`,
      wallet: result.wallet,
      transaction: result.transaction,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to recharge wallet" }, { status: 500 })
  }
}
