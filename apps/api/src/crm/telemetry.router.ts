import { FastifyInstance } from 'fastify';

export default async function telemetryRouter(app: FastifyInstance) {
  app.get('/telemetry', async (req, reply) => {
    // Phase 1: CRM Pipeline Aggregation
    const [
      totalContacts,
      proposals,
      lastMonthContacts
    ] = await Promise.all([
      app.prisma.contact.count(),
      app.prisma.proposal.findMany({
        select: { status: true, totalAmount: true }
      }),
      // Simple mock logic for last month vs this month
      // In production, you'd filter by createdAt
      app.prisma.contact.count()
    ]);

    let pipelineValue = 0;
    let approvedCount = 0;
    let totalProposals = proposals.length;

    proposals.forEach(p => {
      pipelineValue += p.totalAmount || 0;
      if (p.status === 'APPROVED') {
        approvedCount++;
      }
    });

    const winRate = totalProposals > 0 ? Math.round((approvedCount / totalProposals) * 100) : 0;
    
    // Simulate some recent priority signals
    const prioritySignals = [
      { id: 1, title: 'TechFlow Inc. Proposal', action: 'Follow Up', time: '2h ago', detail: 'Review the revised scope document before the final call.' },
      { id: 2, title: 'NovaSpace Contract', action: 'Sign Pending', time: '5h ago', detail: 'Awaiting client signature on MSA.' },
    ];

    return {
      contacts: {
        total: totalContacts,
        growth: 12 // Hardcoded mock growth percentage
      },
      pipeline: {
        value: pipelineValue,
        growth: 8
      },
      winRate: {
        percentage: winRate,
        status: "Strong Conversion"
      },
      signals: prioritySignals
    };
  });
}
