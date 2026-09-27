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

    const tickets = await prisma.ticket.findMany({
      where: { userId: partner.userId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      partner: {
        id: partner.id,
        partnerCode: partner.partnerCode,
        companyName: partner.companyName,
      },
      tickets,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch support tickets" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    const email = session?.user?.email || "reseller@grekam.com"

    let partner = await prisma.partner.findFirst({
      where: { user: { email } },
      include: { user: true },
    })

    if (!partner) {
      partner = await prisma.partner.findFirst({ include: { user: true } })
    }

    if (!partner) {
      return NextResponse.json({ error: "Partner account not found" }, { status: 404 })
    }

    const body = await req.json()
    const { subject, description, priority = "MEDIUM", category = "PARTNER_SUPPORT" } = body

    if (!subject || !description) {
      return NextResponse.json({ error: "Subject and description are required" }, { status: 400 })
    }

    // Get an organization ID fallback
    const org = await prisma.organization.findFirst()
    const orgId = org?.id || "default_org"

    const ticket = await prisma.ticket.create({
      data: {
        organizationId: orgId,
        userId: partner.userId,
        subject: `[Partner ${partner.partnerCode}] ${subject}`,
        description,
        status: "OPEN",
        priority,
        category,
        messages: {
          create: {
            senderId: partner.userId,
            senderRole: "PARTNER",
            message: description,
          },
        },
      },
      include: {
        messages: true,
      },
    })

    await prisma.partnerActivityLog.create({
      data: {
        actorUserId: partner.userId,
        partnerId: partner.id,
        action: "SUPPORT_TICKET_CREATED",
        entityType: "TICKET",
        entityId: ticket.id,
        description: `Created support ticket #${ticket.id.slice(-6)}: "${subject}".`,
      },
    })

    return NextResponse.json({
      success: true,
      ticket,
      message: "Ticket submitted to Grekam Partner Support Desk.",
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to submit ticket" }, { status: 500 })
  }
}
