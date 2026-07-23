import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
type LocalLeaveType = "SICK" | "CASUAL" | "PAID";
type LocalLeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export default async function leavesRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get('/', async (req, reply) => {
    const leaves = await server.prisma.leaveRequest.findMany({
      include: { employee: { include: { user: true, department: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return { leaves };
  });

  server.get('/balances/:employeeId', {
    schema: { params: z.object({ employeeId: z.string() }) }
  }, async (req, reply) => {
    const year = new Date().getFullYear();
    const balances = await server.prisma.leaveBalance.findMany({
      where: { employeeId: req.params.employeeId, year }
    });
    return { balances };
  });

  server.post('/balances', {
    schema: {
      body: z.object({
        employeeId: z.string(),
        type: z.string(),
        balance: z.number(),
        year: z.number()
      })
    }
  }, async (req, reply) => {
    const balance = await server.prisma.leaveBalance.upsert({
      where: {
        employeeId_type_year: {
          employeeId: req.body.employeeId,
          type: req.body.type as any,
          year: req.body.year
        }
      },
      update: { balance: req.body.balance },
      create: { ...req.body, type: req.body.type as any }
    });
    return reply.status(201).send(balance);
  });

  server.post('/', {
    schema: {
      body: z.object({
        employeeId: z.string().optional(),
        type: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        days: z.number(),
        reason: z.string()
      })
    }
  }, async (req, reply) => {
    const data = req.body;
    let employeeId = data.employeeId;

    if (!employeeId && req.user) {
      const emp = await server.prisma.employee.findUnique({
        where: { userId: req.user.id }
      });
      if (emp) {
        employeeId = emp.id;
      }
    }

    if (!employeeId) {
      return reply.status(400).send({ error: "Could not find employee profile for active user session" });
    }

    const leave = await server.prisma.leaveRequest.create({
      data: {
        employeeId,
        type: data.type as any,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        days: data.days,
        reason: data.reason,
        status: "PENDING" as any
      }
    });
    return reply.status(201).send(leave);
  });

  server.patch('/:id/status', {
    schema: {
      params: z.object({ id: z.string() }),
      body: z.object({ status: z.string(), approvedBy: z.string().optional() })
    }
  }, async (req, reply) => {
    const { status, approvedBy } = req.body;
    
    const request = await server.prisma.leaveRequest.findUnique({
      where: { id: req.params.id }
    });

    if (!request) return reply.status(404).send({ error: 'Not found' });

    const leave = await server.prisma.leaveRequest.update({
      where: { id: req.params.id },
      data: { 
        status: status as any, 
        approvedBy,
        approvedAt: status === "APPROVED" ? new Date() : null
      }
    });

    if (status === "APPROVED" && request.status !== "APPROVED") {
       // Deduct from balance
       const year = new Date().getFullYear();
       const balanceRecord = await server.prisma.leaveBalance.findUnique({
         where: { employeeId_type_year: { employeeId: request.employeeId, type: request.type, year } }
       });
       if (balanceRecord) {
         await server.prisma.leaveBalance.update({
           where: { id: balanceRecord.id },
           data: { balance: balanceRecord.balance - request.days }
         });
       }
    }

    return reply.send(leave);
  });
}
