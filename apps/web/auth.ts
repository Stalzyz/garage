import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import * as OTPAuth from "otpauth"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  cookies: {
    // Do NOT reintroduce the "__Secure-" prefix here. A __Secure- cookie that
    // also carries a Domain attribute is rejected outright by browsers, so the
    // session was never stored and every authenticated call came back 401.
    // The plain name is valid with domain set, and apps/api accepts it: it is
    // listed in SESSION_COOKIE_NAMES alongside the __Secure- variant.
    sessionToken: {
      name: "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" ? ".grekam.in" : undefined,
      },
    },
  },
  debug: true,
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
        
        // status is part of the lookup, not a post-hoc check: SUSPENDED,
      // INACTIVE and PENDING accounts must never reach the password comparison.
      // Without this, disabling an account had no effect on sign-in.
      // Case-insensitive lookup: seeded super admin email is stored as
      // `Admin@grekam.in`, and users type whatever casing they registered
      // with. A case-sensitive match made `Admin@grekam.in` / `Admin@grekam.com`
      // silently fall through to "Invalid credentials".
      const email = (credentials.email as string).trim().toLowerCase();
      const user = await prisma.user.findFirst({
        where: { email: { equals: email, mode: "insensitive" }, status: "ACTIVE" },
        include: { customRole: { include: { permissions: true } } }
        });

        if (!user || !user.passwordHash) return null;

        const passwordsMatch = await bcrypt.compare(credentials.password as string, user.passwordHash);
        if (!passwordsMatch) return null;


        // Option B: Enforce Separated Portals (Agency OS Only)
        if (user.role === 'STUDENT' || user.role === 'EDUCATOR') {
          throw new Error("Access Denied: Please log in via the Academy portal.");
        }

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
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email, 
          email: user.email, 
          role: user.role,
          organizationId: user.organizationId || null,
          activeTenantId: user.activeTenantId || null,
          workspaceId: user.workspaceId || null,
          mustChangePassword: (user as any).mustChangePassword ?? false,
          customRole: user.customRole ? user.customRole.name : null,
          permissions: user.customRole ? user.customRole.permissions.map((p: any) => p.resource) : []
        };

      }
    })
  ]
})
