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
    const { id: kycId } = await params

    const kyc = await prisma.partnerKYC.update({
      where: { id: kycId },
      data: {
        status: "APPROVED",
        reviewedAt: new Date(),
        reviewedBy: "SUPER_ADMIN",
      },
      include: { partner: true },
    })

    // Also update the partner overall KYC status and activate
    await prisma.partner.update({
      where: { id: kyc.partnerId },
      data: {
        kycStatus: "APPROVED",
        status: "ACTIVE",
        approvedAt: new Date(),
        approvedBy: "SUPER_ADMIN",
      },
    })

    await prisma.partnerActivityLog.create({
      data: {
        actorUserId: "SUPER_ADMIN",
        partnerId: kyc.partnerId,
        action: "KYC_APPROVED",
        entityType: "KYC",
        entityId: kyc.id,
        description: `Partner KYC document (${kyc.documentType}) approved by Super Admin.`,
      },
    })

    return NextResponse.json({
      success: true,
      message: "KYC document approved successfully. Partner is now active.",
      kyc,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to approve KYC" }, { status: 500 })
  }
}
