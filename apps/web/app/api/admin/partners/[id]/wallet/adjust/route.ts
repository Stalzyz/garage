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
    const { id: partnerId } = await params
    const body = await req.json()
    const { amount, type, reason } = body

    if (!amount || isNaN(parseFloat(amount))) {
      return NextResponse.json({ error: "Valid adjustment amount is required." }, { status: 400 })
    }

    if (!reason || reason.trim().length < 5) {
      return NextResponse.json(
        { error: "A clear adjustment reason (min 5 characters) is mandatory for financial audit compliance." },
        { status: 400 }
      )
    }

    const adjustVal = parseFloat(amount)
    const isCredit = type === "CREDIT" || adjustVal > 0
    const delta = isCredit ? Math.abs(adjustVal) : -Math.abs(adjustVal)

    const result = await prisma.$transaction(async (tx) => {
      const partner = await tx.partner.findUnique({
        where: { id: partnerId },
        include: { wallet: true },
      })

      if (!partner) {
        throw new Error("Partner not found.")
      }

      let wallet = partner.wallet
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
      const balanceAfter = Math.round((wallet.balance + delta) * 100) / 100

      if (balanceAfter < 0) {
        throw new Error(`Adjustment would result in negative wallet balance (₹${balanceAfter}). Negative balance is strictly prohibited.`)
      }

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
          type: "ADJUSTMENT",
          amount: delta,
          balanceBefore,
          balanceAfter,
          referenceType: "ADMIN_ADJUSTMENT",
          description: `Super Admin Adjustment: ${reason.trim()}`,
          createdBy: "SUPER_ADMIN",
        },
      })

      await tx.partnerActivityLog.create({
        data: {
          actorUserId: "SUPER_ADMIN",
          partnerId: partner.id,
          action: "WALLET_ADJUSTED",
          entityType: "WALLET",
          entityId: wallet.id,
          description: `Adjusted wallet by ${delta > 0 ? '+' : ''}₹${delta}. Reason: ${reason.trim()}. New Balance: ₹${balanceAfter}`,
        },
      })

      return { wallet: updatedWallet, transaction: walletTx }
    })

    return NextResponse.json({
      success: true,
      message: `Partner wallet adjusted successfully. New balance: ₹${result.wallet.balance}`,
      wallet: result.wallet,
      transaction: result.transaction,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to adjust wallet balance" }, { status: 400 })
  }
}
