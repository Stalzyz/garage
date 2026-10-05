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

    // No unfiltered fallback: `partner.findFirst()` with no `where` returned an
    // arbitrary partner row when the caller's own lookup missed, which is a
    // cross-tenant read. 404 instead.
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
        // Phone is a User column; Partner has no contactPhone.
        contactPhone: partner.user?.phone ?? null,
        status: partner.status,
        kycStatus: partner.kycStatus,
        walletBalance: partner.wallet?.balance || 0,
        // KYC is one-to-many, so surface the most recent submission rather than
        // reading properties off an array (which silently produced all-undefined).
        kyc: partner.kyc[0] ? {
          id: partner.kyc[0].id,
          documentType: partner.kyc[0].documentType,
          documentNumber: partner.kyc[0].documentNumber,
          fileUrl: partner.kyc[0].fileUrl,
          status: partner.kyc[0].status,
          submittedAt: partner.kyc[0].submittedAt,
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

    const partner = await prisma.partner.findFirst({
      where: { user: { email } },
    })

    // Never fall back to an unfiltered lookup — that wrote changes onto whatever
    // partner row happened to be first in the table.
    if (!partner) {
      return NextResponse.json({ error: "Partner account not found" }, { status: 404 })
    }

    const body = await req.json()
    const { companyName, contactPhone } = body

    const updated = await prisma.partner.update({
      where: { id: partner.id },
      data: {
        companyName: companyName || partner.companyName,
      },
    })

    // contactPhone is a User column. Writing it to Partner silently threw a
    // Prisma validation error, so phone updates never persisted.
    if (contactPhone) {
      await prisma.user.update({
        where: { id: partner.userId },
        data: { phone: contactPhone },
      })
    }

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
