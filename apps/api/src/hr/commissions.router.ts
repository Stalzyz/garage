import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export default async function commissionsRouter(app: FastifyInstance) {
  // GET /api/v1/hr/commissions
  app.get('/commissions', async (req, reply) => {
    try {
      const userId = req.user?.id;
      
      // If admin, they can see all commissions. Otherwise, only their own.
      const employee = await app.prisma.employee.findUnique({
        where: { userId }
      });
      
      if (!employee) {
        return reply.unauthorized('Employee record not found.');
      }

      const isAdmin = req.user?.role === 'ADMIN';

      const whereClause = isAdmin ? {} : { employeeId: employee.id };

      const commissions = await app.prisma.commission.findMany({
        where: whereClause,
        include: {
          employee: {
            include: { user: { select: { firstName: true, lastName: true, email: true } } }
          },
          lead: {
            select: { name: true, company: true, email: true }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      // Calculate totals for the specific user (if not admin, or we can just send it always)
      const stats = {
        totalEarnings: commissions.reduce((sum, c) => c.status === 'PAID' ? sum + c.amount : sum, 0),
        pendingEarnings: commissions.reduce((sum, c) => c.status === 'PENDING' ? sum + c.amount : sum, 0),
        referralCode: employee.employeeCode
      };

      return { success: true, data: commissions, stats };
    } catch (err: any) {
      app.log.error(err, 'Failed to fetch commissions');
      return reply.internalServerError('Failed to fetch commissions');
    }
  });

  // POST /api/v1/hr/commissions/:id/pay
  app.post('/commissions/:id/pay', async (req: any, reply) => {
    try {
      const isAdmin = req.user?.role === 'ADMIN';
      if (!isAdmin) {
        return reply.forbidden('Only admins can mark commissions as paid.');
      }

      const { id } = req.params;

      const commission = await app.prisma.commission.update({
        where: { id },
        data: {
          status: 'PAID',
          paidAt: new Date()
        }
      });

      return { success: true, data: commission };
    } catch (err: any) {
      app.log.error(err, 'Failed to pay commission');
      return reply.internalServerError('Failed to update commission status');
    }
  });
}
