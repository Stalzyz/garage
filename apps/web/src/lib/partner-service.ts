import { prisma } from "@/lib/prisma"

export interface PriceValidationResult {
  valid: boolean
  error?: string
  basePrice: number
  maxMultiplier: number
  maxPrice: number
}

/**
 * Validates that selling price is >= Grekam Base Price and <= (Grekam Base Price * Max Multiplier).
 * Default Max Multiplier is 2.0 (200% ceiling).
 */
export function validateSellingPrice(
  basePrice: number,
  sellingPrice: number,
  maxMultiplier: number = 2.0
): PriceValidationResult {
  const maxPrice = Math.round(basePrice * maxMultiplier * 100) / 100

  if (isNaN(sellingPrice) || sellingPrice <= 0) {
    return {
      valid: false,
      error: "Selling price must be a valid positive amount.",
      basePrice,
      maxMultiplier,
      maxPrice,
    }
  }

  if (sellingPrice < basePrice) {
    return {
      valid: false,
      error: `Selling price (₹${sellingPrice}) cannot be lower than Grekam Base Price (₹${basePrice}).`,
      basePrice,
      maxMultiplier,
      maxPrice,
    }
  }

  if (sellingPrice > maxPrice) {
    return {
      valid: false,
      error: `Selling price (₹${sellingPrice}) exceeds the 200% maximum allowed price ceiling (₹${maxPrice}).`,
      basePrice,
      maxMultiplier,
      maxPrice,
    }
  }

  return {
    valid: true,
    basePrice,
    maxMultiplier,
    maxPrice,
  }
}

/**
 * Atomic customer activation with Partner Prepaid Wallet deduction.
 * Ensures zero activation without payment and zero negative wallet balance.
 */
export async function activatePartnerCustomerAtomic(params: {
  partnerId: string
  organizationId: string
  packageId?: string
  planId?: string
  adminOverrideUserId?: string
}) {
  const { partnerId, organizationId, packageId, planId } = params

  return await prisma.$transaction(async (tx) => {
    // 1. Fetch Partner & Wallet
    const partner = await tx.partner.findUnique({
      where: { id: partnerId },
      include: {
        wallet: true,
        whiteLabel: true,
      },
    })

    if (!partner) {
      throw new Error("Partner account not found.")
    }

    if (partner.status !== "ACTIVE") {
      throw new Error(`Partner is not active (Status: ${partner.status}). Cannot activate customers.`)
    }

    if (partner.kycStatus !== "APPROVED") {
      throw new Error("Partner KYC is not approved. Cannot activate customers.")
    }

    let wallet = partner.wallet
    if (!wallet) {
      wallet = await tx.partnerWallet.create({
        data: {
          partnerId: partner.id,
          balance: 0.0,
          status: "ACTIVE",
        },
      })
    }

    if (wallet.status !== "ACTIVE") {
      throw new Error("Partner wallet is frozen. Please contact Grekam Support.")
    }

    // 2. Fetch Customer Organization
    const organization = await tx.organization.findUnique({
      where: { id: organizationId },
    })

    if (!organization) {
      throw new Error("Customer garage organization not found.")
    }

    if (organization.partnerId !== partner.id) {
      throw new Error("Unauthorized: This customer does not belong to your partner account.")
    }

    // 3. Resolve Base Cost & Selling Price
    let basePrice = 10000.0
    let sellingPrice = 18000.0
    let packageName = "Pro Garage Package"
    let resolvedPlanId = planId || "plan-pro"

    if (packageId) {
      const pkg = await tx.partnerPackage.findUnique({
        where: { id: packageId },
      })
      if (pkg && pkg.partnerId === partner.id) {
        sellingPrice = pkg.sellingPrice
        packageName = pkg.name
        resolvedPlanId = pkg.planId
      }
    }

    // Check Partner Plan Access overrides for Base Price
    const planAccess = await tx.partnerPlanAccess.findUnique({
      where: {
        partnerId_planId: {
          partnerId: partner.id,
          planId: resolvedPlanId,
        },
      },
    })

    if (planAccess) {
      basePrice = planAccess.basePrice
    }

    const margin = Math.max(0, sellingPrice - basePrice)

    // 4. Check Wallet Balance vs Grekam Base Price
    if (wallet.balance < basePrice) {
      throw new Error(
        `Insufficient partner wallet balance. Required: ₹${basePrice}, Available: ₹${wallet.balance}. Please recharge your partner wallet to activate this customer.`
      )
    }

    // 5. Deduct Wallet Balance
    const balanceBefore = wallet.balance
    const balanceAfter = Math.round((wallet.balance - basePrice) * 100) / 100

    await tx.partnerWallet.update({
      where: { id: wallet.id },
      data: {
        balance: balanceAfter,
      },
    })

    // Also update cached balance on partner
    await tx.partner.update({
      where: { id: partner.id },
      data: {
        walletBalance: balanceAfter,
      },
    })

    // 6. Record Wallet Transaction
    const walletTx = await tx.partnerWalletTransaction.create({
      data: {
        partnerId: partner.id,
        walletId: wallet.id,
        type: "ACTIVATION",
        amount: -basePrice,
        balanceBefore,
        balanceAfter,
        referenceType: "CUSTOMER",
        referenceId: organization.id,
        description: `Activation of ${organization.name} (${packageName}) - Grekam Base Cost deduction`,
        createdBy: params.adminOverrideUserId || partner.userId,
      },
    })

    // 7. Generate Partner Customer Invoice
    const invoiceCount = await tx.partnerInvoice.count({
      where: { partnerId: partner.id },
    })
    const invoiceNumber = `INV-${partner.partnerCode}-${String(invoiceCount + 1).padStart(4, "0")}`

    const invoice = await tx.partnerInvoice.create({
      data: {
        partnerId: partner.id,
        organizationId: organization.id,
        invoiceNumber,
        customerName: organization.name,
        packageName,
        basePriceSnapshot: basePrice,
        sellingPrice,
        partnerMargin: margin,
        tax: 0.0,
        total: sellingPrice,
        status: "PAID",
        paidAt: new Date(),
      },
    })

    // 8. Activate Organization
    const now = new Date()
    const oneYearLater = new Date()
    oneYearLater.setFullYear(now.getFullYear() + 1)

    const updatedOrg = await tx.organization.update({
      where: { id: organization.id },
      data: {
        status: "ACTIVE",
        subscription: "ACTIVE",
        customerType: partner.partnerType === "WHITE_LABEL" ? "WHITE_LABEL" : "RESELLER",
        basePriceSnapshot: basePrice,
        sellingPriceSnapshot: sellingPrice,
        partnerMarginSnapshot: margin,
      },
    })

    // 9. Record Activity Log
    await tx.partnerActivityLog.create({
      data: {
        actorUserId: params.adminOverrideUserId || partner.userId,
        partnerId: partner.id,
        organizationId: organization.id,
        action: "CUSTOMER_ACTIVATED",
        entityType: "ORGANIZATION",
        entityId: organization.id,
        description: `Activated customer ${organization.name}. Base price ₹${basePrice} deducted from wallet. Invoice #${invoiceNumber} issued.`,
      },
    })

    return {
      success: true,
      organization: updatedOrg,
      invoice,
      walletTx,
      walletBalanceAfter: balanceAfter,
      basePriceDeducted: basePrice,
      margin,
    }
  })
}
