import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function expensesRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /hr/expenses — list all expenses with employee info
  server.get('/', async (req, reply) => {
    const expenses = await server.prisma.expense.findMany({
      orderBy: { submittedAt: 'desc' }
    });

    const enriched = await Promise.all(expenses.map(async (exp) => {
      if (!exp.employeeId) return { ...exp, employeeName: 'Unknown', department: 'N/A', employeeCode: '' };
      const employee = await server.prisma.employee.findUnique({
        where: { id: exp.employeeId },
        include: { user: true, department: true }
      });
      return {
        ...exp,
        employeeName: employee ? `${employee.user.firstName} ${employee.user.lastName}` : 'Unknown',
        department: employee?.department?.name || 'N/A',
        employeeCode: employee?.employeeCode || ''
      };
    }));

    return { expenses: enriched };
  });

  // POST /hr/expenses — submit a new expense claim
  server.post('/', {
    schema: {
      body: z.object({
        employeeId: z.string().optional(),
        category: z.string(),
        amount: z.number().positive(),
        description: z.string().min(1),
        receiptUrl: z.string().optional(),
        projectId: z.string().optional()
      })
    }
  }, async (req, reply) => {
    const expense = await server.prisma.expense.create({
      data: {
        employeeId: req.body.employeeId,
        category: req.body.category,
        amount: req.body.amount,
        description: req.body.description,
        receiptUrl: req.body.receiptUrl,
        projectId: req.body.projectId,
        status: 'PENDING'
      }
    });
    return reply.code(201).send(expense);
  });

  // PATCH /hr/expenses/:id/status — approve / reject / mark paid
  server.patch('/:id/status', {
    schema: {
      params: z.object({ id: z.string() }),
      body: z.object({
        status: z.enum(['APPROVED', 'REJECTED', 'PAID']),
        approvedBy: z.string().optional()
      })
    }
  }, async (req, reply) => {
    const { status, approvedBy } = req.body;
    const now = new Date();
    const expense = await server.prisma.expense.update({
      where: { id: req.params.id },
      data: {
        status,
        approvedBy: approvedBy || null,
        approvedAt: (status === 'APPROVED' || status === 'PAID') ? now : null,
        paidAt: status === 'PAID' ? now : null
      }
    });
    return expense;
  });

  // DELETE /hr/expenses/:id
  server.delete('/:id', {
    schema: { params: z.object({ id: z.string() }) }
  }, async (req, reply) => {
    await server.prisma.expense.delete({ where: { id: req.params.id } });
    return reply.code(204).send();
  });
}
