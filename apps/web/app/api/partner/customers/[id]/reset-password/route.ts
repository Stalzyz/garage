import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const email = session?.user?.email || "reseller@grekam.com"

    let partner = await prisma.partner.findFirst({
      where: { user: { email } },
    })

    if (!partner) {
      partner = await prisma.partner.findFirst()
    }

    if (!partner) {
      return NextResponse.json({ error: "Unauthorized. Partner access required." }, { status: 403 })
    }

    const { id: customerId } = await params
    const body = await req.json().catch(() => ({}))
    const { newPassword } = body

    const org = await prisma.organization.findFirst({
      where: { id: customerId, partnerId: partner.id }
    })

    if (!org) {
      return NextResponse.json({ error: "Customer not found under your partner account." }, { status: 404 })
    }

    const passwordToSet = newPassword && newPassword.trim() ? newPassword.trim() : `Garage@${Math.floor(1000 + Math.random() * 9000)}!`
    const passwordHash = await bcrypt.hash(passwordToSet, 10)

    if (org.ownerEmail) {
      await prisma.user.upsert({
        where: { email: org.ownerEmail },
        update: { passwordHash },
        create: {
          email: org.ownerEmail,
          passwordHash,
          role: "ADMIN",
          firstName: org.ownerName?.split(" ")[0] || "Garage",
          lastName: org.ownerName?.split(" ").slice(1).join(" ") || "Owner",
          status: "ACTIVE"
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: `Password updated successfully for ${org.name} (${org.ownerEmail})!`,
      newPassword: passwordToSet,
      ownerEmail: org.ownerEmail
    })
  } catch (error: any) {
    console.error("Partner reset password error:", error)
    return NextResponse.json({ error: error.message || "Failed to reset password" }, { status: 500 })
  }
}
