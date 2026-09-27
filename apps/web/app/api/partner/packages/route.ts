import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { validateSellingPrice } from "@/lib/partner-service"

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

    const packages = await prisma.partnerPackage.findMany({
      where: { partnerId: partner.id },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      packages,
      basePricing: {
        starter: 10000,
        growth: 25000,
        pro: 45000,
        maxMultiplier: partner.maxPriceMultiplier || 2.0,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch packages" }, { status: 500 })
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
    const { name, description, planId, sellingPrice, billingCycle } = body

    if (!name || !sellingPrice) {
      return NextResponse.json({ error: "Package name and selling price are required." }, { status: 400 })
    }

    // Determine Base Price based on Plan
    let basePrice = 10000.0
    if (planId === "plan-growth") basePrice = 25000.0
    if (planId === "plan-pro") basePrice = 45000.0

    // Check custom partner plan access
    const planAccess = await prisma.partnerPlanAccess.findUnique({
      where: {
        partnerId_planId: {
          partnerId: partner.id,
          planId: planId || "plan-starter",
        },
      },
    })

    if (planAccess) {
      basePrice = planAccess.basePrice
    }

    // SERVER-SIDE PRICE CEILING VALIDATION (Strict 200% maximum)
    const priceValidation = validateSellingPrice(basePrice, parseFloat(sellingPrice), partner.maxPriceMultiplier || 2.0)
    if (!priceValidation.valid) {
      return NextResponse.json({ error: priceValidation.error }, { status: 400 })
    }

    const newPackage = await prisma.partnerPackage.create({
      data: {
        partnerId: partner.id,
        planId: planId || "plan-starter",
        name,
        description: description || null,
        sellingPrice: parseFloat(sellingPrice),
        billingCycle: billingCycle || "YEARLY",
        status: "ACTIVE",
      },
    })

    await prisma.partnerActivityLog.create({
      data: {
        actorUserId: partner.userId,
        partnerId: partner.id,
        action: "PACKAGE_CREATED",
        entityType: "PACKAGE",
        entityId: newPackage.id,
        description: `Created package "${name}" at ₹${sellingPrice} (Base Cost: ₹${basePrice}).`,
      },
    })

    return NextResponse.json({
      success: true,
      package: newPackage,
      message: `Package "${name}" created successfully with selling price ₹${sellingPrice}.`,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create package" }, { status: 500 })
  }
}
