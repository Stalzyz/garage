import { FastifyInstance } from 'fastify';

export default async function analyticsRouter(app: FastifyInstance) {
  // GET /api/v1/analytics/overview — Executive dashboard summary
  app.get('/overview', async (req, reply) => {
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
    ] = await Promise.all([
      app.prisma.invoice.count(),
      app.prisma.invoice.aggregate({ where: { status: 'PAID' }, _sum: { totalAmount: true } }),
      app.prisma.invoice.aggregate({ where: { status: 'OVERDUE' }, _sum: { totalAmount: true } }),
      app.prisma.project.count({ where: { status: { notIn: ['CLOSED', 'ON_HOLD'] } } }),
      app.prisma.lead.count(),
      app.prisma.student.count(),
      app.prisma.batch.count({ where: { isActive: true } }),
      app.prisma.payslip.aggregate({ _sum: { netSalary: true } }),
      app.prisma.ticket.count({ where: { status: 'OPEN' } }),
    ]);

    return {
      agency: {
        revenueCollected: paidInvoices._sum.totalAmount ?? 0,
        revenueOverdue: overdueInvoices._sum.totalAmount ?? 0,
        activeProjects,
        totalLeads,
        totalInvoices,
        totalPayroll: payrollTotal._sum.netSalary ?? 0,
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
    const { months = '6' } = req.query as { months?: string };
    const numMonths = parseInt(months, 10);
    const since = new Date();
    since.setMonth(since.getMonth() - numMonths);

    const invoices = await app.prisma.invoice.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, paidAmount: true, status: true },
    });

    const payslips = await app.prisma.payslip.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true, netSalary: true },
    });

    const chartDataMap: Record<string, { month: string, revenue: number, expenses: number }> = {};

    // Initialize last N months
    for (let i = numMonths - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthLabel = d.toLocaleString('default', { month: 'short' });
      const yearMonth = `${d.getFullYear()}-${d.getMonth()}`;
      chartDataMap[yearMonth] = { month: monthLabel, revenue: 0, expenses: 0 };
    }

    invoices.forEach(inv => {
      if (inv.status === 'PAID' && inv.paidAmount) {
        const d = new Date(inv.createdAt);
        const yearMonth = `${d.getFullYear()}-${d.getMonth()}`;
        if (chartDataMap[yearMonth]) {
          chartDataMap[yearMonth].revenue += inv.paidAmount;
        }
      }
    });

    payslips.forEach(pay => {
      if (pay.netSalary) {
        const d = new Date(pay.createdAt);
        const yearMonth = `${d.getFullYear()}-${d.getMonth()}`;
        if (chartDataMap[yearMonth]) {
          chartDataMap[yearMonth].expenses += pay.netSalary;
        }
      }
    });

    return { data: Object.values(chartDataMap) };
  });

  // GET /api/v1/analytics/projects — Project health metrics
  app.get('/projects', async (req, reply) => {
    const statusGroups = await app.prisma.project.groupBy({
      by: ['status'],
      _count: true,
    });
    return { data: statusGroups };
  });

  // GET /api/v1/analytics/leads — Lead funnel metrics
  app.get('/leads', async (req, reply) => {
    const stageGroups = await app.prisma.lead.groupBy({
      by: ['status'],
      _count: true,
    });
    return { data: stageGroups };
  });
}
