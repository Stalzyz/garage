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
  // GET /api/v1/settings/organization — Get the global organization branding
  app.get('/organization', async (req, reply) => {
    let org = await app.prisma.organization.findFirst();
    
    // Auto-seed default config if none exists
    if (!org) {
      org = await app.prisma.organization.create({
        data: {
          name: "Grekam Visuals",
          companyName: "Grekam Visuals & Technologies Pvt Ltd",
          logoUrl: "/visuals-logo.png",
          academyLogoUrl: "/academy-logo.png",
          faviconUrl: "/favicon.ico",
          academyFaviconUrl: "/favicon.ico",
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

    // Never return the two API-key columns in plaintext.
    //
    // Both are stored unencrypted on this row, so `...org` handed them to any
    // authenticated caller — the same class of leak as the payroll endpoints
    // closed earlier. They are also write-only from here: the UI that used to
    // echo them back (the duplicate Organization & Branding page) is gone, and
    // Resend should be configured under Settings > Integrations where it is
    // encrypted at rest. Signalled with a boolean so a caller can tell
    // "configured" from "absent" without learning the value.
    const { openAiKey, resendApiKey, ...safeOrg } = org;

    return {
      ...safeOrg,
      openAiKeyConfigured: Boolean(openAiKey && openAiKey.trim().length > 0),
      resendApiKeyConfigured: Boolean(resendApiKey && resendApiKey.trim().length > 0),
      name: org.name || "Grekam Visuals",
      companyName: org.companyName || "Grekam Visuals & Technologies Pvt Ltd",
      logoUrl: org.logoUrl || "/visuals-logo.png",
      academyLogoUrl: org.academyLogoUrl || "/academy-logo.png",
      faviconUrl: org.faviconUrl || "/favicon.ico",
      academyFaviconUrl: org.academyFaviconUrl || "/favicon.ico",
      primaryColor: org.primaryColor || "#4f46e5",
      secondaryColor: org.secondaryColor || "#7c3aed",
      accentColor: org.accentColor || "#10b981",
    };
  });

  // PATCH /api/v1/settings/organization — Update the global organization branding
  app.patch('/organization', async (req, reply) => {
    const body = UpdateOrganizationSchema.parse(req.body);
    
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
