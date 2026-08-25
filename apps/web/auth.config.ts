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
      // 1. Root split-screen landing page (/) MUST always be accessible without redirection
      if (nextUrl.pathname === '/' || nextUrl.pathname === '') {
        return true;
      }

      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isOnPortalProtected = nextUrl.pathname.startsWith('/portal/') && nextUrl.pathname !== '/portal/'
      const isOnStudent = nextUrl.pathname.startsWith('/portal/student')
      const isOnClientPortal = isOnPortalProtected && !isOnStudent

      const isLoginPage = nextUrl.pathname === '/auth/login' || nextUrl.pathname === '/portal' || nextUrl.pathname === '/portal/'

      if (isLoggedIn) {
        // @ts-ignore
        const role = auth?.user?.role;

        // Logged in users visiting login pages should be sent to their dashboard
        if (isLoginPage) {
          if (role === 'CLIENT') {
            return Response.redirect(new URL('/portal/dashboard', nextUrl));
          } else if (role === 'STUDENT') {
            return Response.redirect(new URL('/portal/student', nextUrl));
          } else {
            return Response.redirect(new URL('/dashboard', nextUrl));
          }
        }

        // Allow logged in users to access public pages (e.g. /contact, /academy, /verify) freely
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

      // Unauthenticated users
      if (isOnDashboard || isOnStudent) {
        return false; // Redirect to /auth/login
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
