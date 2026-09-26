import { PrismaClient, getTenantPrisma } from "@grekam/db"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

/**
 * Returns a tenant-isolated database client for the given tenant ID.
 * If no tenantId is provided, returns the standard global prisma client.
 */
export function getTenantDb(tenantId?: string | null) {
  if (!tenantId) return prisma;
  return getTenantPrisma(prisma, tenantId);
}
