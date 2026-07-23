import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { EventBus, SystemEvents } from '../automations/event-bus';

export default async function feesRouter(app: FastifyInstance) {

  // ─────────────────────────────────────────────────────────────
  // GET /api/v1/academy/fees — Overview: stats + overdue board
  // ─────────────────────────────────────────────────────────────
  app.get('/fees', async (req, reply) => {
    const today = new Date();

    const allInstallments = await app.prisma.feeInstallment.findMany({
      include: {
        enrollment: {
          include: {
            student: {
              include: {
                user: { select: { firstName: true, lastName: true, email: true, phone: true } }
              }
            },
            batch: { select: { name: true, course: { select: { name: true } } } }
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    const totalCollected = allInstallments
      .filter(i => i.status === 'PAID')
      .reduce((sum, i) => sum + i.paidAmount, 0);

    const totalOutstanding = allInstallments
      .filter(i => ['PENDING', 'PARTIAL', 'OVERDUE'].includes(i.status))
      .reduce((sum, i) => sum + (i.amount - i.paidAmount), 0);

    const overdueList = allInstallments.filter(i => i.status === 'OVERDUE');
    const upcomingList = allInstallments.filter(i => {
      if (i.status !== 'PENDING') return false;
      const diff = (new Date(i.dueDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 7;
    });

    return {
      stats: {
        totalCollected,
        totalOutstanding,
        overdueCount: overdueList.length,
        upcomingCount: upcomingList.length
      },
      overdue: overdueList,
      upcoming: upcomingList,
      installments: allInstallments,
    };
  });

  // ─────────────────────────────────────────────────────────────
  // GET /api/v1/academy/fees/student/:studentId — Full Ledger
  // ─────────────────────────────────────────────────────────────
  app.get('/fees/student/:studentId', async (req, reply) => {
    const { studentId } = req.params as { studentId: string };

    const student = await app.prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { firstName: true, lastName: true, email: true, phone: true } },
        enrollments: {
          include: {
            batch: { select: { name: true, course: { select: { name: true } } } },
            installments: {
              include: { followUps: true },
              orderBy: { dueDate: 'asc' }
            }
          }
        }
      }
    });

    if (!student) return reply.notFound('Student not found');
    return student;
  });

  // ─────────────────────────────────────────────────────────────
  // POST /api/v1/academy/fees/installment — Admin creates a due
  // ─────────────────────────────────────────────────────────────
  app.post('/fees/installment', async (req, reply) => {
    const schema = z.object({
      enrollmentId: z.string(),
      dueDate: z.string(), // ISO date string
      amount: z.number().positive(),
      notes: z.string().optional()
    });
    const body = schema.parse(req.body);

    const installment = await app.prisma.feeInstallment.create({
      data: {
        enrollmentId: body.enrollmentId,
        dueDate: new Date(body.dueDate),
        amount: body.amount,
        notes: body.notes
      },
      include: {
        enrollment: {
          include: {
            student: { include: { user: true } },
            batch: { select: { name: true } }
          }
        }
      }
    });

    reply.code(201);
    return installment;
  });

  // ─────────────────────────────────────────────────────────────
  // PATCH /api/v1/academy/fees/installment/:id/pay — Record payment
  // ─────────────────────────────────────────────────────────────
  app.patch('/fees/installment/:id/pay', async (req, reply) => {
    const { id } = req.params as { id: string };
    const schema = z.object({
      amount: z.number().positive(),
      paymentRef: z.string().optional(),
      notes: z.string().optional()
    });
    const body = schema.parse(req.body);

    const installment = await app.prisma.feeInstallment.findUnique({ where: { id } });
    if (!installment) return reply.notFound('Installment not found');

    const newPaid = installment.paidAmount + body.amount;
    const newStatus = newPaid >= installment.amount ? 'PAID' : 'PARTIAL';

    const updated = await app.prisma.feeInstallment.update({
      where: { id },
      data: {
        paidAmount: newPaid,
        status: newStatus,
        paymentRef: body.paymentRef,
        notes: body.notes,
        paidAt: newStatus === 'PAID' ? new Date() : undefined
      },
      include: {
        enrollment: {
          include: {
            student: { include: { user: true } },
            batch: { select: { name: true, course: { select: { name: true } } } }
          }
        }
      }
    });

    // Fire event for WhatsApp/email receipt if fully paid
    if (newStatus === 'PAID') {
      const student = updated.enrollment.student;
      EventBus.emit(SystemEvents.FEE_PAID, {
        studentId: student.id,
        studentName: `${student.user.firstName} ${student.user.lastName}`,
        studentEmail: student.user.email,
        studentPhone: student.user.phone,
        amount: `₹${body.amount}`,
        batchName: updated.enrollment.batch.name,
        paymentRef: body.paymentRef || 'N/A',
        paidAt: new Date().toLocaleDateString('en-IN')
      });
    }

    // Update enrollment feePaid aggregate
    const allInstallments = await app.prisma.feeInstallment.findMany({
      where: { enrollmentId: installment.enrollmentId }
    });
    const totalPaid = allInstallments.reduce((sum, i) => sum + i.paidAmount, 0);
    await app.prisma.enrollment.update({
      where: { id: installment.enrollmentId },
      data: { feePaid: totalPaid }
    });

    return updated;
  });

  // ─────────────────────────────────────────────────────────────
  // POST /api/v1/academy/fees/installment/:id/followup — Log a follow-up
  // ─────────────────────────────────────────────────────────────
  app.post('/fees/installment/:id/followup', async (req, reply) => {
    const { id } = req.params as { id: string };
    const schema = z.object({
      channel: z.enum(['CALL', 'WHATSAPP', 'EMAIL', 'VISIT']),
      notes: z.string().optional(),
      nextFollowUpAt: z.string().optional(),
      staffId: z.string().optional()
    });
    const body = schema.parse(req.body);

    const followUp = await app.prisma.feeFollowUp.create({
      data: {
        installmentId: id,
        channel: body.channel,
        notes: body.notes,
        nextFollowUpAt: body.nextFollowUpAt ? new Date(body.nextFollowUpAt) : undefined,
        staffId: body.staffId
      }
    });

    reply.code(201);
    return followUp;
  });
}
