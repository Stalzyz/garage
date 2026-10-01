import { FastifyInstance } from 'fastify';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export default async function adminUsersRouter(app: FastifyInstance) {
  // Helper to verify caller is Super Admin or Manager
  function requireAdminRole(req: any, reply: any) {
    const role = req.user?.role;
    if (role !== 'SUPER_ADMIN' && role !== 'MANAGER') {
      reply.status(403).send({ 
        error: 'Forbidden', 
        message: 'Only authorized administrators (Super Admin / Manager) can access this resource.' 
      });
      return false;
    }
    return true;
  }

  // GET /users - list users across all roles with status and mustChangePassword
  app.get('/users', {
    preHandler: [app.requireAuth]
  }, async (req: any, reply) => {
    if (!requireAdminRole(req, reply)) return;

    const query = req.query as any;
    const search = query.search ? String(query.search).trim() : '';
    const role = query.role ? String(query.role) : undefined;
    const status = query.status ? String(query.status) : undefined;
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 50));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (role) {
      where.role = role;
    }
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, users] = await Promise.all([
      app.prisma.user.count({ where }),
      app.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          status: true,
          phone: true,
          avatarUrl: true,
          mustChangePassword: true,
          passwordResetAt: true,
          lastLoginAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      })
    ]);

    return {
      success: true,
      data: users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }
    };
  });

  // POST /users/:id/reset-password - Admin-controlled password reset
  app.post('/users/:id/reset-password', {
    preHandler: [app.requireAuth]
  }, async (req: any, reply) => {
    if (!requireAdminRole(req, reply)) return;

    const { id } = req.params as { id: string };
    const caller = req.user;

    const targetUser = await app.prisma.user.findUnique({
      where: { id }
    });

    if (!targetUser) {
      return reply.status(404).send({ error: 'User not found' });
    }

    // Protection: Managers cannot reset Super Admins
    if (caller.role === 'MANAGER' && targetUser.role === 'SUPER_ADMIN') {
      return reply.status(403).send({ 
        error: 'Forbidden', 
        message: 'Managers cannot reset credentials for a Super Administrator.' 
      });
    }

    // Generate cryptographically secure temporary password (e.g. Grk-XXXX-XXXX!)
    const randPart1 = crypto.randomBytes(3).toString('hex').toUpperCase();
    const randPart2 = crypto.randomBytes(3).toString('hex').toLowerCase();
    const tempPassword = `Grk@${randPart1}-${randPart2}!`;

    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const now = new Date();
    await app.prisma.user.update({
      where: { id: targetUser.id },
      data: {
        passwordHash,
        mustChangePassword: true,
        passwordResetAt: now,
        sessionVersion: { increment: 1 },
      }
    });

    try {
      await app.prisma.auditLog.create({
        data: {
          userId: caller.id,
          action: 'UPDATE',
          resource: 'User',
          resourceId: targetUser.id,
          changes: { 
            event: 'ADMIN_PASSWORD_RESET',
            targetEmail: targetUser.email,
            performedBy: caller.email
          }
        }
      });
    } catch (e) {
      // Audit log fallback
    }

    return {
      success: true,
      message: 'Temporary password generated successfully. User must change it upon login.',
      temporaryPassword: tempPassword,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        name: `${targetUser.firstName} ${targetUser.lastName}`.trim(),
        role: targetUser.role,
        mustChangePassword: true,
      }
    };
  });
}
