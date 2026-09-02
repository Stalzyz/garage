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

  // GET /api/v1/academy/referrals/my-referrals
  // Student portal endpoint to fetch personal referral stats and link
  app.get('/referrals/my-referrals', async (req, reply) => {
    const userId = req.user?.id;
    if (!userId) {
      return reply.unauthorized('Authentication required');
    }

    let student = await app.prisma.student.findUnique({
      where: { userId },
      include: { user: { select: { firstName: true, lastName: true } } }
    });

    if (!student) {
      return reply.notFound('Student record not found');
    }

    // Auto-generate referral code if missing
    if (!student.referralCode) {
      const codeName = (student.user.firstName || 'STU').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
      const code = `GREKAM-${codeName}-${Math.floor(1000 + Math.random() * 9000)}`;
      student = await app.prisma.student.update({
        where: { id: student.id },
        data: { referralCode: code },
        include: { user: { select: { firstName: true, lastName: true } } }
      });
    }

    const payouts = await app.prisma.referralPayout.findMany({
      where: { referrerId: student.id },
      include: {
        referred: { select: { studentCode: true, user: { select: { firstName: true, lastName: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const totalEarned = payouts.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
    const pendingEarned = payouts.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0);

    return {
      success: true,
      referralCode: student.referralCode,
      stats: {
        totalReferrals: payouts.length,
        totalEarned,
        pendingEarned
      },
      payouts: payouts.map(p => ({
        id: p.id,
        referredName: `${p.referred?.user?.firstName || ''} ${p.referred?.user?.lastName || ''}`.trim(),
        amount: p.amount,
        courseType: p.courseType,
        status: p.status,
        date: p.createdAt,
        paidAt: p.paidAt
      }))
    };
  });

  // POST /api/v1/academy/referrals/apply
  // When a student applies a referral code (e.g. at admission or payment)
  app.post('/referrals/apply', async (req, reply) => {
    const schema = z.object({
      referralCode: z.string(),
      newStudentId: z.string(),
      feePaid: z.number().positive(),
      courseType: z.enum(['ONSITE', 'ONLINE']),
    });
    const body = schema.parse(req.body);

    const referrer = await app.prisma.student.findUnique({ where: { referralCode: body.referralCode } });
    if (!referrer) return reply.notFound('Invalid referral code');

    if (referrer.id === body.newStudentId) {
      return reply.code(400).send({ message: 'You cannot refer yourself' });
    }

    // Check if payout or referral already exists for this referred student
    const existingPayout = await app.prisma.referralPayout.findFirst({
      where: { referredId: body.newStudentId }
    });

    if (existingPayout) {
      return reply.code(400).send({ message: 'Referral reward already claimed for this student', payout: existingPayout });
    }

    // Fetch dynamic commission rate setting from SystemSetting
    const setting = await app.prisma.systemSetting.findUnique({ where: { key: 'commission_rate_student' } });
    const percentage = (setting?.value as any)?.percentage ?? 10;
    const amount = (body.feePaid * percentage) / 100;

    // Link the student
    await app.prisma.student.update({
      where: { id: body.newStudentId },
      data: { referredById: referrer.id }
    });

    // Create ReferralPayout record
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

    // Sync Module 24 Referral table for schema consistency
    await app.prisma.referral.upsert({
      where: { referredUserId: body.newStudentId },
      create: {
        referrerId: referrer.id,
        referredUserId: body.newStudentId,
        status: 'PENDING',
        commissionAmt: amount
      },
      update: {
        referrerId: referrer.id,
        status: 'PENDING',
        commissionAmt: amount
      }
    });

    return { success: true, payout };
  });

  // PATCH /api/v1/academy/referrals/payouts/:id
  // Admin marking a payout as paid or rejected
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

    // Sync Module 24 Referral status
    await app.prisma.referral.updateMany({
      where: { referredUserId: payout.referredId },
      data: {
        status: body.status === 'PAID' ? 'PAID' : 'PENDING'
      }
    });

    return payout;
  });
}

