import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    // 1. Seed demo Super Admin user if not existing
    let admin = await prisma.user.findUnique({
      where: { email: "admin@grekam.com" },
    })

    if (!admin) {
      admin = await prisma.user.create({
        data: {
          email: "admin@grekam.com",
          passwordHash: "$2a$10$e8wE4y6...dummyHashForDemo123",
          firstName: "Grekam",
          lastName: "Super Admin",
          role: "SUPER_ADMIN",
          status: "ACTIVE",
        },
      })
    }

    // 2. Seed demo Partner user if not existing
    let partnerUser = await prisma.user.findUnique({
      where: { email: "reseller@grekam.com" },
    })

    if (!partnerUser) {
      partnerUser = await prisma.user.create({
        data: {
          email: "reseller@grekam.com",
          passwordHash: "$2a$10$e8wE4y6...dummyHashForDemo123",
          firstName: "Arun",
          lastName: "Kumar",
          phone: "+91 98765 43210",
          role: "PARTNER",
          status: "ACTIVE",
        },
      })
    }

    // 3. Seed demo Partner record
    let partner = await prisma.partner.findUnique({
      where: { userId: partnerUser.id },
    })

    if (!partner) {
      partner = await prisma.partner.create({
        data: {
          userId: partnerUser.id,
          partnerCode: "PRT-8821",
          partnerType: "WHITE_LABEL",
          individualOrCompany: "COMPANY",
          companyName: "Apex Auto Solutions",
          status: "ACTIVE",
          kycStatus: "APPROVED",
          commissionPercent: 20.0,
          whiteLabelEnabled: true,
          maxPriceMultiplier: 2.0,
          walletBalance: 50000.0,
          approvedAt: new Date(),
          approvedBy: "SUPER_ADMIN",
        },
      })
    }

    // 4. Seed Partner Wallet
    let wallet = await prisma.partnerWallet.findUnique({
      where: { partnerId: partner.id },
    })

    if (!wallet) {
      wallet = await prisma.partnerWallet.create({
        data: {
          partnerId: partner.id,
          balance: 50000.0,
          status: "ACTIVE",
        },
      })

      // Create initial recharge transaction record
      await prisma.partnerWalletTransaction.create({
        data: {
          partnerId: partner.id,
          walletId: wallet.id,
          type: "RECHARGE",
          amount: 50000.0,
          balanceBefore: 0.0,
          balanceAfter: 50000.0,
          referenceType: "PAYMENT",
          referenceId: "RCG-DEMO-INITIAL",
          description: "Initial demo partner wallet pre-funding",
          createdBy: partnerUser.id,
        },
      })
    }

    // 5. Seed Partner White Label Branding
    const existingWL = await prisma.partnerWhiteLabel.findUnique({
      where: { partnerId: partner.id },
    })

    if (!existingWL) {
      await prisma.partnerWhiteLabel.create({
        data: {
          partnerId: partner.id,
          brandName: "Apex Auto Solutions",
          customDomain: "app.apexautosolutions.com",
          domainStatus: "CONNECTED",
        },
      })
    }

    // 6. Seed Partner Packages
    const pkgCount = await prisma.partnerPackage.count({
      where: { partnerId: partner.id },
    })

    if (pkgCount === 0) {
      await prisma.partnerPackage.createMany({
        data: [
          {
            partnerId: partner.id,
            planId: "plan-starter",
            name: "Starter Garage",
            description: "Essential tools for boutique garage workshops & solo mechanics",
            sellingPrice: 15000.0,
            billingCycle: "YEARLY",
            status: "ACTIVE",
          },
          {
            partnerId: partner.id,
            planId: "plan-pro",
            name: "Pro Garage",
            description: "Full suite of Job Cards, GST Invoices, WhatsApp follow-ups & CRM",
            sellingPrice: 18000.0,
            billingCycle: "YEARLY",
            status: "ACTIVE",
          },
        ],
      })
    }

    // 7. Seed Sample Customers for Partner
    const orgCount = await prisma.organization.count({
      where: { partnerId: partner.id },
    })

    if (orgCount === 0) {
      const org1 = await prisma.organization.create({
        data: {
          name: "ABC Garage",
          ownerName: "Arun Kumar",
          ownerEmail: "arun@abcgarage.com",
          ownerPhone: "+91 98400 12345",
          domain: "abc.apexautosolutions.com",
          status: "ACTIVE",
          subscription: "ACTIVE",
          customerType: "WHITE_LABEL",
          partnerId: partner.id,
          basePriceSnapshot: 10000.0,
          sellingPriceSnapshot: 18000.0,
          partnerMarginSnapshot: 8000.0,
        },
      })

      const org2 = await prisma.organization.create({
        data: {
          name: "Kumar Auto Care",
          ownerName: "Rajesh Kumar",
          ownerEmail: "rajesh@kumarauto.in",
          ownerPhone: "+91 97890 54321",
          domain: "kumar.apexautosolutions.com",
          status: "ACTIVE",
          subscription: "ACTIVE",
          customerType: "WHITE_LABEL",
          partnerId: partner.id,
          basePriceSnapshot: 10000.0,
          sellingPriceSnapshot: 15000.0,
          partnerMarginSnapshot: 5000.0,
        },
      })

      const org3 = await prisma.organization.create({
        data: {
          name: "Sri Motors",
          ownerName: "Senthil Nathan",
          ownerEmail: "senthil@srimotors.com",
          ownerPhone: "+91 94440 67890",
          status: "PENDING_ACTIVATION",
          subscription: "PENDING",
          customerType: "WHITE_LABEL",
          partnerId: partner.id,
        },
      })

      // Sample Invoices
      await prisma.partnerInvoice.create({
        data: {
          partnerId: partner.id,
          organizationId: org1.id,
          invoiceNumber: `INV-${partner.partnerCode}-0001`,
          customerName: "ABC Garage",
          packageName: "Pro Garage",
          basePriceSnapshot: 10000.0,
          sellingPrice: 18000.0,
          partnerMargin: 8000.0,
          total: 18000.0,
          status: "PAID",
          paidAt: new Date(),
        },
      })

      await prisma.partnerInvoice.create({
        data: {
          partnerId: partner.id,
          organizationId: org2.id,
          invoiceNumber: `INV-${partner.partnerCode}-0002`,
          customerName: "Kumar Auto Care",
          packageName: "Starter Garage",
          basePriceSnapshot: 10000.0,
          sellingPrice: 15000.0,
          partnerMargin: 5000.0,
          total: 15000.0,
          status: "PAID",
          paidAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Database successfully seeded with demo Super Admin, Reseller/White-Label Partner, Wallet, Packages & Sample Garages!",
      usersCreated: ["admin@grekam.com", "reseller@grekam.com"],
      partnerCode: partner.partnerCode,
      walletBalance: 50000.0,
    })
  } catch (error) {
    console.error("Demo seeding error:", error)
    return NextResponse.json(
      { error: "Failed to seed demo database", details: (error as Error).message },
      { status: 500 }
    )
  }
}
