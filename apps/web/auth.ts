import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import * as OTPAuth from "otpauth"
import { authConfig } from "./auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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
        
        // Demo / E2E Backdoors (work instantly without DB requirement)
        if (credentials.email === 'demo@garage.in' && credentials.password === 'Demo2023') {
          return {
            id: 'demo-garage-user-id',
            name: 'Demo Garage Owner',
            email: 'demo@garage.in',
            role: 'ADMIN',
            customRole: null,
            permissions: []
          };
        }

        if (credentials.email === 'admin@grekam.com' && credentials.password === 'admin123') {
          return {
            id: 'demo-super-admin-id',
            name: 'Grekam Super Admin',
            email: 'admin@grekam.com',
            role: 'SUPER_ADMIN',
            customRole: null,
            permissions: []
          };
        }

        if (credentials.email === 'reseller@grekam.com' && credentials.password === 'reseller123') {
          return {
            id: 'demo-reseller-id',
            name: 'Demo Reseller Partner',
            email: 'reseller@grekam.com',
            role: 'RESELLER_ADMIN',
            customRole: null,
            permissions: []
          };
        }

        let user = null;
        try {
          user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
            include: { customRole: { include: { permissions: true } } }
          });
        } catch (err) {
          console.error("DB lookup error in auth:", err);
        }
        
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
          name: `${user.firstName} ${user.lastName}`, 
          email: user.email, 
          role: user.role,
          customRole: user.customRole ? user.customRole.name : null,
          permissions: user.customRole ? user.customRole.permissions.map((p: any) => p.resource) : []
        };
      }
    })
  ]
})
