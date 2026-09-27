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

    const invoices = await prisma.partnerInvoice.findMany({
      where: { partnerId: partner.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      invoices,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch invoices" }, { status: 500 })
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
    const { organizationId, customerName, packageName, sellingPrice, tax, dueDate } = body

    if (!organizationId || !sellingPrice) {
      return NextResponse.json({ error: "Customer and price are required." }, { status: 400 })
    }

    const price = parseFloat(sellingPrice)
    const taxAmount = parseFloat(tax || 0)
    const total = price + taxAmount

    const basePrice = 10000.0
    const margin = Math.max(0, price - basePrice)

    const count = await prisma.partnerInvoice.count({ where: { partnerId: partner.id } })
    const invoiceNumber = `INV-${partner.partnerCode}-${String(count + 1).padStart(4, "0")}`

    const newInvoice = await prisma.partnerInvoice.create({
      data: {
        partnerId: partner.id,
        organizationId,
        invoiceNumber,
        customerName: customerName || "Customer Garage",
        packageName: packageName || "Custom Garage Package",
        basePriceSnapshot: basePrice,
        sellingPrice: price,
        partnerMargin: margin,
        tax: taxAmount,
        total,
        status: "SENT",
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    })

    await prisma.partnerActivityLog.create({
      data: {
        actorUserId: partner.userId,
        partnerId: partner.id,
        organizationId,
        action: "INVOICE_CREATED",
        entityType: "INVOICE",
        entityId: newInvoice.id,
        description: `Created customer invoice #${invoiceNumber} for ₹${total}.`,
      },
    })

    return NextResponse.json({
      success: true,
      invoice: newInvoice,
      message: `Invoice #${invoiceNumber} created successfully.`,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create invoice" }, { status: 500 })
  }
}
