import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const CreateExpenseSchema = z.object({
  employeeId: z.string().optional(),
  projectId: z.string().optional(),
  category: z.string().min(1), // e.g., TRAVEL, SOFTWARE, OFFICE
  amount: z.number().positive(),
  description: z.string().min(1),
  receiptUrl: z.string().url().optional(),
});

const UpdateExpenseSchema = CreateExpenseSchema.partial().extend({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'PAID']).optional(),
  approvedBy: z.string().optional(),
});

export default async function expensesRouter(app: FastifyInstance) {
  app.get('/expenses', async (req, reply) => {
    const { status, projectId } = req.query as { status?: string; projectId?: string };
    const expenses = await app.prisma.expense.findMany({
      where: {
        ...(status && { status }),
        ...(projectId && { projectId }),
      },
      orderBy: { submittedAt: 'desc' },
    });
    return { data: expenses, total: expenses.length };
  });

  app.post('/expenses', async (req, reply) => {
    const body = CreateExpenseSchema.parse(req.body);
    const expense = await app.prisma.expense.create({
      data: body,
    });
    reply.code(201);
    return expense;
  });

  app.patch('/expenses/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = UpdateExpenseSchema.parse(req.body);
    
    const updateData: any = { ...body };
    if (body.status === 'APPROVED' && !updateData.approvedAt) {
      updateData.approvedAt = new Date();
    }
    if (body.status === 'PAID' && !updateData.paidAt) {
      updateData.paidAt = new Date();
    }

    const expense = await app.prisma.expense.update({
      where: { id },
      data: updateData,
    });
    return expense;
  });
}
