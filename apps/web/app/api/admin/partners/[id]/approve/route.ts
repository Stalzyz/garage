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

    const partner = await prisma.partner.update({
      where: { id: partnerId },
      data: {
        status: "ACTIVE",
        kycStatus: "APPROVED",
        approvedAt: new Date(),
        approvedBy: "SUPER_ADMIN",
      },
    })

    // Ensure wallet exists
    let wallet = await prisma.partnerWallet.findUnique({
      where: { partnerId: partner.id },
    })
    if (!wallet) {
      await prisma.partnerWallet.create({
        data: {
          partnerId: partner.id,
          balance: 0.0,
          status: "ACTIVE",
        },
      })
    }

    await prisma.partnerActivityLog.create({
      data: {
        actorUserId: "admin",
        partnerId: partner.id,
        action: "PARTNER_APPROVED",
        entityType: "PARTNER",
        entityId: partner.id,
        description: `Partner account approved by Super Admin.`,
      },
    })

    return NextResponse.json({
      success: true,
      partner,
      message: "Partner approved successfully. Partner dashboard access is now enabled.",
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to approve partner" }, { status: 500 })
  }
}
