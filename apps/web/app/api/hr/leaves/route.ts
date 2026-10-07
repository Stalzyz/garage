import { NextResponse } from "next/server"
import { prisma } from "@grekam/db"
import { getTenantId } from "@/lib/auth"

export async function GET() {
  try {
    const tenantId = await getTenantId()
    if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const leaves = await prisma.leaveRequest.findMany({
      where: { tenantId },
      include: {
        employee: {
          include: {
            user: true,
            department: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ leaves })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const tenantId = await getTenantId()
    if (!tenantId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await req.json()
    
    // employeeId is provided by the frontend
    const leave = await prisma.leaveRequest.create({
      data: {
        tenantId,
        employeeId: body.employeeId,
        type: body.type,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        days: parseFloat(body.days),
        reason: body.reason,
        status: 'PENDING'
      }
    })

    return NextResponse.json({ success: true, leave })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
