import { FastifyInstance } from 'fastify';
import crypto from 'crypto';

export default async function referralsRouter(app: FastifyInstance) {
  // GET /api/v1/academy/referrals/me
  app.get('/me', async (req, reply) => {
    // Resolve the authenticated user from the JWT session
    const userId: string | undefined = (req as any).user?.id;
    if (!userId) return reply.status(401).send({ error: 'Not authenticated' });

    const user = await app.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return reply.status(401).send({ error: 'User not found' });

    let student = await app.prisma.student.findUnique({
      where: { userId: user.id },
      include: {
        referrals: {
          include: { user: true }
        },
        commissionsEarned: true
      }
    });

    if (!student) return reply.status(404).send({ error: 'Student profile not found' });

    // Auto-generate referral code if not exists
    if (!student.referralCode) {
      const code = `GREKAM-${user.firstName?.toUpperCase().substring(0, 3) ?? 'STU'}-${crypto.randomUUID().substring(0, 5).toUpperCase()}`;
      student = await app.prisma.student.update({
        where: { id: student.id },
        data: { referralCode: code },
        include: {
          referrals: {
            include: { user: true }
          },
          commissionsEarned: true
        }
      });
    }

    const totalEarned = student.commissionsEarned.reduce((sum, r) => sum + r.commissionAmt, 0);

    return {
      data: {
        referralCode: student.referralCode,
        referrals: student.commissionsEarned,
        totalEarned
      }
    };
  });
}
