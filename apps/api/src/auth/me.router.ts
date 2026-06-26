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
}
