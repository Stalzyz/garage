import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await auth()
    const email = session?.user?.email || "reseller@grekam.com"

    let partner = await prisma.partner.findFirst({
      where: { user: { email } },
      include: {
        user: true,
        kyc: true,
        wallet: true,
      },
    })

    if (!partner) {
      partner = await prisma.partner.findFirst({
        include: {
          user: true,
          kyc: true,
          wallet: true,
        },
      })
    }

    if (!partner) {
      return NextResponse.json({ error: "Partner account not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      partner: {
        id: partner.id,
        partnerCode: partner.partnerCode,
        partnerType: partner.partnerType,
        companyName: partner.companyName,
        contactEmail: partner.user?.email,
        contactPhone: partner.contactPhone,
        status: partner.status,
        kycStatus: partner.kycStatus,
        walletBalance: partner.wallet?.balance || 0,
        kyc: partner.kyc ? {
          businessName: partner.kyc.businessName,
          gstNumber: partner.kyc.gstNumber,
          panNumber: partner.kyc.panNumber,
          bankAccountNumber: partner.kyc.bankAccountNumber,
          bankIfsc: partner.kyc.bankIfsc,
          bankName: partner.kyc.bankName,
          status: partner.kyc.status,
        } : null,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
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

    const body = await req.json()
    const { companyName, contactPhone } = body

    const updated = await prisma.partner.update({
      where: { id: partner.id },
      data: {
        companyName: companyName || partner.companyName,
        contactPhone: contactPhone || partner.contactPhone,
      },
    })

    await prisma.partnerActivityLog.create({
      data: {
        actorUserId: partner.userId,
        partnerId: partner.id,
        action: "PROFILE_UPDATED",
        entityType: "PARTNER",
        entityId: partner.id,
        description: `Updated partner profile details.`,
      },
    })

    return NextResponse.json({
      success: true,
      partner: updated,
      message: "Partner settings saved successfully.",
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update settings" }, { status: 500 })
  }
}
