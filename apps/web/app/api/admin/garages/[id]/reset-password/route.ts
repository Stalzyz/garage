import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/require-admin"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  try {
    const role = guard.session!.user.role

    if (role !== "SUPER_ADMIN" && role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Super Admin access required." }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json().catch(() => ({}))
    const { newPassword } = body

    const passwordToSet = newPassword && newPassword.trim() ? newPassword.trim() : `Garage@${Math.floor(1000 + Math.random() * 9000)}!`
    const passwordHash = await bcrypt.hash(passwordToSet, 10)

    // Try finding tenant or organization or user by id
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: { members: { include: { user: true } } }
    })

    let targetEmail = ""

    if (tenant && tenant.members.length > 0) {
      const user = tenant.members[0].user
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash }
      })
      targetEmail = user.email
    } else {
      // Check if ID is user ID or organization
      const org = await prisma.organization.findUnique({ where: { id } })
      if (org && org.ownerEmail) {
        const user = await prisma.user.findUnique({ where: { email: org.ownerEmail } })
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash }
          })
          targetEmail = user.email
        }
      } else {
        const user = await prisma.user.findUnique({ where: { id } })
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash }
          })
          targetEmail = user.email
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Password reset successfully for ${targetEmail || "garage"}!`,
      newPassword: passwordToSet,
      targetEmail
    })
  } catch (error: any) {
    console.error("Admin reset password error:", error)
    return NextResponse.json({ error: error.message || "Failed to reset password" }, { status: 500 })
  }
}
