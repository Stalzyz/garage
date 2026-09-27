import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")

    const where: any = {}
    if (status && status !== "ALL") where.status = status

    const kycRecords = await prisma.partnerKYC.findMany({
      where,
      include: {
        partner: {
          include: {
            user: { select: { email: true, firstName: true, lastName: true, phone: true } },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      kycRecords,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch KYC records" }, { status: 500 })
  }
}
