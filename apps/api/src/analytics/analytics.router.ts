import { FastifyInstance } from 'fastify';

export default async function analyticsRouter(app: FastifyInstance) {
  // GET /api/v1/analytics/overview — Executive dashboard summary
  app.get('/overview', async (req, reply) => {
    const db = (req as any).db || app.prisma;
    const [
      totalInvoices,
      paidInvoices,
      overdueInvoices,
      activeProjects,
      totalLeads,
      totalStudents,
      activeBatches,
      payrollTotal,
      openTickets,
      totalEmployees,
      activeProposals,
      totalContacts,
    ] = await Promise.all([
      db.invoice.count(),
      db.invoice.aggregate({ where: { status: 'PAID' }, _sum: { totalAmount: true } }),
      db.invoice.aggregate({ where: { status: 'OVERDUE' }, _sum: { totalAmount: true } }),
      db.project.count({ where: { status: { notIn: ['CLOSED', 'ON_HOLD'] } } }),
      db.lead.count(),
      db.student.count(),
      db.batch.count({ where: { isActive: true } }),
      db.payslip.aggregate({ _sum: { netSalary: true } }),
      db.ticket.count({ where: { status: 'OPEN' } }),
      db.employee.count(),
      db.proposal.count({ where: { status: { in: ['DRAFT', 'SENT', 'VIEWED'] } } }),
      db.contact.count(),
    ]);

    // Add Cache-Control for stale-while-revalidate — data is ok to be ~30s stale
    reply.header('Cache-Control', 'private, max-age=30, stale-while-revalidate=60');
    return {
      agency: {
        revenueCollected: paidInvoices._sum.totalAmount ?? 0,
        revenueOverdue: overdueInvoices._sum.totalAmount ?? 0,
        activeProjects,
        totalLeads,
        totalInvoices,
        totalPayroll: payrollTotal._sum.netSalary ?? 0,
        totalEmployees,
        activeProposals,
      },
      crm: {
        totalContacts,
      },
      academy: {
        totalStudents,
        activeBatches,
      },
      support: {
        openTickets,
      }
    };
  });

  // GET /api/v1/analytics/revenue — Monthly revenue breakdown
  app.get('/revenue', async (req, reply) => {
    const db = (req as any).db || app.prisma;
    const { months = '6' } = req.query as { months?: string };
    const numMonths = parseInt(months, 10);
    const since = new Date();
    since.setMonth(since.getMonth() - numMonths);

    const invoices = await db.invoice.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, paidAmount: true, status: true },
    });

    const payslips = await db.payslip.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, netSalary: true },
    });

    const chartDataMap: Record<string, { month: string, revenue: number, expenses: number }> = {};

    // Initialize last N months
    for (let i = numMonths - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(1); // Set to 1st of month to prevent day-overflow bugs (e.g. Feb 31st overflow)
      d.setMonth(d.getMonth() - i);
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      const yearMonth = `${d.getFullYear()}-${d.getMonth()}`;
      chartDataMap[yearMonth] = { month: monthLabel, revenue: 0, expenses: 0 };
    }

    invoices.forEach((inv: any) => {
      if (inv.status === 'PAID' && inv.paidAmount) {
        const d = new Date(inv.createdAt);
        const yearMonth = `${d.getFullYear()}-${d.getMonth()}`;
        if (chartDataMap[yearMonth]) {
          chartDataMap[yearMonth].revenue += inv.paidAmount;
        }
      }
    });

    payslips.forEach((pay: any) => {
      if (pay.netSalary) {
        const d = new Date(pay.createdAt);
        const yearMonth = `${d.getFullYear()}-${d.getMonth()}`;
        if (chartDataMap[yearMonth]) {
          chartDataMap[yearMonth].expenses += pay.netSalary;
        }
      }
    });

    reply.header('Cache-Control', 'private, max-age=60, stale-while-revalidate=120');
    return { data: Object.values(chartDataMap) };
  });

  // GET /api/v1/analytics/projects — Project health metrics
  app.get('/projects', async (req, reply) => {
    const db = (req as any).db || app.prisma;
    const statusGroups = await db.project.groupBy({
      by: ['status'],
      _count: true,
    });
    return { data: statusGroups };
  });

  // GET /api/v1/analytics/leads — Lead funnel metrics
  app.get('/leads', async (req, reply) => {
    const db = (req as any).db || app.prisma;
    const stageGroups = await db.lead.groupBy({
      by: ['status'],
      _count: true,
    });
    return { data: stageGroups };
  });
}
