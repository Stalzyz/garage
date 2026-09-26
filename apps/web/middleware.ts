import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const { pathname } = req.nextUrl
  const hostname = req.headers.get("host") || ""

  // Extract subdomain or custom domain for multi-tenant routing
  const hostWithoutPort = hostname.split(":")[0].toLowerCase()
  let tenantSlug: string | null = null
  let isCustomDomain = false

  const rootDomains = ["grekam.in", "app.grekam.in", "localhost", "127.0.0.1"]
  const isRoot = rootDomains.includes(hostWithoutPort)

  if (!isRoot) {
    if (hostWithoutPort.endsWith(".grekam.in")) {
      const sub = hostWithoutPort.replace(".grekam.in", "")
      if (sub && sub !== "www" && sub !== "app" && sub !== "admin") {
        tenantSlug = sub
      }
    } else if (hostWithoutPort.endsWith(".localhost")) {
      tenantSlug = hostWithoutPort.replace(".localhost", "")
    } else {
      isCustomDomain = true
    }
  }

  const requestHeaders = new Headers(req.headers)
  if (tenantSlug) {
    requestHeaders.set("x-tenant-slug", tenantSlug)
  }
  if (isCustomDomain) {
    requestHeaders.set("x-custom-domain", hostWithoutPort)
  }

  const isLoggedIn = !!req.auth?.user
  const isOnDashboard = pathname.startsWith('/dashboard')
  const isOnPortalProtected = pathname.startsWith('/portal/') && pathname !== '/portal/'
  const isOnStudent = pathname.startsWith('/portal/student')
  const isOnClientPortal = isOnPortalProtected && !isOnStudent
  const isLoginPage = pathname === '/auth/login' 
    || pathname === '/portal' 
    || pathname === '/portal/' 
    || pathname === '/admin/login' 
    || pathname === '/reseller/login' 
    || pathname === '/login'

  // 1. Unauthenticated users trying to access protected areas
  if (!isLoggedIn) {
    if (isOnDashboard || isOnStudent) {
      let targetLogin = '/auth/login'
      if (pathname.startsWith('/dashboard/admin')) {
        targetLogin = '/admin/login'
      } else if (pathname.startsWith('/dashboard/reseller')) {
        targetLogin = '/reseller/login'
      }
      const loginUrl = new URL(targetLogin, req.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (isOnClientPortal) {
      const portalLoginUrl = new URL('/portal', req.url)
      portalLoginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(portalLoginUrl)
    }
  } else {
    // 2. Logged-in users visiting login pages
    const role = (req.auth?.user as any)?.role
    if (isLoginPage) {
      if (role === 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/admin/dashboard', req.url))
      } else if (role === 'RESELLER_ADMIN') {
        return NextResponse.redirect(new URL('/dashboard/reseller', req.url))
      } else if (role === 'CLIENT') {
        return NextResponse.redirect(new URL('/portal/dashboard', req.url))
      } else if (role === 'STUDENT') {
        return NextResponse.redirect(new URL('/portal/student', req.url))
      } else {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // 3. Role-based route confinement
    if (role === 'CLIENT' && (isOnDashboard || isOnStudent)) {
      return NextResponse.redirect(new URL('/portal/dashboard', req.url))
    }
    if (role === 'STUDENT' && (isOnDashboard || isOnClientPortal)) {
      return NextResponse.redirect(new URL('/portal/student', req.url))
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
})

export const config = {
  // Protect all routes except static assets and API routes
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.svg$|.*\\.ico$|.*\\.mp3$).*)'],
}
