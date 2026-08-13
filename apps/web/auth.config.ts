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
      const isOnPortalProtected = nextUrl.pathname.startsWith('/portal/') && nextUrl.pathname !== '/portal/'
      const isOnStudent = nextUrl.pathname.startsWith('/portal/student')
      const isOnClientPortal = isOnPortalProtected && !isOnStudent

      if (isLoggedIn) {
        // @ts-ignore
        const role = auth?.user?.role;

        if (role === 'CLIENT') {
          // Clients should only access /portal/* (except student portal and login page /portal)
          if (!isOnClientPortal) {
            return Response.redirect(new URL('/portal/dashboard', nextUrl));
          }
        } else if (role === 'STUDENT') {
          // Students should only access /portal/student/*
          if (!isOnStudent) {
            return Response.redirect(new URL('/portal/student', nextUrl));
          }
        } else {
          // Staff/Admin should only access /dashboard/*
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
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig
