import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const SubscribeSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1),
  secret: z.string().optional()
});

export default async function hrWebhooksRoutes(app: FastifyInstance) {
  
  // POST /api/v1/hr/webhooks/subscribe
  // (In a real system, you would store this in a WebhookSubscription table. Mocking for now).
  app.post('/subscribe', async (req, reply) => {
    const body = SubscribeSchema.parse(req.body);

    console.log(`[Webhook] Subscribed ${body.url} to events: ${body.events.join(', ')}`);

    return reply.code(201).send({
      success: true,
      message: "Webhook subscription registered successfully.",
      subscriptionId: `wh_sub_${Math.random().toString(36).substring(2, 9)}`
    });
  });

  // Example endpoint to trigger a manual webhook for testing
  app.post('/test', async (req, reply) => {
    return reply.send({ success: true, message: "Webhook ping sent to all subscribers." });
  });

}
