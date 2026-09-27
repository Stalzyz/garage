import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  trustHost: true,
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET || "fallback-dev-secret-if-env-fails-12345",
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      // 1. Landing pages and dedicated login pages MUST always be accessible without redirection for unauthenticated users
      const isLoginPage = nextUrl.pathname === '/auth/login' 
        || nextUrl.pathname === '/portal' 
        || nextUrl.pathname === '/portal/' 
        || nextUrl.pathname === '/admin/login' 
        || nextUrl.pathname === '/reseller/login' 
        || nextUrl.pathname === '/login'

      if (nextUrl.pathname === '/' || nextUrl.pathname === '' || isLoginPage) {
        if (!auth?.user) return true;
      }

      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isOnPortalProtected = nextUrl.pathname.startsWith('/portal/') && nextUrl.pathname !== '/portal/'
      const isOnStudent = nextUrl.pathname.startsWith('/portal/student')
      const isOnClientPortal = isOnPortalProtected && !isOnStudent

      if (isLoggedIn) {
        // @ts-ignore
        const role = auth?.user?.role;

        // Logged in users visiting login pages should be sent to their dashboard
        if (isLoginPage) {
          if (role === 'SUPER_ADMIN') {
            return Response.redirect(new URL('/dashboard/admin/dashboard', nextUrl));
          } else if (role === 'RESELLER_ADMIN') {
            return Response.redirect(new URL('/dashboard/reseller', nextUrl));
          } else if (role === 'CLIENT') {
            return Response.redirect(new URL('/portal/dashboard', nextUrl));
          } else if (role === 'STUDENT') {
            return Response.redirect(new URL('/portal/student', nextUrl));
          } else {
            return Response.redirect(new URL('/dashboard', nextUrl));
          }
        }

        // Allow logged in users to access public pages freely
        const isProtectedRoute = isOnDashboard || isOnPortalProtected || isOnStudent;
        if (!isProtectedRoute) {
          return true;
        }

        if (role === 'CLIENT') {
          if (!isOnClientPortal) {
            return Response.redirect(new URL('/portal/dashboard', nextUrl));
          }
        } else if (role === 'STUDENT') {
          if (!isOnStudent) {
            return Response.redirect(new URL('/portal/student', nextUrl));
          }
        } else {
          if (!isOnDashboard) {
            return Response.redirect(new URL('/dashboard', nextUrl));
          }
        }
        return true;
      }

      // Unauthenticated users trying to access protected dashboards
      if (isOnDashboard || isOnStudent) {
        if (nextUrl.pathname.startsWith('/dashboard/admin')) {
          return Response.redirect(new URL('/admin/login', nextUrl));
        }
        if (nextUrl.pathname.startsWith('/dashboard/reseller')) {
          return Response.redirect(new URL('/reseller/login', nextUrl));
        }
        return false; // Redirect to default /auth/login
      }
      if (isOnClientPortal) {
        return Response.redirect(new URL('/portal', nextUrl)); // Redirect to client login page
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
