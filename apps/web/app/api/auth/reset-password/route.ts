import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { createHash, timingSafeEqual } from "crypto"

const RESET_TTL_MS = 15 * 60 * 1000 // 15 minutes
const MIN_PASSWORD_LENGTH = 12

/**
 * Consumes a password-reset token and sets a new password.
 *
 * The token is single-use, short-lived, and compared in constant time. Only the
 * SHA-256 hash is ever stored (see PasswordResetToken), so this endpoint cannot
 * be replayed and a database read does not reveal a live reset capability.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const token = typeof body?.token === "string" ? body.token.trim() : ""
    const newPassword = typeof body?.newPassword === "string" ? body.newPassword : ""

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "token and newPassword are required." },
        { status: 400 }
      )
    }

    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json(
        { error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` },
        { status: 400 }
      )
    }

    const tokenHash = createHash("sha256").update(token).digest("hex")
    const expected = Buffer.from(tokenHash, "hex")

    const record = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true, status: true } } },
    })

    // Uniform failure for unknown / already-used / wrong token so the endpoint
    // does not reveal whether a token ever existed.
    const invalid = NextResponse.json(
      { error: "This reset link is invalid or has expired. Please request a new one." },
      { status: 400 }
    )

    if (!record) return invalid

    const actual = Buffer.from(record.tokenHash, "hex")
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      return invalid
    }

    if (record.usedAt || record.expiresAt.getTime() < Date.now()) {
      return invalid
    }

    // A suspended or deactivated account must not be recoverable.
    if (record.user.status === "SUSPENDED" || record.user.status === "INACTIVE") {
      return NextResponse.json(
        { error: "This account is not active. Contact support." },
        { status: 403 }
      )
    }

    const newHash = await bcrypt.hash(newPassword, 12)

    // Claim the token and set the password together. If two requests race, the
    // updateMany matches zero rows for the loser and it falls through to `invalid`.
    const claimed = await prisma.passwordResetToken.updateMany({
      where: { id: record.id, usedAt: null },
      data: { usedAt: new Date() },
    })

    if (claimed.count !== 1) return invalid

    await prisma.user.update({
      where: { id: record.user.id },
      data: { passwordHash: newHash },
    })

    // Force re-login everywhere: a reset must not leave old sessions alive.
    await prisma.session.deleteMany({ where: { userId: record.user.id } }).catch(() => {})

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Failed to reset password." }, { status: 500 })
  }
}