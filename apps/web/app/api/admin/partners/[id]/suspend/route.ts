import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: partnerId } = await params
    const body = await req.json().catch(() => ({}))
    const { reason } = body

    const partner = await prisma.partner.update({
      where: { id: partnerId },
      data: {
        status: "SUSPENDED",
      },
    })

    await prisma.partnerActivityLog.create({
      data: {
        actorUserId: "admin",
        partnerId: partner.id,
        action: "PARTNER_SUSPENDED",
        entityType: "PARTNER",
        entityId: partner.id,
        description: `Partner account suspended by Super Admin. Reason: ${reason || "Policy compliance review"}`,
      },
    })

    return NextResponse.json({
      success: true,
      partner,
      message: "Partner account suspended. Access to partner portal is disabled.",
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to suspend partner" }, { status: 500 })
  }
}
