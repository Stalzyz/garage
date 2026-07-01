import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export default async function marketplaceRouter(app: FastifyInstance) {
  // GET /api/v1/academy/marketplace
  app.get('/marketplace', async (req, reply) => {
    const items = await app.prisma.marketplaceItem.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    return items;
  });

  // POST /api/v1/academy/marketplace/buy
  app.post('/marketplace/buy', async (req, reply) => {
    const schema = z.object({
      studentId: z.string(),
      itemId: z.string(),
    });
    const body = schema.parse(req.body);

    const item = await app.prisma.marketplaceItem.findUnique({ where: { id: body.itemId } });
    if (!item) return reply.notFound('Item not found');

    const wallet = await app.prisma.digitalWallet.findUnique({ where: { studentId: body.studentId } });
    if (!wallet || wallet.balance < item.price) {
      return reply.code(400).send({ message: 'Insufficient wallet balance' });
    }

    // Process transaction
    await app.prisma.$transaction(async (tx: any) => {
      // 1. Deduct balance
      await tx.digitalWallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: item.price } }
      });
      // 2. Log debit
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount: item.price,
          type: 'DEBIT',
          source: 'PURCHASE',
          description: `Purchased: ${item.title}`
        }
      });
      // 3. Record purchase
      await tx.marketplacePurchase.create({
        data: {
          studentId: body.studentId,
          itemId: item.id,
          amountPaid: item.price
        }
      });
    });

    return { success: true, message: 'Purchase successful' };
  });

  // GET /api/v1/academy/wallet/:studentId
  app.get('/wallet/:studentId', async (req, reply) => {
    const { studentId } = req.params as { studentId: string };
    let wallet = await app.prisma.digitalWallet.findUnique({
      where: { studentId },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 20 } }
    });

    if (!wallet) {
      // Auto-create wallet for student if missing
      wallet = await app.prisma.digitalWallet.create({
        data: { studentId, balance: 1000 }, // Giving 1000 initial bonus credits for demo
        include: { transactions: true }
      });
      
      await app.prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          amount: 1000,
          type: 'CREDIT',
          source: 'REWARD',
          description: 'Welcome Bonus Credits'
        }
      });
      
      wallet = await app.prisma.digitalWallet.findUnique({
        where: { studentId },
        include: { transactions: { orderBy: { createdAt: 'desc' }, take: 20 } }
      });
    }

    return wallet;
  });
}
