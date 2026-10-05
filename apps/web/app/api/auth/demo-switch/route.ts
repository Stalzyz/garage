import { NextResponse } from "next/server"
import { encode } from "next-auth/jwt"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const role = searchParams.get("role")

  // Strict security check: Super Admin or arbitrary roles are NEVER permitted
  if (role === "SUPER_ADMIN" || role === "superadmin") {
    return NextResponse.json(
      { error: "Forbidden: Super Admin cannot be accessed via demo switch" },
      { status: 403 }
    )
  }

  if (role !== "RESELLER_ADMIN" && role !== "GARAGE_CUSTOMER") {
    return NextResponse.redirect(new URL("/dashboard", "https://garage.grekam.in"))
  }

  const secret = process.env.AUTH_SECRET || process.env.JWT_SECRET || "fallback-dev-secret-if-env-fails-12345"
  const isProd = process.env.NODE_ENV === "production"

  // Determine correct public host and protocol (prevent 0.0.0.0:3005 internal binding leaks)
  const rawHost = request.headers.get("x-forwarded-host") || request.headers.get("host") || "garage.grekam.in"
  const host = (rawHost.includes("0.0.0.0") || rawHost.includes("127.0.0.1") || rawHost.includes(":3005")) 
    ? "garage.grekam.in" 
    : rawHost
  const proto = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https")

  let tokenData: any
  let targetPath: string

  if (role === "RESELLER_ADMIN") {
    tokenData = {
      id: "demo-reseller-id",
      name: "Demo Reseller Partner",
      email: "reseller@grekam.com",
      role: "RESELLER_ADMIN",
      customRole: null,
      permissions: [],
      sub: "demo-reseller-id",
    }
    targetPath = "/dashboard/partner"
  } else {
    tokenData = {
      id: "demo-garage-user-id",
      name: "Demo Garage Owner",
      email: "demo@garage.in",
      role: "ADMIN",
      customRole: null,
      permissions: [],
      sub: "demo-garage-user-id",
    }
    targetPath = "/dashboard"
  }

  const redirectUrl = `${proto}://${host}${targetPath}`
  const response = NextResponse.redirect(redirectUrl)

  const cookieNames = [
    "__Secure-authjs.session-token",
    "authjs.session-token",
  ]

  const isGrekamDomain = host.endsWith("grekam.in")

  for (const cookieName of cookieNames) {
    const encodedToken = await encode({
      token: tokenData,
      secret,
      salt: cookieName,
    })

    // Set host-level cookie
    response.cookies.set({
      name: cookieName,
      value: encodedToken,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: isProd,
      maxAge: 30 * 24 * 60 * 60,
    })

    // If on grekam.in domain, also set shared .grekam.in cookie
    if (isGrekamDomain) {
      response.cookies.set({
        name: cookieName,
        value: encodedToken,
        domain: ".grekam.in",
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProd,
        maxAge: 30 * 24 * 60 * 60,
      })
    }
  }

  return response
}
