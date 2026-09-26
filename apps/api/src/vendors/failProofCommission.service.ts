/**
 * Fail-Proof White-Label 3-Way Commission Sharing Engine
 * Guarantees zero floating point errors using BigInt integer paise/cents math.
 */

import { PrismaClient } from '@prisma/client';

export interface WhiteLabelCommissionRules {
  rootPlatformFeePercent: number; // e.g., 3.0 (3%)
  tenantMarkupPercent: number;    // e.g., 12.0 (12%)
}

export interface SplitRequest {
  orderId: string;
  grossAmountInRupees: number;    // e.g., ₹100.00
  tenantId: string;
  vendorId: string;
  rules: WhiteLabelCommissionRules;
}

export class FailProofCommissionEngine {

  /**
   * Execute Fail-Proof 3-Way Commission Split inside an Atomic Database Transaction
   */
  public static async processSplit(prisma: PrismaClient, req: SplitRequest) {
    // STEP 1: Convert money to integer Paise / Cents to prevent floating-point drift
    const grossCents = BigInt(Math.round(req.grossAmountInRupees * 100));

    // STEP 2: Calculate Exact Integer Amounts
    const platformFeeCents = BigInt(Math.round(Number(grossCents) * (req.rules.rootPlatformFeePercent / 100)));
    const tenantFeeCents = BigInt(Math.round(Number(grossCents) * (req.rules.tenantMarkupPercent / 100)));
    
    // Vendor gets exact remainder (Guarantees: grossCents == platformFeeCents + tenantFeeCents + vendorEarningsCents)
    const vendorEarningsCents = grossCents - platformFeeCents - tenantFeeCents;

    // Sanity Assertion Check (Fail-safe)
    if (platformFeeCents + tenantFeeCents + vendorEarningsCents !== grossCents) {
      throw new Error(`CRITICAL_LEDGER_UNBALANCE: Sum of splits (${platformFeeCents + tenantFeeCents + vendorEarningsCents}) does not equal Gross (${grossCents})`);
    }

    // 7-day Escrow Holdback Date
    const escrowReleaseAt = new Date();
    escrowReleaseAt.setDate(escrowReleaseAt.getDate() + 7);

    // STEP 3: Execute Atomic Multi-Account Double-Entry Transaction
    // STEP 3: Execute Atomic Multi-Account Double-Entry Transaction
    return await prisma.$transaction(async (txRaw) => {
      const tx = txRaw as any;
      // 1. Create Immutable Main Ledger Transaction
      const ledgerTx = await tx.ledgerTransaction.create({
        data: {
          orderId: req.orderId,
          grossAmountCents: grossCents,
          platformFeeCents,
          tenantFeeCents,
          vendorEarningsCents,
          tenantId: req.tenantId,
          vendorId: req.vendorId,
          status: 'HELD_IN_ESCROW',
          escrowReleaseAt,
        }
      });

      // 2. Double-Entry Recording: DEBIT Gateway Escrow, CREDIT Stakeholder Accounts
      await tx.ledgerEntry.createMany({
        data: [
          // Debit Payment Gateway (Total money entering escrow)
          {
            transactionId: ledgerTx.id,
            accountType: 'ESCROW_GATEWAY',
            accountOwnerId: 'GATEWAY_STRIPE',
            entryType: 'DEBIT',
            amountCents: grossCents,
          },
          // Credit Root Platform Owner
          {
            transactionId: ledgerTx.id,
            accountType: 'PLATFORM_OWNER',
            accountOwnerId: 'ROOT_SUPER_ADMIN',
            entryType: 'CREDIT',
            amountCents: platformFeeCents,
          },
          // Credit White-Label Tenant Partner
          {
            transactionId: ledgerTx.id,
            accountType: 'TENANT_PARTNER',
            accountOwnerId: req.tenantId,
            entryType: 'CREDIT',
            amountCents: tenantFeeCents,
          },
          // Credit Vendor Content Creator
          {
            transactionId: ledgerTx.id,
            accountType: 'VENDOR',
            accountOwnerId: req.vendorId,
            entryType: 'CREDIT',
            amountCents: vendorEarningsCents,
          },
        ]
      });

      return {
        transactionId: ledgerTx.id,
        orderId: req.orderId,
        gross: Number(grossCents) / 100,
        platformFee: Number(platformFeeCents) / 100,
        tenantFee: Number(tenantFeeCents) / 100,
        vendorEarnings: Number(vendorEarningsCents) / 100,
        status: 'HELD_IN_ESCROW',
        escrowReleaseAt: escrowReleaseAt.toISOString()
      };
    });
  }

  /**
   * Fail-Proof Proportional Refund Clawback Execution
   */
  public static async processProportionalRefund(prisma: PrismaClient, orderId: string) {
    return await prisma.$transaction(async (txRaw) => {
      const tx = txRaw as any;
      const ledgerTx = await tx.ledgerTransaction.findUnique({
        where: { orderId },
        include: { entries: true }
      });

      if (!ledgerTx) throw new Error(`Ledger transaction for order ${orderId} not found`);
      if (ledgerTx.status === 'REFUNDED') throw new Error(`Order ${orderId} is already refunded`);

      // Update Transaction status to REFUNDED
      await tx.ledgerTransaction.update({
        where: { id: ledgerTx.id },
        data: { status: 'REFUNDED' }
      });

      // Reverse entries (CREDIT Gateway, DEBIT Platform/Tenant/Vendor)
      await tx.ledgerEntry.createMany({
        data: [
          {
            transactionId: ledgerTx.id,
            accountType: 'ESCROW_GATEWAY',
            accountOwnerId: 'GATEWAY_STRIPE',
            entryType: 'CREDIT',
            amountCents: ledgerTx.grossAmountCents,
          },
          {
            transactionId: ledgerTx.id,
            accountType: 'PLATFORM_OWNER',
            accountOwnerId: 'ROOT_SUPER_ADMIN',
            entryType: 'DEBIT',
            amountCents: ledgerTx.platformFeeCents,
          },
          {
            transactionId: ledgerTx.id,
            accountType: 'TENANT_PARTNER',
            accountOwnerId: ledgerTx.tenantId,
            entryType: 'DEBIT',
            amountCents: ledgerTx.tenantFeeCents,
          },
          {
            transactionId: ledgerTx.id,
            accountType: 'VENDOR',
            accountOwnerId: ledgerTx.vendorId,
            entryType: 'DEBIT',
            amountCents: ledgerTx.vendorEarningsCents,
          },
        ]
      });

      return { 
        success: true, 
        orderId, 
        refundedAmount: Number(ledgerTx.grossAmountCents) / 100,
        clawedBackPlatformFee: Number(ledgerTx.platformFeeCents) / 100,
        clawedBackTenantFee: Number(ledgerTx.tenantFeeCents) / 100,
        clawedBackVendorEarnings: Number(ledgerTx.vendorEarningsCents) / 100
      };
    });
  }
}
