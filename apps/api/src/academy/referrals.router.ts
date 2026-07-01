import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export default async function referralsRouter(app: FastifyInstance) {
  
  // GET /api/v1/academy/referrals/payouts
  // Fetch all payouts for admin dashboard
  app.get('/referrals/payouts', async (req, reply) => {
    const payouts = await app.prisma.referralPayout.findMany({
      include: {
        referrer: { select: { id: true, studentCode: true, user: { select: { firstName: true, lastName: true, phone: true } } } },
        referred: { select: { id: true, studentCode: true, user: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: { createdAt: 'desc' }
    });
    return payouts;
  });

  // POST /api/v1/academy/referrals/apply
  // When a student applies a referral code (e.g. at admission or payment)
  app.post('/referrals/apply', async (req, reply) => {
    const schema = z.object({
      referralCode: z.string(),
      newStudentId: z.string(),
      feePaid: z.number(),
      courseType: z.enum(['ONSITE', 'ONLINE']),
    });
    const body = schema.parse(req.body);

    const referrer = await app.prisma.student.findUnique({ where: { referralCode: body.referralCode } });
    if (!referrer) return reply.notFound('Invalid referral code');

    if (referrer.id === body.newStudentId) {
      return reply.code(400).send({ message: 'You cannot refer yourself' });
    }

    // Since user requested percentage based rewards, let's say 10% flat
    const percentage = 10;
    const amount = (body.feePaid * percentage) / 100;

    // Link the student
    await app.prisma.student.update({
      where: { id: body.newStudentId },
      data: { referredById: referrer.id }
    });

    // Create the payout request (Pending cash/bank transfer)
    const payout = await app.prisma.referralPayout.create({
      data: {
        referrerId: referrer.id,
        referredId: body.newStudentId,
        amount,
        percentage,
        courseType: body.courseType,
        status: 'PENDING'
      }
    });

    return { success: true, payout };
  });

  // PATCH /api/v1/academy/referrals/payouts/:id
  // Admin marking a payout as paid
  app.patch('/referrals/payouts/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const schema = z.object({
      status: z.enum(['PAID', 'REJECTED']),
      paymentMethod: z.string().optional(),
      transactionId: z.string().optional(),
      notes: z.string().optional(),
    });
    const body = schema.parse(req.body);

    const payout = await app.prisma.referralPayout.update({
      where: { id },
      data: {
        status: body.status,
        paymentMethod: body.paymentMethod,
        transactionId: body.transactionId,
        notes: body.notes,
        paidAt: body.status === 'PAID' ? new Date() : undefined,
      }
    });

    return payout;
  });
}
