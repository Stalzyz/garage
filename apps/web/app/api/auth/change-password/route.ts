import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.email && !session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized. Please log in first." }, { status: 401 })
    }

    const { currentPassword, newPassword } = await req.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current password and new password are required." }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "New password must be at least 6 characters long." }, { status: 400 })
    }

    // Lookup user in database
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: session.user.id },
          { email: session.user.email || "" }
        ]
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User account not found." }, { status: 404 })
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isMatch) {
      return NextResponse.json({ error: "Incorrect current password." }, { status: 400 })
    }

    // Hash new password and save
    const newHash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash }
    })

    return NextResponse.json({
      success: true,
      message: "Password changed successfully."
    })
  } catch (error: any) {
    console.error("Change password error:", error)
    return NextResponse.json({ error: error.message || "Failed to change password." }, { status: 500 })
  }
}
