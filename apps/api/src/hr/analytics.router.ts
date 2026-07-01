import { FastifyInstance } from 'fastify';

export default async function hrAnalyticsRoutes(app: FastifyInstance) {
  
  // GET /api/v1/hr/analytics/overview
  app.get('/overview', async (req, reply) => {
    
    // 1. Headcount & Diversity (Mocked for speed if department mapping is complex)
    const totalEmployees = await app.prisma.employee.count({
      
    });

    const totalDepartments = await app.prisma.department.count();

    // 2. Payroll Outflow (Summing up all payslips netSalary)
    const payrollAgg = await app.prisma.payslip.aggregate({
      _sum: { netSalary: true }
    });
    const totalPayrollOutflow = payrollAgg._sum.netSalary || 0;

    // 3. Performance / Goals Achieved vs Total
    const totalGoals = 0;
    const achievedGoals = 0;
    const goalCompletionRate = totalGoals > 0 ? Math.round((achievedGoals / totalGoals) * 100) : 0;

    // 4. Monthly Hiring Trend (Mocked 6 months data for Chart)
    const currentMonth = new Date().getMonth();
    const mockHiringTrend = Array.from({ length: 6 }).map((_, i) => {
      const m = new Date();
      m.setMonth(currentMonth - (5 - i));
      return {
        month: m.toLocaleString('default', { month: 'short' }),
        hires: Math.floor(Math.random() * 10) + 2,
        attrition: Math.floor(Math.random() * 3)
      };
    });

    return {
      overview: {
        totalEmployees,
        totalDepartments,
        totalPayrollOutflow,
        goalCompletionRate,
        turnoverRate: 4.2 // Mocked turnover percentage
      },
      trends: mockHiringTrend
    };
  });

}
