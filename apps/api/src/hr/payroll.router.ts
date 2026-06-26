import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

const RunPayrollSchema = z.object({
  month: z.number(),
  year: z.number(),
  employeeIds: z.array(z.string()).optional()
});

export default async function payrollRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // Fetch or create default config
  const getConfig = async () => {
    let config = await server.prisma.payrollConfig.findFirst();
    if (!config) {
      config = await server.prisma.payrollConfig.create({ data: {} });
    }
    return config;
  };

  const calculatePayslip = (baseSalary: number, config: any, lwpDeduction: number = 0) => {
    const basic = baseSalary * (config.basicPct / 100);
    const hra = baseSalary * (config.hraPct / 100);
    const special = baseSalary * (config.specialPct / 100);
    
    const pf = Math.min(basic * (config.pfPct / 100), config.pfMaxLimit);
    const pt = config.ptAmount; 
    const tds = baseSalary > config.tdsLimit ? baseSalary * (config.tdsPct / 100) : 0;
    
    const otherDeductions = pt + lwpDeduction;
    const totalDeductions = pf + otherDeductions + tds;
    const netPay = Math.max(0, baseSalary - totalDeductions);

    return {
      gross: baseSalary,
      basic,
      hra,
      special,
      deductions: { pf, pt, tds, other: otherDeductions, total: totalDeductions },
      net: netPay
    };
  };

  server.get('/config', async (req, reply) => {
    const config = await getConfig();
    return { config };
  });

  server.put('/config', {
    schema: {
      body: z.object({
        basicPct: z.number().optional(),
        hraPct: z.number().optional(),
        specialPct: z.number().optional(),
        pfPct: z.number().optional(),
        pfMaxLimit: z.number().optional(),
        ptAmount: z.number().optional(),
        tdsLimit: z.number().optional(),
        tdsPct: z.number().optional()
      })
    }
  }, async (req, reply) => {
    const current = await getConfig();
    const config = await server.prisma.payrollConfig.update({
      where: { id: current.id },
      data: req.body
    });
    return { config };
  });

  server.get('/', async (req, reply) => {
    const aggregated = await server.prisma.payslip.groupBy({
      by: ['month', 'year'],
      _sum: { netSalary: true },
      _count: { employeeId: true },
      orderBy: [ { year: 'desc' }, { month: 'desc' } ]
    });

    const payrollRuns = aggregated.map(run => {
      const date = new Date(run.year, run.month - 1);
      const monthStr = date.toLocaleString('default', { month: 'short' });
      return {
        id: `${run.year}-${run.month}`,
        month: `${monthStr} ${run.year}`,
        processedOn: new Date(run.year, run.month, 0).toLocaleDateString(),
        totalEmployees: run._count.employeeId,
        totalAmount: run._sum.netSalary || 0,
        status: "PROCESSED"
      }
    });

    return { data: payrollRuns };
  });

  server.get('/payslip/:id', {
    schema: { params: z.object({ id: z.string() }) }
  }, async (req, reply) => {
    const payslip = await server.prisma.payslip.findUnique({
      where: { id: req.params.id },
      include: { employee: { include: { user: true, department: true } } }
    });
    if (!payslip) return reply.status(404).send({ error: "Not found" });

    const config = await getConfig();
    const ptAmount = config.ptAmount;
    const lwpDeduction = Math.max(0, payslip.otherDeductions - ptAmount);

    return { 
      payslip: {
        ...payslip,
        ptDeduction: ptAmount,
        lwpDeduction
      }
    };
  });

  server.get('/run/:year/:month', {
    schema: {
      params: z.object({
        year: z.coerce.number(),
        month: z.coerce.number()
      })
    }
  }, async (req, reply) => {
    const { year, month } = req.params;
    const payslips = await server.prisma.payslip.findMany({
      where: { month, year },
      include: { employee: { include: { user: true, department: true } } }
    });

    const config = await getConfig();
    const ptAmount = config.ptAmount;

    const enrichedPayslips = payslips.map(p => {
      const lwpDeduction = Math.max(0, p.otherDeductions - ptAmount);
      return {
        ...p,
        ptDeduction: ptAmount,
        lwpDeduction
      };
    });

    return { payslips: enrichedPayslips };
  });

  server.get('/estimate', async (req, reply) => {
    const config = await getConfig();
    const employees = await server.prisma.employee.findMany({
      where: { salary: { not: null } },
      select: { salary: true }
    });

    let totalAmount = 0;
    employees.forEach(emp => {
      if (emp.salary) {
        totalAmount += calculatePayslip(emp.salary, config).net;
      }
    });

    return {
      totalEmployees: employees.length,
      estimatedOutflow: totalAmount
    };
  });

  server.post('/run', async (req, reply) => {
    const { month, year, employeeIds } = RunPayrollSchema.parse(req.body);
    const config = await getConfig();
    
    const employees = await server.prisma.employee.findMany({
      where: employeeIds ? { id: { in: employeeIds }, salary: { not: null } } : { salary: { not: null } }
    });

    let totalAmount = 0;
    const totalDaysInMonth = new Date(year, month, 0).getDate();
    
    for (const emp of employees) {
      if (!emp.salary) continue;

      // Scan approved unpaid leave requests overlapping this month
      const unpaidLeaves = await server.prisma.leaveRequest.findMany({
        where: {
          employeeId: emp.id,
          type: 'UNPAID',
          status: 'APPROVED',
          OR: [
            {
              startDate: {
                gte: new Date(year, month - 1, 1),
                lte: new Date(year, month, 0, 23, 59, 59, 999)
              }
            },
            {
              endDate: {
                gte: new Date(year, month - 1, 1),
                lte: new Date(year, month, 0, 23, 59, 59, 999)
              }
            },
            {
              startDate: { lt: new Date(year, month - 1, 1) },
              endDate: { gt: new Date(year, month, 0, 23, 59, 59, 999) }
            }
          ]
        }
      });

      let unpaidDays = 0;
      for (const reqLeave of unpaidLeaves) {
        const overlapStart = new Date(Math.max(new Date(reqLeave.startDate).getTime(), new Date(year, month - 1, 1).getTime()));
        const overlapEnd = new Date(Math.min(new Date(reqLeave.endDate).getTime(), new Date(year, month, 0, 23, 59, 59, 999).getTime()));
        
        if (overlapStart <= overlapEnd) {
          const calendarOverlap = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
          const totalReqDays = Math.ceil((new Date(reqLeave.endDate).getTime() - new Date(reqLeave.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
          unpaidDays += (reqLeave.days / totalReqDays) * calendarOverlap;
        }
      }

      const dailyRate = emp.salary / totalDaysInMonth;
      const lwpDeduction = dailyRate * unpaidDays;
      
      const slip = calculatePayslip(emp.salary, config, lwpDeduction);
      totalAmount += slip.net;
      
      await server.prisma.payslip.upsert({
        where: {
          employeeId_month_year: { employeeId: emp.id, month, year }
        },
        update: {
          basicSalary: slip.basic,
          hra: slip.hra,
          allowances: slip.special,
          grossSalary: slip.gross,
          pfDeduction: slip.deductions.pf,
          tdsDeduction: slip.deductions.tds,
          otherDeductions: slip.deductions.other,
          netSalary: slip.net
        },
        create: {
          employeeId: emp.id,
          month,
          year,
          basicSalary: slip.basic,
          hra: slip.hra,
          allowances: slip.special,
          grossSalary: slip.gross,
          pfDeduction: slip.deductions.pf,
          tdsDeduction: slip.deductions.tds,
          otherDeductions: slip.deductions.other,
          netSalary: slip.net,
          paidAt: new Date()
        }
      });
    }

    return reply.code(201).send({ success: true, processed: employees.length, totalAmount });
  });
}
