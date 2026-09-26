import NextAuth from "next-auth"
import { authConfig } from "./src/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const host = req.headers.get("host") || ""
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth?.user

  // 1. Domain-specific root routing
  if (host.includes("agency.grekam.in") && pathname === "/") {
    return NextResponse.rewrite(new URL("/agency", req.url))
  }

  if (host.includes("dashboard.grekam.in") && pathname === "/") {
    if (!isLoggedIn) {
      const loginUrl = new URL("https://agency.grekam.in/auth/login")
      loginUrl.searchParams.set("callbackUrl", "https://dashboard.grekam.in")
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.rewrite(new URL("/dashboard", req.url))
  }

  const isOnDashboard = pathname.startsWith('/dashboard')
  const isOnPortalProtected = pathname.startsWith('/portal/') && pathname !== '/portal/'
  const isOnStudent = pathname.startsWith('/portal/student')
  const isOnClientPortal = isOnPortalProtected && !isOnStudent
  const isLoginPage = pathname === '/auth/login' || pathname === '/portal' || pathname === '/portal/'

  // 2. Unauthenticated users trying to access protected areas
  if (!isLoggedIn) {
    if (isOnDashboard || isOnStudent) {
      const loginUrl = new URL("https://agency.grekam.in/auth/login")
      loginUrl.searchParams.set("callbackUrl", req.url)
      return NextResponse.redirect(loginUrl)
    }
    if (isOnClientPortal) {
      const portalLoginUrl = new URL('/portal', req.url)
      portalLoginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(portalLoginUrl)
    }
  } else {
    // 3. Logged-in users visiting login pages
    const role = (req.auth?.user as any)?.role
    if (isLoginPage) {
      if (role === 'CLIENT') {
        return NextResponse.redirect(new URL('/portal/dashboard', req.url))
      } else if (role === 'STUDENT') {
        return NextResponse.redirect(new URL('/portal/student', req.url))
      } else {
        return NextResponse.redirect(new URL('https://dashboard.grekam.in', req.url))
      }
    }

    // 4. Role-based route confinement
    if (role === 'CLIENT' && (isOnDashboard || isOnStudent)) {
      return NextResponse.redirect(new URL('/portal/dashboard', req.url))
    }
    if (role === 'STUDENT' && (isOnDashboard || isOnClientPortal)) {
      return NextResponse.redirect(new URL('/portal/student', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  // Protect all routes except static assets and API routes
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.ico$|.*\\.mp3$).*)'],
}
