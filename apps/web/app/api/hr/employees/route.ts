import { NextResponse } from "next/server"
import { prisma } from "@grekam/db"
import { getTenantId } from "@/lib/auth"

export async function GET() {
  try {
    const tenantId = await getTenantId()
    if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const employees = await prisma.employee.findMany({
      where: { tenantId },
      include: {
        user: true,
        department: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ employees })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
