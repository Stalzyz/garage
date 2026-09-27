import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: kycId } = await params
    const body = await req.json().catch(() => ({}))
    const { reason } = body

    const kyc = await prisma.partnerKYC.update({
      where: { id: kycId },
      data: {
        status: "REJECTED",
        rejectionReason: reason || "Document verification failed. Please re-submit valid business documents.",
        reviewedAt: new Date(),
        reviewedBy: "SUPER_ADMIN",
      },
    })

    await prisma.partner.update({
      where: { id: kyc.partnerId },
      data: {
        kycStatus: "REJECTED",
      },
    })

    await prisma.partnerActivityLog.create({
      data: {
        actorUserId: "SUPER_ADMIN",
        partnerId: kyc.partnerId,
        action: "KYC_REJECTED",
        entityType: "KYC",
        entityId: kyc.id,
        description: `Partner KYC document (${kyc.documentType}) rejected. Reason: ${reason || 'Invalid document'}.`,
      },
    })

    return NextResponse.json({
      success: true,
      message: "KYC document marked as rejected.",
      kyc,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to reject KYC" }, { status: 500 })
  }
}
