import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/require-admin"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  try {
    const { id } = await params
    const partner = await prisma.partner.findUnique({
      where: { id },
      include: {
        user: true,
        wallet: true,
        whiteLabel: true,
        kyc: true,
      }
    })

    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, partner })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch partner details" }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  try {
    const { id } = await params
    const body = await req.json()
    const { 
      partnerType, 
      status, 
      commissionPercent, 
      whiteLabelEnabled, 
      companyName,
      maxPriceMultiplier,
      customDomain,
      brandName,
      ownerFirstName,
      ownerLastName,
      ownerEmail,
      ownerPhone
    } = body

    const partner = await prisma.partner.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 })
    }

    // Update Partner record
    const updatedPartner = await prisma.partner.update({
      where: { id },
      data: {
        ...(partnerType && { partnerType }),
        ...(status && { status }),
        ...(commissionPercent !== undefined && { commissionPercent: parseFloat(commissionPercent) }),
        ...(whiteLabelEnabled !== undefined && { whiteLabelEnabled: Boolean(whiteLabelEnabled) }),
        ...(companyName && { companyName }),
        ...(maxPriceMultiplier !== undefined && { maxPriceMultiplier: parseFloat(maxPriceMultiplier) }),
      }
    })

    // Upsert White-Label domain config if provided
    if (brandName || customDomain) {
      await prisma.partnerWhiteLabel.upsert({
        where: { partnerId: id },
        create: {
          partnerId: id,
          brandName: brandName || companyName || "Partner Agency",
          customDomain: customDomain || null,
          domainStatus: customDomain ? "VERIFIED" : "NONE",
        },
        update: {
          ...(brandName && { brandName }),
          ...(customDomain !== undefined && { customDomain: customDomain || null, domainStatus: customDomain ? "VERIFIED" : "NONE" }),
        }
      })
    }

    // Update partner owner user if provided
    if (partner.userId && (ownerEmail || ownerFirstName || ownerLastName || ownerPhone)) {
      await prisma.user.update({
        where: { id: partner.userId },
        data: {
          ...(ownerEmail && { email: ownerEmail }),
          ...(ownerFirstName && { firstName: ownerFirstName }),
          ...(ownerLastName && { lastName: ownerLastName }),
          ...(ownerPhone && { phone: ownerPhone }),
        }
      }).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      partner: updatedPartner,
      message: `Partner settings for "${companyName || partner.companyName}" updated successfully!`
    })
  } catch (error: any) {
    console.error("Partner update error:", error)
    return NextResponse.json({ error: error.message || "Failed to update partner settings" }, { status: 500 })
  }
}
