import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export default async function subscriptionsRouter(app: FastifyInstance) {

  // Seed function for mock subscriptions if empty
  async function seedSubscriptionsIfEmpty() {
    const count = await app.prisma.subscription.count();
    if (count > 0) return;

    // Check if we have companies
    let companies = await app.prisma.company.findMany();
    if (companies.length === 0) {
      companies = await Promise.all([
        app.prisma.company.create({ data: { name: 'Techflow SaaS', industry: 'Software', size: '10-50' } }),
        app.prisma.company.create({ data: { name: 'Fitburst Gym', industry: 'Fitness', size: '1-10' } }),
        app.prisma.company.create({ data: { name: 'RedBrick Realty', industry: 'Real Estate', size: '11-50' } }),
        app.prisma.company.create({ data: { name: 'Apex Consulting', industry: 'Consulting', size: '51-200' } }),
        app.prisma.company.create({ data: { name: 'Zephyr Labs', industry: 'Healthcare', size: '10-50' } }),
      ]);
    }

    const techflow = companies.find(c => c.name === 'Techflow SaaS') || companies[0];
    const fitburst = companies.find(c => c.name === 'Fitburst Gym') || companies[0];
    const redbrick = companies.find(c => c.name === 'RedBrick Realty') || companies[0];
    const apex = companies.find(c => c.name === 'Apex Consulting') || companies[0];
    const zephyr = companies.find(c => c.name === 'Zephyr Labs') || companies[0];

    const today = new Date();
    
    const mockSubscriptions = [
      {
        id: 'SUB-001',
        companyId: techflow.id,
        productName: 'Grafty Pro',
        planName: 'Agency',
        mrr: 12999.0,
        status: 'active',
        nextBilling: new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000), // 20 days later
        usage: '4/unlimited workspaces'
      },
      {
        id: 'SUB-002',
        companyId: techflow.id,
        productName: 'Send Grafty',
        planName: 'Scale',
        mrr: 4999.0,
        status: 'active',
        nextBilling: new Date(today.getTime() + 20 * 24 * 60 * 60 * 1000),
        usage: '142k/200k emails'
      },
      {
        id: 'SUB-003',
        companyId: fitburst.id,
        productName: 'WaaS',
        planName: 'Starter Site',
        mrr: 7999.0,
        status: 'active',
        nextBilling: new Date(today.getTime() + 17 * 24 * 60 * 60 * 1000),
        usage: 'Included'
      },
      {
        id: 'SUB-004',
        companyId: redbrick.id,
        productName: 'Send Grafty',
        planName: 'Growth',
        mrr: 1999.0,
        status: 'paused',
        nextBilling: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000),
        usage: '0/50k emails'
      },
      {
        id: 'SUB-005',
        companyId: apex.id,
        productName: 'Brand Retainer',
        planName: 'Standard',
        mrr: 27999.0,
        status: 'at_risk',
        nextBilling: new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000),
        usage: '18/20 hours'
      },
      {
        id: 'SUB-006',
        companyId: zephyr.id,
        productName: 'Grafty Pro',
        planName: 'Pro',
        mrr: 4999.0,
        status: 'churned',
        nextBilling: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000),
        usage: 'Inactive'
      }
    ];

    for (const sub of mockSubscriptions) {
      await app.prisma.subscription.create({ data: sub });
    }
  }

  // GET /api/v1/finance/subscriptions
  app.get('/', async (req, reply) => {
    await seedSubscriptionsIfEmpty();

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
}
