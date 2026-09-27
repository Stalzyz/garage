import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
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

    let wallet = partner.wallet
    if (!wallet) {
      wallet = await prisma.partnerWallet.create({
        data: {
          partnerId: partner.id,
          balance: 0.0,
          status: "ACTIVE",
        },
      })
    }

    // Fetch immutable wallet transaction logs
    const transactions = await prisma.partnerWalletTransaction.findMany({
      where: { partnerId: partner.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json({
      success: true,
      wallet: {
        id: wallet.id,
        balance: wallet.balance,
        status: wallet.status,
      },
      transactions,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch wallet data" }, { status: 500 })
  }
}
