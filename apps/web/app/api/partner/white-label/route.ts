import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await auth()
    const email = session?.user?.email || "reseller@grekam.com"

    let partner = await prisma.partner.findFirst({
      where: { user: { email } },
      include: { whiteLabel: true },
    })

    if (!partner) {
      partner = await prisma.partner.findFirst({
        include: { whiteLabel: true },
      })
    }

    if (!partner) {
      return NextResponse.json({ error: "Partner account not found" }, { status: 404 })
    }

    let whiteLabel = partner.whiteLabel
    if (!whiteLabel) {
      whiteLabel = await prisma.partnerWhiteLabel.create({
        data: {
          partnerId: partner.id,
          brandName: partner.companyName || "My Garage Brand",
          customDomain: "crm.myagency.com",
          domainStatus: "PENDING",
        },
      })
    }

    return NextResponse.json({
      success: true,
      whiteLabel: {
        id: whiteLabel.id,
        brandName: whiteLabel.brandName,
        logoUrl: whiteLabel.logoUrl,
        customDomain: whiteLabel.customDomain,
        domainStatus: whiteLabel.domainStatus,
        whiteLabelEnabled: partner.whiteLabelEnabled,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch white-label settings" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth()
    const email = session?.user?.email || "reseller@grekam.com"

    let partner = await prisma.partner.findFirst({
      where: { user: { email } },
      include: { whiteLabel: true },
    })

    if (!partner) {
      partner = await prisma.partner.findFirst({
        include: { whiteLabel: true },
      })
    }

    if (!partner) {
      return NextResponse.json({ error: "Partner account not found" }, { status: 404 })
    }

    const body = await req.json()
    const { brandName, logoUrl, customDomain } = body

    let whiteLabel = partner.whiteLabel
    if (!whiteLabel) {
      whiteLabel = await prisma.partnerWhiteLabel.create({
        data: {
          partnerId: partner.id,
          brandName: brandName || "My Garage Brand",
          logoUrl: logoUrl || null,
          customDomain: customDomain || null,
          domainStatus: "PENDING",
        },
      })
    } else {
      whiteLabel = await prisma.partnerWhiteLabel.update({
        where: { id: whiteLabel.id },
        data: {
          brandName: brandName !== undefined ? brandName : whiteLabel.brandName,
          logoUrl: logoUrl !== undefined ? logoUrl : whiteLabel.logoUrl,
          customDomain: customDomain !== undefined ? customDomain : whiteLabel.customDomain,
        },
      })
    }

    await prisma.partnerActivityLog.create({
      data: {
        actorUserId: partner.userId,
        partnerId: partner.id,
        action: "WHITE_LABEL_UPDATED",
        entityType: "WHITE_LABEL",
        entityId: whiteLabel.id,
        description: `Updated white label settings (Brand: ${whiteLabel.brandName}, Domain: ${whiteLabel.customDomain || 'None'}).`,
      },
    })

    return NextResponse.json({
      success: true,
      whiteLabel,
      message: "White-label settings updated successfully.",
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update white-label settings" }, { status: 500 })
  }
}
