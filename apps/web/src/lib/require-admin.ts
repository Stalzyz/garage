import { NextResponse } from "next/server"
import { auth } from "@/auth"

/**
 * Shared guard for privileged Next route handlers.
 *
 * Most /api/admin/* handlers had no authentication at all, and several checked
 * a role list that omitted SUPER_ADMIN — the very role that owns the platform.
 * Anything genuinely public must opt out explicitly rather than being public by
 * omission.
 */

const ADMIN_ROLES = new Set(["SUPER_ADMIN", "PLATFORM_ADMIN"]);

export async function requireAdmin() {
  const session = await auth();

  if (!session?.user) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { error: "Unauthorized", message: "Authentication required." },
        { status: 401 }
      ),
    };
  }

  const role = (session.user as { role?: string }).role;
  if (!role || !ADMIN_ROLES.has(role)) {
    return {
      ok: false as const,
      response: NextResponse.json(
        {
          error: "Forbidden",
          message: `Role ${role ?? "unknown"} may not access platform administration.`,
        },
        { status: 403 }
      ),
    };
  }

  return { ok: true as const, session };
}