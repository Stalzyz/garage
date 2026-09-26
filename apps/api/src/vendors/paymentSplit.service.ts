/**
 * Payment Split & Escrow Settlement Engine
 * Supports Stripe Connect Transfers & Razorpay Route Split Disbursals
 */

export interface SplitTransactionRequest {
  transactionId: string;
  grossAmount: number;
  vendorId: string;
  vendorStripeAccountId?: string;
  vendorRazorpayAccountId?: string;
  commissionPercentage: number;
  flatFee: number;
}

export interface SplitTransactionResult {
  transactionId: string;
  grossAmount: number;
  platformFee: number;
  vendorNetEarnings: number;
  transferStatus: 'SUCCESS' | 'QUEUED_FOR_ESCROW' | 'FAILED';
  gatewayTransferId?: string;
  escrowReleaseDate: string;
}

export class PaymentSplitService {

  /**
   * Calculate exact platform take rate and net vendor earnings
   */
  public static calculateSplit(grossAmount: number, percentage: number, flatFee: number) {
    const platformFee = (grossAmount * (percentage / 100)) + flatFee;
    const vendorNetEarnings = grossAmount - platformFee;

    return {
      grossAmount,
      platformFee: Number(platformFee.toFixed(2)),
      vendorNetEarnings: Number(vendorNetEarnings.toFixed(2)),
    };
  }

  /**
   * Process Split Transfer via Gateway API (Stripe Connect / Razorpay Route)
   */
  public static async executePaymentSplit(req: SplitTransactionRequest): Promise<SplitTransactionResult> {
    const { grossAmount, commissionPercentage, flatFee } = req;
    const split = this.calculateSplit(grossAmount, commissionPercentage, flatFee);

    // Standard 7-day escrow holdback period
    const releaseDate = new Date();
    releaseDate.setDate(releaseDate.getDate() + 7);

    try {
      // Simulation of Stripe Connect Transfer API call
      // const transfer = await stripe.transfers.create({
      //   amount: Math.round(split.vendorNetEarnings * 100),
      //   currency: 'inr',
      //   destination: req.vendorStripeAccountId,
      //   transfer_group: req.transactionId,
      // });

      const mockGatewayTransferId = `tr_${Math.random().toString(36).substring(2, 10)}`;

      return {
        transactionId: req.transactionId,
        grossAmount: split.grossAmount,
        platformFee: split.platformFee,
        vendorNetEarnings: split.vendorNetEarnings,
        transferStatus: 'QUEUED_FOR_ESCROW',
        gatewayTransferId: mockGatewayTransferId,
        escrowReleaseDate: releaseDate.toISOString(),
      };
    } catch (error: any) {
      console.error('[PaymentSplitService] Transfer execution error:', error);
      return {
        transactionId: req.transactionId,
        grossAmount: split.grossAmount,
        platformFee: split.platformFee,
        vendorNetEarnings: split.vendorNetEarnings,
        transferStatus: 'FAILED',
        escrowReleaseDate: releaseDate.toISOString(),
      };
    }
  }
}
