import { FastifyInstance } from 'fastify';

export default async function meRouter(app: FastifyInstance) {
  app.get('/me', {
    preHandler: [app.requireAuth]
  }, async (req, reply) => {
    const userId = req.user.id;

    const user = await app.prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: { select: { id: true } },
        employee: { select: { id: true } },
        clientProfile: { select: { id: true } },
      }
    });

    if (!user) {
      return reply.notFound('User not found in database');
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        studentId: user.student?.id || null,
        employeeId: user.employee?.id || null,
        clientId: user.clientProfile?.id || null,
        avatarUrl: user.avatarUrl,
      }
    };
  });

  app.post('/password', {
    preHandler: [app.requireAuth],
    schema: {
      body: require('zod').z.object({
        currentPassword: require('zod').z.string(),
        newPassword: require('zod').z.string().min(8)
      })
    }
  }, async (req: any, reply) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await app.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return reply.notFound('User not found');

    const bcrypt = require('bcryptjs');
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) return reply.status(400).send({ error: 'Invalid current password' });

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await app.prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    return { success: true };
  });
}
