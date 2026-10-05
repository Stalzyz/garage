import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/require-admin"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  try {
    const logs = await prisma.partnerActivityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json({
      success: true,
      activities: logs.map((log) => ({
        id: log.id,
        who: log.actorUserId || "Platform User",
        action: log.action.replace(/_/g, " "),
        target: log.description,
        date: new Date(log.createdAt).toISOString().replace("T", " ").substring(0, 16),
      }))
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch activity logs" }, { status: 500 })
  }
}
