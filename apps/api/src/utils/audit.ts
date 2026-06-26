import { PrismaClient } from '@prisma/client';
import { FastifyRequest } from 'fastify';

/**
 * Writes a tamper-evident audit log entry.
 * Silently swallows errors so auditing never crashes a route.
 *
 * NOTE: The AuditLog schema requires userId. If the request has no
 * authenticated user, the log is skipped rather than written with a null.
 *
 * @example
 *   await auditLog(app.prisma, req, 'CREATE', 'Invoice', invoice.id);
 */
export async function auditLog(
  prisma: PrismaClient,
  req: FastifyRequest | null,
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VIEW' | 'LOGIN' | 'EXPORT',
  resource: string,
  resourceId?: string,
  metadata?: Record<string, any>,
): Promise<void> {
  try {
    // Extract userId from JWT session — required by schema
    const userId: string | undefined = (req as any)?.user?.id ?? undefined;

    // Skip audit if no authenticated user (avoids FK violation on userId)
    if (!userId) {
      console.debug(`[AuditLog] Skipping ${action} ${resource} — no authenticated user`);
      return;
    }

    const ip = req?.ip ?? req?.headers?.['x-forwarded-for'] ?? null;

    await (prisma as any).auditLog.create({
      data: {
        action,
        resource,
        resourceId: resourceId ?? 'unknown',
        userId,
        ipAddress: typeof ip === 'string' ? ip : (Array.isArray(ip) ? ip[0] : null),
        // Store extra metadata in the `changes` JSON field (schema field name)
        changes: metadata ?? null,
      },
    });
  } catch (err) {
    // Audit logging must never crash the main request
    console.error('[AuditLog] Failed to write audit entry:', err);
  }
}
