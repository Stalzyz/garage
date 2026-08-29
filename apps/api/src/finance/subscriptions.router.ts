import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export default async function subscriptionsRouter(app: FastifyInstance) {

  // GET /api/v1/finance/subscriptions
  app.get('/', async (req, reply) => {
    const subscriptions = await app.prisma.subscription.findMany({
      include: {
        company: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate metrics/KPIs dynamically
    const totalCount = subscriptions.length;
    const activeAndRisk = subscriptions.filter(s => s.status === 'active' || s.status === 'at_risk');
    const totalMrr = activeAndRisk.reduce((acc, curr) => acc + curr.mrr, 0);
    const activeSubscribers = activeAndRisk.length;
    
    const churnedCount = subscriptions.filter(s => s.status === 'churned').length;
    const churnRate = totalCount > 0 ? (churnedCount / totalCount) * 100 : 0.0;
    
    const atRiskCount = subscriptions.filter(s => s.status === 'at_risk').length;

    return {
      data: subscriptions,
      total: totalCount,
      metrics: {
        totalMrr,
        activeSubscribers,
        churnRate: parseFloat(churnRate.toFixed(1)),
        atRiskCount
      }
    };
  });

  // POST /api/v1/finance/subscriptions
  app.post('/', async (req, reply) => {
    const schema = z.object({
      companyId: z.string().min(1),
      productName: z.string().min(1),
      planName: z.string().min(1),
      mrr: z.number().positive(),
      status: z.enum(['active', 'paused', 'at_risk', 'churned']).default('active'),
      nextBilling: z.string().transform(str => new Date(str)).default(() => {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        return nextMonth;
      }),
      usage: z.string().optional().nullable()
    });

    const parsed = schema.parse(req.body);
    
    // Generate simple readable custom SUB-XXX ID
    const randomSuffix = Math.floor(100 + Math.random() * 900); // 100-999
    const id = `SUB-${randomSuffix}`;

    const newSub = await app.prisma.subscription.create({
      data: {
        id,
        ...parsed
      },
      include: {
        company: {
          select: {
            name: true
          }
        }
      }
    });

    // Notify primary contact
    const primaryContact = await app.prisma.contact.findFirst({
      where: { companyId: parsed.companyId, isPrimary: true }
    });

    if (primaryContact?.email) {
      const { sendEmail, EmailTemplates } = await import('../integrations/email.service');
      await sendEmail(
        primaryContact.email,
        EmailTemplates.subscriptionStarted(primaryContact.firstName || 'Client', parsed.planName)
      );
    }

    reply.code(201);
    return newSub;
  });

  // POST /api/v1/finance/subscriptions/:id/pause
  app.post('/:id/pause', async (req, reply) => {
    const { id } = req.params as { id: string };
    
    const sub = await app.prisma.subscription.findUnique({ where: { id } });
    if (!sub) return reply.notFound('Subscription not found');

    const updated = await app.prisma.subscription.update({
      where: { id },
      data: { status: 'paused' },
      include: {
        company: {
          select: {
            name: true
          }
        }
      }
    });

    return updated;
  });

  // POST /api/v1/finance/subscriptions/:id/resume
  app.post('/:id/resume', async (req, reply) => {
    const { id } = req.params as { id: string };

    const sub = await app.prisma.subscription.findUnique({ where: { id } });
    if (!sub) return reply.notFound('Subscription not found');

    const updated = await app.prisma.subscription.update({
      where: { id },
      data: { status: 'active' },
      include: {
        company: {
          select: {
            name: true
          }
        }
      }
    });

    return updated;
  });

  // PATCH /api/v1/finance/subscriptions/:id
  app.patch('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const schema = z.object({
      mrr: z.number().positive().optional(),
      status: z.enum(['active', 'paused', 'at_risk', 'churned']).optional(),
      usage: z.string().optional().nullable()
    });

    const parsed = schema.parse(req.body);
    const sub = await app.prisma.subscription.findUnique({ where: { id } });
    if (!sub) return reply.notFound('Subscription not found');

    const updated = await app.prisma.subscription.update({
      where: { id },
      data: parsed,
      include: {
        company: {
          select: { name: true }
        }
      }
    });

    return updated;
  });

  // DELETE /api/v1/finance/subscriptions/:id
  app.delete('/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const sub = await app.prisma.subscription.findUnique({ where: { id } });
    if (!sub) return reply.notFound('Subscription not found');

    await app.prisma.subscription.delete({ where: { id } });
    return { success: true, message: 'Subscription deleted successfully' };
  });
}
