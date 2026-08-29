import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

const authMiddleware = NextAuth(authConfig).auth

export default function middleware(req: any) {
  if (process.env.PLAYWRIGHT_TEST_BACKDOOR === 'true') {
    return NextResponse.next();
  }
  return authMiddleware(req);
}

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}
