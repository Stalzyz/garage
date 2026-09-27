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
    const { amount, paymentMode = "NEFT", utrNumber, notes } = body

    const rechargeAmount = parseFloat(amount)
    if (isNaN(rechargeAmount) || rechargeAmount <= 0) {
      return NextResponse.json({ error: "Please enter a valid recharge amount." }, { status: 400 })
    }

    if (!utrNumber || !utrNumber.trim()) {
      return NextResponse.json({ error: "Bank UTR / Transaction Reference Number is mandatory for offline verification." }, { status: 400 })
    }

    const cleanUtr = utrNumber.trim().toUpperCase()

    // Check if UTR already submitted
    const existingTx = await prisma.partnerWalletTransaction.findFirst({
      where: {
        utrNumber: cleanUtr,
        status: { in: ["PENDING", "COMPLETED"] }
      }
    })

    if (existingTx) {
      return NextResponse.json({ 
        error: `Transaction Reference / UTR "${cleanUtr}" has already been submitted or credited.` 
      }, { status: 400 })
    }

    // Ensure wallet exists
    let wallet = await prisma.partnerWallet.findUnique({
      where: { partnerId: partner.id },
    })

    if (!wallet) {
      wallet = await prisma.partnerWallet.create({
        data: {
          partnerId: partner.id,
          balance: 0.0,
          status: "ACTIVE",
        },
      })
    }

    // Create pending offline recharge transaction
    const walletTx = await prisma.partnerWalletTransaction.create({
      data: {
        partnerId: partner.id,
        walletId: wallet.id,
        type: "RECHARGE",
        amount: rechargeAmount,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance,
        referenceType: "OFFLINE_DEPOSIT",
        referenceId: cleanUtr,
        paymentMode: paymentMode.toUpperCase(),
        utrNumber: cleanUtr,
        status: "PENDING",
        notes: notes || null,
        description: `Offline Deposit (₹${rechargeAmount.toLocaleString()}) via ${paymentMode.toUpperCase()} - Ref: ${cleanUtr}`,
        createdBy: partner.userId,
      },
    })

    await prisma.partnerActivityLog.create({
      data: {
        actorUserId: partner.userId,
        partnerId: partner.id,
        action: "OFFLINE_DEPOSIT_SUBMITTED",
        entityType: "WALLET_TRANSACTION",
        entityId: walletTx.id,
        description: `Submitted offline deposit of ₹${rechargeAmount} via ${paymentMode.toUpperCase()} (UTR: ${cleanUtr}). Awaiting Grekam Admin approval.`,
      },
    })

    return NextResponse.json({
      success: true,
      message: `Offline deposit request of ₹${rechargeAmount.toLocaleString()} submitted with UTR ${cleanUtr}. Grekam Admin will verify bank credit and approve shortly.`,
      transaction: walletTx,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to submit deposit request" }, { status: 500 })
  }
}
