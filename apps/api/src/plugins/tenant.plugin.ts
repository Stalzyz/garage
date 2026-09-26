/**
 * tenant.plugin.ts
 *
 * Fastify plugin that resolves the current tenant for every request and
 * decorates `req.db` with a tenant-scoped Prisma client.
 *
 * Tenant resolution order (first match wins):
 *  1. x-tenant-id header   — set by Next.js middleware after host-based resolution
 *  2. JWT claim `tenantId` — for API-key / mobile clients
 *  3. activeTenantId on the DB user row (fetched once and cached in JWT)
 *
 * Public routes (health, auth, public-facing forms) skip resolution and
 * receive the raw `app.prisma` client under `req.db`.
 */

import fp from 'fastify-plugin';
import { FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import { getTenantPrisma } from '@grekam/db';

// Routes that do NOT require tenant scoping
const PUBLIC_ROUTE_PREFIXES = [
  '/health',
  '/docs',
  '/api/v1/auth',
  '/api/v1/crm/public-leads',
  '/api/v1/crm/public-proposals',
  '/api/v1/crm/ads-webhook',
];

declare module 'fastify' {
  interface FastifyInstance {
    prisma: import('@prisma/client').PrismaClient;
  }
  interface FastifyRequest {
    /**
     * Tenant-scoped Prisma client. All queries are automatically
     * filtered/stamped with the resolved tenantId.
     * Falls back to the global prisma client on public routes.
     */
    db: ReturnType<typeof getTenantPrisma> | import('@prisma/client').PrismaClient;
    /** The resolved tenantId for this request, or null on public routes. */
    tenantId: string | null;
  }
}

const tenantPlugin: FastifyPluginAsync = async (fastify) => {
  // Decorate request with defaults so TypeScript is happy even before hook runs
  fastify.decorateRequest('db', null as any);
  fastify.decorateRequest('tenantId', null as any);

  fastify.addHook('preHandler', async (request: FastifyRequest, reply: FastifyReply) => {
    const url = request.url;

    // Skip tenant resolution for public routes
    const isPublic = PUBLIC_ROUTE_PREFIXES.some((prefix) => url.startsWith(prefix));
    if (isPublic) {
      (request as any).db = fastify.prisma;
      return;
    }

    // 1. Try x-tenant-id header (set by Next.js middleware)
    let tenantId = request.headers['x-tenant-id'] as string | undefined;

    // 2. Try JWT claim (for API-key / mobile clients)
    if (!tenantId) {
      const user = (request as any).user;
      if (user?.tenantId) {
        tenantId = user.tenantId as string;
      }
    }

    // 3. Fallback: look up the user's activeTenantId from DB
    if (!tenantId) {
      const user = (request as any).user;
      if (user?.id) {
        try {
          const dbUser = await fastify.prisma.user.findUnique({
            where: { id: user.id },
            select: { activeTenantId: true },
          });
          if (dbUser?.activeTenantId) {
            tenantId = dbUser.activeTenantId;
          }
        } catch {
          // DB lookup failed; proceed without tenant scope
        }
      }
    }

    if (tenantId) {
      (request as any).tenantId = tenantId;
      (request as any).db = getTenantPrisma(fastify.prisma, tenantId);
    } else {
      // Authenticated but no tenant yet — still serve, but log a warning
      request.log.warn({ url }, '[tenant] No tenantId resolved; using global prisma');
      (request as any).db = fastify.prisma;
    }
  });
};

export default fp(tenantPlugin, { name: 'tenant-plugin', dependencies: [] });
