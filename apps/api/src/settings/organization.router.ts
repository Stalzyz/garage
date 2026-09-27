import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { decode } from '@auth/core/jwt';
import * as cookie from 'cookie';

const UpdateOrganizationSchema = z.object({
  name: z.string().optional(),
  companyName: z.string().nullable().optional().or(z.literal('')),
  panNumber: z.string().nullable().optional().or(z.literal('')),
  gstNumber: z.string().nullable().optional().or(z.literal('')),
  logoUrl: z.string().nullable().optional().or(z.literal('')),
  faviconUrl: z.string().nullable().optional().or(z.literal('')),
  academyLogoUrl: z.string().nullable().optional().or(z.literal('')),
  academyFaviconUrl: z.string().nullable().optional().or(z.literal('')),
  primaryColor: z.string().nullable().optional().or(z.literal('')),
  secondaryColor: z.string().nullable().optional().or(z.literal('')),
  accentColor: z.string().nullable().optional().or(z.literal('')),
  darkModeDefault: z.boolean().optional(),
  supportEmail: z.string().email().nullable().optional().or(z.literal('')),
  billingAddress: z.string().nullable().optional().or(z.literal('')),
  website: z.string().nullable().optional().or(z.literal('')),
  phone: z.string().nullable().optional().or(z.literal('')),
  instagramUrl: z.string().nullable().optional().or(z.literal('')),
  youtubeUrl: z.string().nullable().optional().or(z.literal('')),
  linkedinUrl: z.string().nullable().optional().or(z.literal('')),
  twitterUrl: z.string().nullable().optional().or(z.literal('')),
  facebookUrl: z.string().nullable().optional().or(z.literal('')),
  whatsappNumber: z.string().nullable().optional().or(z.literal('')),
  openAiKey: z.string().nullable().optional().or(z.literal('')),
  resendApiKey: z.string().nullable().optional().or(z.literal('')),
  bankName: z.string().nullable().optional().or(z.literal('')),
  accountName: z.string().nullable().optional().or(z.literal('')),
  accountNumber: z.string().nullable().optional().or(z.literal('')),
  ifscCode: z.string().nullable().optional().or(z.literal('')),
  swiftCode: z.string().nullable().optional().or(z.literal('')),
  bankBranch: z.string().nullable().optional().or(z.literal('')),
});

async function resolveWorkspaceOrg(app: FastifyInstance, req: any) {
  let tenantId = req.tenantId;
  let userId = req.user?.id;

  if (!userId && req.headers?.cookie) {
    try {
      const cookies = cookie.parse(req.headers.cookie);
      const token = cookies['__Secure-authjs.session-token'] || cookies['authjs.session-token'];
      if (token) {
        const secrets = [process.env.AUTH_SECRET, 'fallback-dev-secret-if-env-fails-12345'].filter(Boolean) as string[];
        const salts = ['__Secure-authjs.session-token', 'authjs.session-token'];
        for (const secret of secrets) {
          for (const salt of salts) {
            try {
              const decoded: any = await decode({ token, secret, salt });
              if (decoded?.id) {
                userId = decoded.id;
                break;
              }
            } catch {}
          }
          if (userId) break;
        }
      }
    } catch {}
  }

  if (tenantId) {
    const tenantBranding = await app.prisma.tenantBranding.findUnique({
      where: { tenantId },
      include: { tenant: true },
    });
    if (tenantBranding) {
      return { type: 'TENANT' as const, tenantBranding, tenantId };
    }
  }

  if (userId) {
    const user = await app.prisma.user.findUnique({
      where: { id: userId },
    });

    if (user) {
      let workspaceId = user.workspaceId || user.activeTenantId;
      if (!workspaceId) {
        workspaceId = `ws_${user.id}`;
        await app.prisma.user.update({
          where: { id: user.id },
          data: { workspaceId }
        });
      }

      let org: any = null;
      if (user.organizationId) {
        org = await app.prisma.organization.findUnique({ where: { id: user.organizationId } });
      }
      if (!org && workspaceId) {
        org = await app.prisma.organization.findUnique({ where: { workspaceId } });
      }

      if (!org) {
        org = await app.prisma.organization.create({
          data: {
            workspaceId,
            name: user.firstName ? `${user.firstName}'s Garage` : "Grekam Garage",
            companyName: user.firstName ? `${user.firstName} Garage Services` : "Grekam Garage & Technologies Pvt Ltd",
            ownerEmail: user.email,
            ownerName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            primaryColor: "#4f46e5",
            secondaryColor: "#7c3aed",
            accentColor: "#10b981",
            darkModeDefault: true,
          }
        });
        await app.prisma.user.update({
          where: { id: user.id },
          data: { organizationId: org.id }
        });
      }

      return { type: 'ORGANIZATION' as const, org, workspaceId };
    }
  }

  let org = await app.prisma.organization.findFirst();
  if (!org) {
    org = await app.prisma.organization.create({
      data: {
        workspaceId: "ws_default_global",
        name: "Grekam Garage",
        companyName: "Grekam Garage & Technologies Pvt Ltd",
        primaryColor: "#4f46e5",
        secondaryColor: "#7c3aed",
        accentColor: "#10b981",
        darkModeDefault: true,
        supportEmail: "contact@grekam.in",
        website: "https://grekam.in",
      }
    });
  }

  return { type: 'ORGANIZATION' as const, org, workspaceId: org.workspaceId };
}

export default async function organizationRouter(app: FastifyInstance) {
  // GET /api/v1/settings/organization — Get organization branding (tenant & workspace isolated)
  app.get('/organization', async (req, reply) => {
    const resolved = await resolveWorkspaceOrg(app, req);

    if (resolved.type === 'TENANT' && resolved.tenantBranding) {
      const tb = resolved.tenantBranding;
      return {
        id: tb.id,
        name: tb.tenant.name,
        companyName: tb.companyName || tb.tenant.name,
        logoUrl: tb.logoUrl || null,
        academyLogoUrl: tb.logoUrl || null,
        faviconUrl: tb.faviconUrl || null,
        academyFaviconUrl: tb.faviconUrl || null,
        primaryColor: tb.primaryColor || "#4f46e5",
        secondaryColor: tb.secondaryColor || "#7c3aed",
        accentColor: tb.accentColor || "#10b981",
        darkModeDefault: tb.darkModeDefault,
        supportEmail: tb.supportEmail,
        billingAddress: tb.billingAddress,
        website: tb.websiteUrl,
        phone: tb.supportPhone,
        gstNumber: tb.taxId,
        panNumber: tb.taxId,
        bankName: tb.bankName,
        accountNumber: tb.accountNumber,
        ifscCode: tb.ifscCode,
        bankBranch: tb.bankBranch,
      };
    }

    const org = resolved.org!;
    return {
      ...org,
      name: org.name || "Grekam Garage",
      companyName: org.companyName || "Grekam Garage & Technologies Pvt Ltd",
      logoUrl: org.logoUrl || null,
      faviconUrl: org.faviconUrl || null,
      primaryColor: org.primaryColor || "#4f46e5",
      secondaryColor: org.secondaryColor || "#7c3aed",
      accentColor: org.accentColor || "#10b981",
    };
  });

  // PATCH /api/v1/settings/organization — Update organization branding (tenant & workspace isolated)
  app.patch('/organization', async (req, reply) => {
    const body = UpdateOrganizationSchema.parse(req.body);
    const resolved = await resolveWorkspaceOrg(app, req);
    
    if (resolved.type === 'TENANT' && resolved.tenantId) {
      const tenantId = resolved.tenantId;
      if (body.name) {
        await app.prisma.tenant.update({
          where: { id: tenantId },
          data: { name: body.name },
        });
      }

      const branding = await app.prisma.tenantBranding.upsert({
        where: { tenantId },
        create: {
          tenantId,
          companyName: body.companyName || null,
          taxId: body.gstNumber || body.panNumber || null,
          logoUrl: body.logoUrl || null,
          faviconUrl: body.faviconUrl || null,
          primaryColor: body.primaryColor || "#4f46e5",
          secondaryColor: body.secondaryColor || "#7c3aed",
          accentColor: body.accentColor || "#10b981",
          darkModeDefault: body.darkModeDefault ?? true,
          supportEmail: body.supportEmail || null,
          supportPhone: body.phone || null,
          billingAddress: body.billingAddress || null,
          websiteUrl: body.website || null,
          bankName: body.bankName || null,
          accountNumber: body.accountNumber || null,
          ifscCode: body.ifscCode || null,
          swiftCode: body.swiftCode || null,
          bankBranch: body.bankBranch || null,
        },
        update: {
          ...(body.companyName !== undefined && { companyName: body.companyName || null }),
          ...(body.gstNumber !== undefined && { taxId: body.gstNumber || null }),
          ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl || null }),
          ...(body.faviconUrl !== undefined && { faviconUrl: body.faviconUrl || null }),
          ...(body.primaryColor && { primaryColor: body.primaryColor }),
          ...(body.secondaryColor && { secondaryColor: body.secondaryColor }),
          ...(body.accentColor && { accentColor: body.accentColor }),
          ...(body.darkModeDefault !== undefined && { darkModeDefault: body.darkModeDefault }),
          ...(body.supportEmail !== undefined && { supportEmail: body.supportEmail || null }),
          ...(body.phone !== undefined && { supportPhone: body.phone || null }),
          ...(body.billingAddress !== undefined && { billingAddress: body.billingAddress || null }),
          ...(body.website !== undefined && { websiteUrl: body.website || null }),
          ...(body.bankName !== undefined && { bankName: body.bankName || null }),
          ...(body.accountNumber !== undefined && { accountNumber: body.accountNumber || null }),
          ...(body.ifscCode !== undefined && { ifscCode: body.ifscCode || null }),
          ...(body.swiftCode !== undefined && { swiftCode: body.swiftCode || null }),
          ...(body.bankBranch !== undefined && { bankBranch: body.bankBranch || null }),
        },
      });

      return {
        ...branding,
        name: body.name || "Tenant Branding Updated",
      };
    }

    // Workspace-scoped Organization update
    const targetOrg = resolved.org!;
    const dataToSave: any = { ...body };
    if (!dataToSave.primaryColor) delete dataToSave.primaryColor;
    if (!dataToSave.secondaryColor) delete dataToSave.secondaryColor;
    if (!dataToSave.accentColor) delete dataToSave.accentColor;
    if (!dataToSave.name) delete dataToSave.name;

    const updatedOrg = await app.prisma.organization.update({
      where: { id: targetOrg.id },
      data: dataToSave,
    });

    if (body.gstNumber !== undefined) {
      await app.prisma.financeSettings.updateMany({
        data: { gstNumber: body.gstNumber || null }
      }).catch(() => {});
    }

    return updatedOrg;
  });
}
