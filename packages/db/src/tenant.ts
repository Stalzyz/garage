import { PrismaClient } from "@prisma/client";

/**
 * Models carrying a `tenantId` column in schema.prisma. This list must track the
 * schema: a missing entry silently disables isolation for that model, and an
 * extra entry breaks every query (Prisma rejects an unknown field).
 *
 * The previous list covered 11 models while the schema has 18 — LedgerTransaction,
 * TenantBranding, TenantFeatures and TenantMember were all unscoped.
 */
export const TENANT_SCOPED_MODELS = [
  "department",
  "team",
  "designation",
  "lead",
  "company",
  "contact",
  "proposal",
  "project",
  "task",
  "employee",
  "invoice",
  "ledgertransaction",
  "tenantbranding",
  "tenantfeatures",
  "tenantmember",
] as const;

export type TenantScopedModel = (typeof TENANT_SCOPED_MODELS)[number];

/**
 * Creates an extended Prisma client that automatically scopes all queries
 * for tenant-aware models to the specified tenantId, preventing cross-tenant data leaks.
 */
export function getTenantPrisma(prisma: PrismaClient, tenantId: string) {
  return prisma.$extends({
    name: "tenant-isolation",
    query: {
      $allModels: {
        async findMany({ model, args, query }) {
          if (TENANT_SCOPED_MODELS.includes(model.toLowerCase() as any)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async findFirst({ model, args, query }) {
          if (TENANT_SCOPED_MODELS.includes(model.toLowerCase() as any)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async count({ model, args, query }) {
          if (TENANT_SCOPED_MODELS.includes(model.toLowerCase() as any)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async create({ model, args, query }) {
          if (TENANT_SCOPED_MODELS.includes(model.toLowerCase() as any)) {
            args.data = { ...(args.data as any), tenantId };
          }
          return query(args);
        },
        async createMany({ model, args, query }) {
          if (TENANT_SCOPED_MODELS.includes(model.toLowerCase() as any)) {
            if (Array.isArray(args.data)) {
              args.data = args.data.map((item: any) => ({ ...item, tenantId }));
            } else if (args.data) {
              args.data = { ...(args.data as any), tenantId };
            }
          }
          return query(args);
        },
        async update({ model, args, query }) {
          if (TENANT_SCOPED_MODELS.includes(model.toLowerCase() as any)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async updateMany({ model, args, query }) {
          if (TENANT_SCOPED_MODELS.includes(model.toLowerCase() as any)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async delete({ model, args, query }) {
          if (TENANT_SCOPED_MODELS.includes(model.toLowerCase() as any)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async deleteMany({ model, args, query }) {
          if (TENANT_SCOPED_MODELS.includes(model.toLowerCase() as any)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        // findUnique/upsert were previously unscoped: since Prisma 4.5 `where`
        // on a unique lookup accepts additional non-unique filters, so the
        // tenant predicate can be added. Without this, `findUnique({ where: { id } })`
        // read any tenant's row by id, bypassing tenant isolation entirely.
        async findUnique({ model, args, query }) {
          if (TENANT_SCOPED_MODELS.includes(model.toLowerCase() as any)) {
            args.where = { ...args.where, tenantId } as any;
          }
          return query(args);
        },
        async findUniqueOrThrow({ model, args, query }) {
          if (TENANT_SCOPED_MODELS.includes(model.toLowerCase() as any)) {
            args.where = { ...args.where, tenantId } as any;
          }
          return query(args);
        },
        async findFirstOrThrow({ model, args, query }) {
          if (TENANT_SCOPED_MODELS.includes(model.toLowerCase() as any)) {
            args.where = { ...args.where, tenantId };
          }
          return query(args);
        },
        async upsert({ model, args, query }) {
          if (TENANT_SCOPED_MODELS.includes(model.toLowerCase() as any)) {
            args.where = { ...args.where, tenantId } as any;
            args.create = { ...(args.create as any), tenantId };
            args.update = { ...(args.update as any), tenantId };
          }
          return query(args);
        },
      },
    },
  });
}
