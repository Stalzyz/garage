import type { NextAuthConfig } from "next-auth"

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard')
      const isOnPortal = nextUrl.pathname.startsWith('/portal')
      
      if (isOnDashboard || isOnPortal) {
        if (isLoggedIn) return true
        return false // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        if (nextUrl.pathname.startsWith('/auth/login') || nextUrl.pathname === '/') {
          // @ts-ignore
          const role = auth?.user?.role;
          if (role === 'CLIENT') {
            return Response.redirect(new URL('/portal', nextUrl));
          } else if (role === 'STUDENT') {
            return Response.redirect(new URL('/dashboard/student/certificates', nextUrl));
          }
          return Response.redirect(new URL('/dashboard', nextUrl));
        }
      }
      return true
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig
