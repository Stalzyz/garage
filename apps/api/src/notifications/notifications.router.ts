import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export default async function notificationsRouter(app: FastifyInstance) {
  // GET /api/v1/notifications — fetch notifications for a user
  app.get('/', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const userId = req.user.id;
    const { isRead } = req.query as { isRead?: string };
    const notifications = await app.prisma.notification.findMany({
      where: {
        userId,
        ...(isRead === 'true' && { isRead: true }),
        ...(isRead === 'false' && { isRead: false }),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    return { notifications, total: notifications.length };
  });

  // PATCH /api/v1/notifications/:id/read — mark as read
  app.patch('/:id/read', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const userId = req.user.id;
    const { id } = req.params as { id: string };
    
    // Ensure the notification belongs to the user
    const notif = await app.prisma.notification.findUnique({ where: { id } });
    if (!notif || notif.userId !== userId) return reply.code(403).send({ error: 'Forbidden' });

    const notification = await app.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
    return notification;
  });

  // PATCH /api/v1/notifications/read-all — mark all as read for user
  app.patch('/read-all', { preHandler: [app.requireAuth] }, async (req, reply) => {
    const userId = req.user.id;
    await app.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { success: true };
  });

  // POST /api/v1/notifications — create a notification (internal/system use)
  app.post('/', async (req, reply) => {
    const schema = z.object({
      userId: z.string().min(1),
      type: z.enum([
        'TASK_ASSIGNED', 'DEADLINE_APPROACHING', 'APPROVAL_NEEDED',
        'PAYMENT_RECEIVED', 'PAYMENT_OVERDUE', 'MILESTONE_REACHED',
        'LEAVE_APPROVED', 'ASSIGNMENT_GRADED', 'NEW_MESSAGE', 'SYSTEM',
      ]),
      title: z.string().min(1),
      body: z.string().min(1),
      link: z.string().optional(),
    });
    const body = schema.parse(req.body);
    const notification = await app.prisma.notification.create({ data: body });
    reply.code(201);
    return notification;
  });
}
