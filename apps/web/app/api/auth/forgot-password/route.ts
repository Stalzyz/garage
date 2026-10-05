import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { randomBytes, createHash } from "crypto"

const RESET_TTL_MS = 15 * 60 * 1000 // 15 minutes
const MAX_REQUESTS_PER_EMAIL = 3
const MAX_REQUESTS_PER_IP = 10

// In-memory rate limit. Sufficient for a single instance; move to Redis if the
// API is ever scaled horizontally, otherwise the caps reset per instance.
const hits = new Map<string, { count: number; firstAt: number }>()

function rateLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = hits.get(key)
  if (!entry || now - entry.firstAt > windowMs) {
    hits.set(key, { count: 1, firstAt: now })
    return false
  }
  entry.count += 1
  return entry.count > max
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : ""

    // Deliberately generic: the same response whether or not the account
    // exists, so this endpoint cannot be used to enumerate users.
    const GENERIC = NextResponse.json({
      success: true,
      message: "If an account exists for that email, a reset link is on its way.",
    })

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 })
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown"
    if (rateLimited(`ip:${ip}`, MAX_REQUESTS_PER_IP, 60 * 60 * 1000)) {
      return NextResponse.json({ error: "Too many reset requests. Try again later." }, { status: 429 })
    }
    if (rateLimited(`email:${email}`, MAX_REQUESTS_PER_EMAIL, RESET_TTL_MS)) {
      return NextResponse.json({ error: "Too many reset requests. Try again later." }, { status: 429 })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, status: true },
    })

    // Suspended/inactive accounts can request a reset but cannot be recovered.
    if (!user || user.status === "SUSPENDED" || user.status === "INACTIVE") {
      return GENERIC
    }

    // Raw token is returned ONLY in the emailed link and never stored or sent
    // back to the caller.
    const rawToken = randomBytes(32).toString("base64url")
    const tokenHash = createHash("sha256").update(rawToken).digest("hex")
    const expiresAt = new Date(Date.now() + RESET_TTL_MS)

    // Invalidate any outstanding tokens so only the newest link works.
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    })

    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    })

    // Resolve the public origin. Previously this was
    // `NEXT_PUBLIC_SITE_URL || "http://localhost:3000"`, which silently produced
    // a dead reset link whenever the env var was unset — and the app does not
    // run on :3000 (dev binds :8888), so the fallback was wrong even locally.
    // Prefer the env var, then the forwarded/proto headers, then the Host header.
    const forwardedHost = req.headers.get("x-forwarded-host")
    const host = forwardedHost || req.headers.get("host")
    const proto =
      req.headers.get("x-forwarded-proto") ||
      (host?.startsWith("localhost") || host?.startsWith("127.0.0.1") ? "http" : "https")
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
      (host ? `${proto}://${host}` : "")

    if (!baseUrl) {
      // Better to log loudly than email a link to nowhere.
      console.error(
        "[forgot-password] cannot build reset URL: no NEXT_PUBLIC_SITE_URL and no Host header"
      )
      return GENERIC
    }

    const resetUrl = `${baseUrl}/auth/reset-password?token=${encodeURIComponent(rawToken)}`

    try {
      const { sendEmail } = await import("@/lib/email")
      await sendEmail({
        to: email,
        subject: "Reset your Grekam password",
        html: `<p>We received a request to reset your password.</p>
               <p><a href="${resetUrl}">Choose a new password</a></p>
               <p>This link expires in ${Math.floor(RESET_TTL_MS / 60000)} minutes and can be used once.
               If you did not request this, you can ignore this email.</p>`,
      })
    } catch (e) {
      // Never fail the request on delivery error — but do not tell the caller
      // the token either. Log loudly so a broken mailer is visible.
      console.error("[forgot-password] failed to send reset email:", e)
    }

    return GENERIC
  } catch (error: any) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Failed to process recovery request." }, { status: 500 })
  }
}
