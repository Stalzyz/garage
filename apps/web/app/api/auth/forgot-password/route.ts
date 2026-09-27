import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email } = body

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    if (!user) {
      // Don't leak whether email exists or not for safety, but return a helpful message
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, recovery instructions and passkey have been generated."
      })
    }

    // Generate a temporary recovery passkey
    const tempPassword = `Recovery@${Math.floor(100000 + Math.random() * 900000)}`
    const newHash = await bcrypt.hash(tempPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash }
    })

    return NextResponse.json({
      success: true,
      message: "Temporary access passkey generated successfully. Use this passkey to log in and change your password.",
      tempPassword,
      email: user.email
    })
  } catch (error: any) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: error.message || "Failed to recover password." }, { status: 500 })
  }
}
