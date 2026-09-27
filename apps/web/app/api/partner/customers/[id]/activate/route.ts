import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { activatePartnerCustomerAtomic } from "@/lib/partner-service"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params
    const session = await auth()
    const email = session?.user?.email || "reseller@grekam.com"

    let partner = await prisma.partner.findFirst({
      where: { user: { email } },
    })

    if (!partner) {
      partner = await prisma.partner.findFirst()
    }

    if (!partner) {
      return NextResponse.json({ error: "Partner account not found" }, { status: 404 })
    }

    const body = await req.json().catch(() => ({}))
    const { packageId, planId } = body

    // Run atomic activation transaction
    const result = await activatePartnerCustomerAtomic({
      partnerId: partner.id,
      organizationId: customerId,
      packageId,
      planId,
    })

    return NextResponse.json({
      success: true,
      message: `Customer "${result.organization.name}" successfully activated! Base cost ₹${result.basePriceDeducted} deducted from partner wallet.`,
      result,
    })
  } catch (error: any) {
    console.error("Customer activation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to activate customer" },
      { status: 400 }
    )
  }
}
