import { FastifyInstance } from 'fastify';
import { z } from 'zod';

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

export default async function organizationRouter(app: FastifyInstance) {
  // GET /api/v1/settings/organization — Get organization branding (tenant-aware)
  app.get('/organization', async (req, reply) => {
    const tenantId = req.tenantId;

    if (tenantId) {
      const tenantBranding = await app.prisma.tenantBranding.findUnique({
        where: { tenantId },
        include: { tenant: true },
      });

      if (tenantBranding) {
        return {
          id: tenantBranding.id,
          name: tenantBranding.tenant.name,
          companyName: tenantBranding.companyName || tenantBranding.tenant.name,
          logoUrl: tenantBranding.logoUrl || null,
          academyLogoUrl: tenantBranding.logoUrl || null,
          faviconUrl: tenantBranding.faviconUrl || null,
          academyFaviconUrl: tenantBranding.faviconUrl || null,
          primaryColor: tenantBranding.primaryColor || "#4f46e5",
          secondaryColor: tenantBranding.secondaryColor || "#7c3aed",
          accentColor: tenantBranding.accentColor || "#10b981",
          darkModeDefault: tenantBranding.darkModeDefault,
          supportEmail: tenantBranding.supportEmail,
          billingAddress: tenantBranding.billingAddress,
          website: tenantBranding.websiteUrl,
          phone: tenantBranding.supportPhone,
          gstNumber: tenantBranding.taxId,
          panNumber: tenantBranding.taxId,
          bankName: tenantBranding.bankName,
          accountNumber: tenantBranding.accountNumber,
          ifscCode: tenantBranding.ifscCode,
          bankBranch: tenantBranding.bankBranch,
        };
      }
    }

    let org = await app.prisma.organization.findFirst();
    
    // Auto-seed default config if none exists
    if (!org) {
      org = await app.prisma.organization.create({
        data: {
          name: "Grekam Garage",
          companyName: "Grekam Garage & Technologies Pvt Ltd",
          logoUrl: null,
          faviconUrl: null,
          primaryColor: "#4f46e5",
          secondaryColor: "#7c3aed",
          accentColor: "#10b981",
          darkModeDefault: true,
          supportEmail: "contact@grekam.in",
          billingAddress: "Coimbatore, Tamil Nadu, India",
          website: "https://grekam.in",
          instagramUrl: "https://instagram.com/grekamvisuals",
          youtubeUrl: "https://youtube.com/@grekamvisuals",
          linkedinUrl: "https://linkedin.com/company/grekam",
        }
      });
    }

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

  // PATCH /api/v1/settings/organization — Update organization branding (tenant-aware)
  app.patch('/organization', async (req, reply) => {
    const body = UpdateOrganizationSchema.parse(req.body);
    const tenantId = req.tenantId;
    
    if (tenantId) {
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

    const dataToSave: any = { ...body };
    if (!dataToSave.primaryColor) delete dataToSave.primaryColor;
    if (!dataToSave.secondaryColor) delete dataToSave.secondaryColor;
    if (!dataToSave.accentColor) delete dataToSave.accentColor;
    if (!dataToSave.name) delete dataToSave.name;

    let org = await app.prisma.organization.findFirst();
    
    if (!org) {
      org = await app.prisma.organization.create({
        data: { name: "Grekam OS", ...dataToSave }
      });
    } else {
      org = await app.prisma.organization.update({
        where: { id: org.id },
        data: dataToSave,
      });
    }

    // Keep GST synchronized with FinanceSettings if provided
    if (body.gstNumber !== undefined) {
      await app.prisma.financeSettings.updateMany({
        data: { gstNumber: body.gstNumber || null }
      }).catch(() => {});
    }

    return org;
  });
}
