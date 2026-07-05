import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import * as OTPAuth from "otpauth"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  debug: true,
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET || "fallback-dev-secret-if-env-fails-12345",
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        code: { label: "Code", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        // E2E Test Backdoor (Strictly Guarded)
        if (process.env.PLAYWRIGHT_TEST_BACKDOOR === 'true') {
          if (credentials.email === 'superadmin@test.com') return { id: 'test-1', name: 'Test Admin', email: 'superadmin@test.com', role: 'SUPER_ADMIN', customRole: null, permissions: [] };
          if (credentials.email === 'student@test.com') return { id: 'test-2', name: 'Test Student', email: 'student@test.com', role: 'STUDENT', customRole: null, permissions: [] };
          if (credentials.email === 'client@test.com') return { id: 'test-3', name: 'Test Client', email: 'client@test.com', role: 'CLIENT', customRole: null, permissions: [] };
          if (credentials.email === 'vendor@test.com') return { id: 'test-4', name: 'Test Vendor', email: 'vendor@test.com', role: 'VENDOR', customRole: null, permissions: [] };
          if (credentials.email === 'educator@test.com') return { id: 'test-5', name: 'Test Educator', email: 'educator@test.com', role: 'EDUCATOR', customRole: null, permissions: [] };
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: {
            customRole: {
              include: { permissions: true }
            }
          }
        });
        
        if (!user || !user.passwordHash) return null;
        
        let passwordsMatch = await bcrypt.compare(credentials.password as string, user.passwordHash);
        
        if (!passwordsMatch) return null;

        // Verify Two-Factor Authentication if enabled
        if (user.twoFaEnabled) {
          const code = credentials.code as string;
          if (!code) {
            throw new Error("2FA_REQUIRED");
          }

          const totp = new OTPAuth.TOTP({
            issuer: 'Grekam OS',
            label: user.email,
            algorithm: 'SHA1',
            digits: 6,
            period: 30,
            secret: OTPAuth.Secret.fromBase32(user.twoFaSecret as string),
          });

          const delta = totp.validate({ token: code, window: 1 });
          if (delta === null) {
            // Check backup codes
            let backupCodes: string[] = [];
            try {
              backupCodes = JSON.parse(user.twoFaBackupCodes as string || '[]');
            } catch {}
            const backupIndex = backupCodes.indexOf(code);
            if (backupIndex !== -1) {
              backupCodes.splice(backupIndex, 1);
              await prisma.user.update({
                where: { id: user.id },
                data: { twoFaBackupCodes: JSON.stringify(backupCodes) }
              });
            } else {
              throw new Error("2FA_INVALID");
            }
          }
        }

        return { 
          id: user.id, 
          name: `${user.firstName} ${user.lastName}`, 
          email: user.email, 
          role: user.role,
          customRole: user.customRole ? user.customRole.name : null,
          permissions: user.customRole ? user.customRole.permissions.map(p => p.resource) : []
        };
      }
    })
  ],
  callbacks: {
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
  }
})
