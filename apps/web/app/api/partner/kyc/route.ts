import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const session = await auth()
    const email = session?.user?.email || "reseller@grekam.com"

    let partner = await prisma.partner.findFirst({
      where: { user: { email } },
      include: { kyc: true },
    })

    if (!partner) {
      partner = await prisma.partner.findFirst({
        include: { kyc: true },
      })
    }

    if (!partner) {
      return NextResponse.json({ error: "Partner account not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      kycStatus: partner.kycStatus,
      documents: partner.kyc,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch KYC" }, { status: 500 })
  }
}

export async function POST(req: Request) {
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
    const { documentType, documentNumber, fileUrl } = body

    if (!documentType) {
      return NextResponse.json({ error: "Document type is required." }, { status: 400 })
    }

    const kycDoc = await prisma.partnerKYC.create({
      data: {
        partnerId: partner.id,
        documentType,
        documentNumber: documentNumber || null,
        fileUrl: fileUrl || null,
        status: "PENDING",
      },
    })

    // Update partner KYC status to UNDER_REVIEW
    await prisma.partner.update({
      where: { id: partner.id },
      data: { kycStatus: "UNDER_REVIEW" },
    })

    await prisma.partnerActivityLog.create({
      data: {
        actorUserId: partner.userId,
        partnerId: partner.id,
        action: "KYC_SUBMITTED",
        entityType: "KYC",
        entityId: kycDoc.id,
        description: `Submitted ${documentType} for partner KYC review.`,
      },
    })

    return NextResponse.json({
      success: true,
      document: kycDoc,
      message: "KYC document submitted successfully. Grekam Super Admin will review your application.",
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to submit KYC" }, { status: 500 })
  }
}
