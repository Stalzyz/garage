import Razorpay from 'razorpay';
import crypto from 'crypto';

export class PaymentsService {
  private razorpay: Razorpay;
  
  // PhonePe Constants
  private phonePeHost = 'https://api.phonepe.com/apis/hermes';
  private phonePeMerchantId = process.env.PHONEPE_MERCHANT_ID || 'MOCK_MERCHANT';
  private phonePeSaltKey = process.env.PHONEPE_SALT_KEY || 'mock-salt-key';
  private phonePeSaltIndex = process.env.PHONEPE_SALT_INDEX || '1';

  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret',
    });
  }

  // --- Razorpay Methods ---

  async createRazorpayOrder(amount: number, currency = 'INR', receiptId: string) {
    try {
      const options = {
        amount: amount * 100, // amount in smallest currency unit
        currency,
        receipt: receiptId,
      };
      const order = await this.razorpay.orders.create(options);
      return { success: true, order };
    } catch (err: any) {
      console.error('[Razorpay] Order creation failed', err);
      return { success: false, error: err.message };
    }
  }

  verifyRazorpayWebhook(payload: string, signature: string, secret: string) {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    return expectedSignature === signature;
  }

  // --- PhonePe Methods ---

  async createPhonePePaymentLink(amount: number, transactionId: string, redirectUrl: string, userId: string, mobileNumber: string) {
    try {
      const payload = {
        merchantId: this.phonePeMerchantId,
        merchantTransactionId: transactionId,
        merchantUserId: userId,
        amount: amount * 100,
        redirectUrl,
        redirectMode: 'REDIRECT',
        callbackUrl: `${process.env.APP_BASE_URL}/api/v1/payments/phonepe/webhook`,
        mobileNumber,
        paymentInstrument: {
          type: 'PAY_PAGE'
        }
      };

      const payloadString = JSON.stringify(payload);
      const base64Payload = Buffer.from(payloadString).toString('base64');
      
      const endpoint = '/pg/v1/pay';
      const stringToSign = base64Payload + endpoint + this.phonePeSaltKey;
      const sha256 = crypto.createHash('sha256').update(stringToSign).digest('hex');
      const checksum = `${sha256}###${this.phonePeSaltIndex}`;

      const response = await fetch(`${this.phonePeHost}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
        },
        body: JSON.stringify({ request: base64Payload })
      });

      const data = await response.json();
      return { success: response.ok, data };
    } catch (err: any) {
      console.error('[PhonePe] Payment link creation failed', err);
      return { success: false, error: err.message };
    }
  }

  verifyPhonePeWebhook(base64Payload: string, signature: string) {
    const stringToSign = base64Payload + this.phonePeSaltKey;
    const sha256 = crypto.createHash('sha256').update(stringToSign).digest('hex');
    const expectedSignature = `${sha256}###${this.phonePeSaltIndex}`;
    
    return expectedSignature === signature;
  }
}

export const paymentsService = new PaymentsService();
