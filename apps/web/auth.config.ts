import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET || process.env.JWT_SECRET || "fallback-dev-secret-if-env-fails-12345",
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const { pathname } = nextUrl
      const isLoginPage = pathname === '/auth/login' 
        || pathname === '/portal' 
        || pathname === '/portal/' 
        || pathname === '/admin/login' 
        || pathname === '/reseller/login' 
        || pathname === '/login'

      const isLoggedIn = !!auth?.user
      const isOnDashboard = pathname.startsWith('/dashboard')
      const isOnPortalProtected = pathname.startsWith('/portal/') && pathname !== '/portal/'
      const isOnStudent = pathname.startsWith('/portal/student')
      const isOnClientPortal = isOnPortalProtected && !isOnStudent

      // Public pages (root split portal, landing pages, legal, etc.) are always freely accessible
      if (pathname === '/' || pathname === '' || pathname === '/garage' || pathname === '/agency' || pathname === '/academy') {
        return true
      }

      if (isLoggedIn) {
        // @ts-ignore
        const role = auth?.user?.role

        // Logged-in users on login pages: redirect to destination without bouncing
        if (isLoginPage) {
          if (role === 'CLIENT') {
            return Response.redirect(new URL('/portal/dashboard', nextUrl))
          } else if (role === 'STUDENT') {
            return Response.redirect(new URL('/portal/student', nextUrl))
          } else if (role === 'RESELLER_ADMIN' || role === 'PARTNER') {
            return Response.redirect(new URL('/dashboard/partner', nextUrl))
          } else {
            return Response.redirect(new URL('/dashboard', nextUrl))
          }
        }

        // Non-protected routes are allowed freely for logged in users
        const isProtectedRoute = isOnDashboard || isOnPortalProtected || isOnStudent
        if (!isProtectedRoute) {
          return true
        }

        if (role === 'CLIENT') {
          if (!isOnClientPortal) {
            return Response.redirect(new URL('/portal/dashboard', nextUrl))
          }
        } else if (role === 'STUDENT') {
          if (!isOnStudent) {
            return Response.redirect(new URL('/portal/student', nextUrl))
          }
        }
        return true
      }

      // Unauthenticated users trying to access protected dashboards
      if (isOnDashboard || isOnStudent) {
        if (pathname.startsWith('/dashboard/admin')) {
          return Response.redirect(new URL('/admin/login', nextUrl))
        }
        if (pathname.startsWith('/dashboard/reseller')) {
          return Response.redirect(new URL('/reseller/login', nextUrl))
        }
        // Redirect to login page on the SAME host to avoid cross-domain loop
        const loginUrl = new URL('/auth/login', nextUrl)
        loginUrl.searchParams.set('callbackUrl', pathname)
        return Response.redirect(loginUrl)
      }

      if (isOnClientPortal) {
        const portalUrl = new URL('/portal', nextUrl)
        portalUrl.searchParams.set('callbackUrl', pathname)
        return Response.redirect(portalUrl)
      }

      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
        token.customRole = (user as any).customRole
        token.permissions = (user as any).permissions
      }
      return token
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return url
      try {
        const u = new URL(url)
        if (u.hostname === "0.0.0.0" || u.hostname === "127.0.0.1" || u.hostname === "localhost" || u.port === "3005") {
          return u.pathname + u.search
        }
        return url
      } catch {
        return "/auth/login"
      }
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string
        session.user.id = token.id as string
        ;(session.user as any).customRole = token.customRole
        ;(session.user as any).permissions = token.permissions || []
      }
      return session
    }
  },
  providers: [],
} satisfies NextAuthConfig
