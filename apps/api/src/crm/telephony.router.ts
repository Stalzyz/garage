import { FastifyInstance } from 'fastify';

interface DialMobileBody {
  leadPhone: string;
  email: string;
}

export default async function telephonyRouter(app: FastifyInstance) {
  app.post<{ Body: DialMobileBody }>('/dial-mobile', async (req, reply) => {
    const { leadPhone, email } = req.body;

    if (!leadPhone || !email) {
      return reply.status(400).send({ error: 'leadPhone and email are required' });
    }

    // Broadcast trigger via WebSockets
    (app as any).broadcast('MOBILE_DIAL_TRIGGER', { email, leadPhone });

    return { success: true };
  });
}
