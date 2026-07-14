import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export default async function licensesRouter(server: FastifyInstance) {
  
  // GET /api/v1/licenses/verify
  // This route is called by external client websites (e.g., atlas.grekam.in) to check their subscription status.
  server.get('/verify', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({ valid: false, status: 'SUSPENDED', message: 'Missing or invalid Authorization header.' });
      }

      const licenseKey = authHeader.split(' ')[1];

      // @ts-ignore
      const subscription = await server.prisma.clientSubscription.findUnique({
        where: { licenseKey }
      });

      if (!subscription) {
        return reply.code(404).send({ valid: false, status: 'SUSPENDED', message: 'License key not found.' });
      }

      const now = new Date();

      // Check if manually suspended or cancelled
      if (subscription.status === 'SUSPENDED' || subscription.status === 'CANCELLED') {
        return reply.send({ valid: false, status: subscription.status, message: 'Subscription is suspended or cancelled.' });
      }

      // Check expiry date
      if (subscription.expiryDate < now) {
        // Expired
        // If it's been less than 3 days since expiry, we might give a grace period (PAST_DUE)
        // But if it's already past due, we should suspend it.
        // Let's assume a strict 3-day grace period.
        const graceEnd = new Date(subscription.expiryDate);
        graceEnd.setDate(graceEnd.getDate() + 3);
        
        if (graceEnd < now) {
          // Grace period over -> block the site
          return reply.send({ valid: false, status: 'SUSPENDED', message: 'Subscription expired and grace period ended.' });
        } else {
          // Inside grace period -> allow the site, but status is PAST_DUE
          return reply.send({ valid: true, status: 'PAST_DUE', message: 'Subscription expired. Please update your payment method.' });
        }
      }

      // Active
      return reply.send({ valid: true, status: 'ACTIVE' });

    } catch (error) {
      server.log.error(error);
      // In case of a server error, we return 500. The client middleware should handle 500s by keeping the site active.
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });

}
