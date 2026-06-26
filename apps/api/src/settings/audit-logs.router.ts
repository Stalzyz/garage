import { FastifyInstance } from 'fastify';

export default async function auditLogsRouter(app: FastifyInstance) {
  // GET /api/v1/settings/audit-logs
  app.get('/audit-logs', async (req, reply) => {
    const { page = '1', limit = '50', resource, userId } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [logs, total] = await Promise.all([
      app.prisma.auditLog.findMany({
        where: {
          ...(resource && { resource }),
          ...(userId && { userId }),
        },
        include: {
          user: { select: { email: true, firstName: true, lastName: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      app.prisma.auditLog.count({
        where: {
          ...(resource && { resource }),
          ...(userId && { userId }),
        }
      })
    ]);

    return { logs, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) };
  });
}
