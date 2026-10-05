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
    const role = guard.session!.user.role

    if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Admin access required." }, { status: 403 })
    }

    const { id: partnerId } = await params
    const body = await req.json().catch(() => ({}))
    const { enabled, partnerType } = body

    const newPartnerType = partnerType || (enabled ? "WHITE_LABEL" : "RESELLER")
    const isWhitelabel = enabled !== undefined ? !!enabled : newPartnerType === "WHITE_LABEL"

    const partner = await prisma.partner.update({
      where: { id: partnerId },
      data: {
        partnerType: newPartnerType,
        whiteLabelEnabled: isWhitelabel,
      },
      include: {
        whiteLabel: true,
        // brandName falls back to the owner's first name, which lives on User.
        user: { select: { firstName: true, lastName: true } },
      }
    })

    // Upsert whiteLabel record if enabled
    if (isWhitelabel) {
      await prisma.partnerWhiteLabel.upsert({
        where: { partnerId: partner.id },
        create: {
          partnerId: partner.id,
          // `firstName` lives on User, not Partner — this threw a TypeError at
          // runtime whenever companyName was empty.
          brandName: partner.companyName || `${partner.user?.firstName ?? "Partner"}'s Garage Platform`,
          domainStatus: "PENDING",
        },
        update: {
          brandName: partner.companyName || undefined,
        }
      })
    }

    await prisma.partnerActivityLog.create({
      data: {
        actorUserId: guard.session!.user.id || "admin",
        partnerId: partner.id,
        action: isWhitelabel ? "WHITELABEL_ENABLED" : "WHITELABEL_DISABLED",
        entityType: "PARTNER",
        entityId: partner.id,
        description: `White-label partner module ${isWhitelabel ? "enabled" : "disabled"} by Super Admin.`,
      },
    })

    return NextResponse.json({
      success: true,
      partner,
      message: `Partner "${partner.companyName}" white-label module ${isWhitelabel ? "enabled" : "disabled"}.`,
    })
  } catch (error: any) {
    console.error("White-label partner toggle error:", error)
    return NextResponse.json({ error: error.message || "Failed to update white-label status" }, { status: 500 })
  }
}
