import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { paymentsService } from './payments.service';

export default async function paymentsRouter(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // --- Razorpay Routes ---

  server.post('/razorpay/order', {
    preHandler: app.requireAuth,
    schema: {
      body: z.object({
        amount: z.number(),
        currency: z.string().default('INR'),
        receiptId: z.string()
      })
    }
  }, async (req, reply) => {
    const { amount, currency, receiptId } = req.body;
    const result = await paymentsService.createRazorpayOrder(amount, currency, receiptId);
    
    if (!result.success) {
      return reply.code(400).send({ error: 'Failed to create Razorpay order', details: result.error });
    }
    return reply.send({ order: result.order });
  });

  server.post('/razorpay/webhook', async (req, reply) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'mock_secret';
    const signature = req.headers['x-razorpay-signature'] as string;
    
    // Fastify request.raw is the raw Node.js request. Fastify body might already be parsed.
    // For verifying we ideally need raw body. Using JSON.stringify for simplicity if not raw.
    const payload = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    const isValid = paymentsService.verifyRazorpayWebhook(payload, signature, secret);

    if (!isValid) {
      return reply.code(400).send({ error: 'Invalid signature' });
    }

    // Process event (e.g., payment.captured)
    const event = (req.body as any).event;
    server.log.info(`[Razorpay Webhook] Received event: ${event}`);

    // Here you would update the invoice or order status in DB
    // e.g. await server.prisma.invoice.update(...)

    return reply.send({ status: 'ok' });
  });

  // --- PhonePe Routes ---

  server.post('/phonepe/link', {
    preHandler: app.requireAuth,
    schema: {
      body: z.object({
        amount: z.number(),
        transactionId: z.string(),
        redirectUrl: z.string(),
        mobileNumber: z.string()
      })
    }
  }, async (req, reply) => {
    const { amount, transactionId, redirectUrl, mobileNumber } = req.body;
    const userId = req.user?.id || 'anonymous';
    
    const result = await paymentsService.createPhonePePaymentLink(amount, transactionId, redirectUrl, userId, mobileNumber);

    if (!result.success) {
      return reply.code(400).send({ error: 'Failed to create PhonePe payment link', details: result.error });
    }
    return reply.send({ data: result.data });
  });

  server.post('/phonepe/webhook', async (req, reply) => {
    const signature = req.headers['x-verify'] as string;
    const base64Payload = (req.body as any).response;

    const isValid = paymentsService.verifyPhonePeWebhook(base64Payload, signature);

    if (!isValid) {
      return reply.code(400).send({ error: 'Invalid signature' });
    }

    const decodedPayload = JSON.parse(Buffer.from(base64Payload, 'base64').toString('utf8'));
    server.log.info(`[PhonePe Webhook] Received status: ${decodedPayload.code}`);

    // Process event (e.g., PAYMENT_SUCCESS)
    // Here you would update the DB

    return reply.send({ status: 'ok' });
  });
}
