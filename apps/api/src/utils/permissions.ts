import type { FastifyInstance } from 'fastify';

/**
 * RBAC permission resolution.
 *
 * The schema already models Role -> Permission{resource, action} and users can
 * be assigned a custom role via `User.customRoleId`, but nothing ever *checked*
 * those permissions — they were editable in Settings and ignored everywhere.
 * This adds the missing enforcement, scoped to the data it guards.
 *
 * In production the configured roles are:
 *   Management -> HR & Payroll: VIEW/CREATE/EDIT/DELETE
 *   HR         -> HR & Payroll: VIEW/CREATE/EDIT/DELETE
 *   Staff      -> CRM & Sales, Marketing Hub, Projects, Support Helpdesk only
 *
 * so gating compensation data on `HR & Payroll` + `VIEW` yields exactly "HR and
 * management can see salaries" with no data migration, and stays adjustable
 * from the Settings -> Roles screen.
 */

export const RESOURCE_HR_PAYROLL = 'HR & Payroll';
export const ACTION_VIEW = 'VIEW';

/** Maps the coarse UserRole enum onto the configurable Role rows. */
const BASE_ROLE_TO_SYSTEM_ROLE: Record<string, string> = {
  MANAGER: 'Management',
  STAFF: 'Staff',
  INTERN: 'Staff',
  EDUCATOR: 'Academy Staff',
  FREELANCER: 'Staff',
  VENDOR: 'Staff',
};

/** Roles that must never resolve to compensation access unless explicitly given custom role. */
const NEVER_ELEVATED = new Set(['CLIENT', 'STUDENT']);

type PermissionCache = WeakMap<object, Promise<Set<string>>>;
const caches = new WeakMap<FastifyInstance, PermissionCache>();

/** "resource|ACTION" strings for the user's effective role. */
async function loadPermissionSet(app: FastifyInstance, user: any): Promise<Set<string>> {
  // Super admins bypass RBAC entirely.
  if (user?.role === 'SUPER_ADMIN') return new Set(['*|*']);
  if (!user?.id) return new Set();

  const record = await (app as any).prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, customRoleId: true, customRole: { select: { id: true, name: true } } },
  });
  if (!record) return new Set();

  // An explicitly assigned custom role always wins and loads directly
  if (record.customRoleId || record.customRole) {
    const perms = await (app as any).prisma.permission.findMany({
      where: {
        OR: [
          ...(record.customRoleId ? [{ roleId: record.customRoleId }] : []),
          ...(record.customRole?.name ? [{ role: { name: record.customRole.name } }] : [])
        ]
      },
      select: { resource: true, action: true },
    });
    return new Set(perms.map((p: any) => `${p.resource}|${p.action}`));
  }

  if (NEVER_ELEVATED.has(record.role)) return new Set();

  const roleName = BASE_ROLE_TO_SYSTEM_ROLE[record.role ?? ''];
  if (!roleName) return new Set();

  const perms = await (app as any).prisma.permission.findMany({
    where: { role: { name: roleName } },
    select: { resource: true, action: true },
  });
  return new Set(perms.map((p: any) => `${p.resource}|${p.action}`));
}

/**
 * Resolve the caller's permissions once per request.
 *
 * Memoised on the request object because the redaction hook runs on every
 * response and a guard that re-queries per response would be wasteful.
 */
export function permissionsFor(app: FastifyInstance, request: any): Promise<Set<string>> {
  let cache = caches.get(app);
  if (!cache) {
    cache = new WeakMap();
    caches.set(app, cache);
  }
  const key = request ?? {};
  const existing = cache.get(key);
  if (existing) return existing;

  const pending = loadPermissionSet(app, request?.user).catch(() => new Set<string>());
  cache.set(key, pending);
  return pending;
}

/**
 * Does the caller hold `resource`+`action`?
 *
 * A permission on a broader action (`ALL`) also grants the narrower read, which
 * matches how the role editor is used in practice.
 */
export async function hasPermission(
  app: FastifyInstance,
  request: any,
  resource: string,
  action: string = ACTION_VIEW
): Promise<boolean> {
  const perms = await permissionsFor(app, request);
  if (perms.has('*|*')) return true;
  return perms.has(`${resource}|${action}`) || perms.has(`${resource}|ALL`);
}

/** Convenience wrapper for the compensation guard. */
export function canViewCompensation(app: FastifyInstance, request: any): Promise<boolean> {
  return hasPermission(app, request, RESOURCE_HR_PAYROLL, ACTION_VIEW);
}
