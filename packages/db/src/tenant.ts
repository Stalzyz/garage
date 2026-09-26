import { PrismaClient } from "@prisma/client";

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
      },
    },
  });
}
