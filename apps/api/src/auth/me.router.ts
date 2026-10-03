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
        customRole: { include: { permissions: true } },
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
        customRole: user.customRole ? user.customRole.name : null,
        permissions: user.customRole ? user.customRole.permissions.map((p: any) => p.resource) : [],
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

    if (currentPassword === newPassword) {
      return reply.status(400).send({ error: 'New password cannot be identical to current password' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await app.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        mustChangePassword: false,
        passwordResetAt: null,
        sessionVersion: { increment: 1 }
      }
    });

    try {
      await app.prisma.auditLog.create({
        data: {
          userId,
          action: 'UPDATE',
          resource: 'User',
          resourceId: userId,
          changes: { event: 'PASSWORD_CHANGED' }
        }
      });
    } catch (e) {
      // Non-fatal if auditLog fails
    }

    return { success: true, message: 'Password updated successfully' };
  });

  // Alias /change-password to /password for standard client compatibility
  app.post('/change-password', {
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

    if (currentPassword === newPassword) {
      return reply.status(400).send({ error: 'New password cannot be identical to current password' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await app.prisma.user.update({
      where: { id: userId },
      data: {
        passwordHash,
        mustChangePassword: false,
        passwordResetAt: null,
        sessionVersion: { increment: 1 }
      }
    });

    try {
      await app.prisma.auditLog.create({
        data: {
          userId,
          action: 'UPDATE',
          resource: 'User',
          resourceId: userId,
          changes: { event: 'PASSWORD_CHANGED' }
        }
      });
    } catch (e) {
      // Non-fatal if auditLog fails
    }

    return { success: true, message: 'Password updated successfully' };
  });
}

