import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")

    const whereClause: any = {
      partnerId: partner.id,
    }

    if (status && status !== "ALL") {
      whereClause.status = status
    }

    const customers = await prisma.organization.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      customers,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch customers" }, { status: 500 })
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

    if (partner.status !== "ACTIVE") {
      return NextResponse.json({ error: "Your partner account is not active. Cannot create customers." }, { status: 403 })
    }

    const body = await req.json()
    const { garageName, ownerName, email: customerEmail, phone, plan, domain, packageId } = body

    if (!garageName || !ownerName || !customerEmail) {
      return NextResponse.json({ error: "Garage name, owner name, and email are required." }, { status: 400 })
    }

    // Server-enforced ownership: NEVER trust partnerId from client body!
    const newCustomer = await prisma.organization.create({
      data: {
        name: garageName,
        ownerName,
        ownerEmail: customerEmail,
        ownerPhone: phone,
        domain: domain || null,
        status: "PENDING_ACTIVATION", // Creation does NOT equal activation!
        subscription: "PENDING",
        partnerId: partner.id,
        customerType: partner.partnerType === "WHITE_LABEL" ? "WHITE_LABEL" : "RESELLER",
      },
    })

    // Log Activity
    await prisma.partnerActivityLog.create({
      data: {
        actorUserId: partner.userId,
        partnerId: partner.id,
        organizationId: newCustomer.id,
        action: "CUSTOMER_CREATED",
        entityType: "ORGANIZATION",
        entityId: newCustomer.id,
        description: `Created customer garage "${garageName}" in PENDING_ACTIVATION status. Awaiting payment/wallet verification.`,
      },
    })

    return NextResponse.json({
      success: true,
      customer: newCustomer,
      message: "Customer created successfully in PENDING_ACTIVATION status. Activate using your Partner Wallet.",
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create customer" }, { status: 500 })
  }
}
