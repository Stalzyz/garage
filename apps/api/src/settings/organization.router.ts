import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const UpdateOrganizationSchema = z.object({
  name: z.string().optional(),
  logoUrl: z.string().optional().or(z.literal('')),
  faviconUrl: z.string().optional().or(z.literal('')),
  academyLogoUrl: z.string().optional().or(z.literal('')),
  academyFaviconUrl: z.string().optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  darkModeDefault: z.boolean().optional(),
  supportEmail: z.string().email().optional().or(z.literal('')),
  billingAddress: z.string().optional().or(z.literal('')),
  website: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  openAiKey: z.string().optional().or(z.literal('')),
  resendApiKey: z.string().optional().or(z.literal('')),
  bankName: z.string().optional().or(z.literal('')),
  accountName: z.string().optional().or(z.literal('')),
  accountNumber: z.string().optional().or(z.literal('')),
  ifscCode: z.string().optional().or(z.literal('')),
  swiftCode: z.string().optional().or(z.literal('')),
  bankBranch: z.string().optional().or(z.literal('')),
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
          logoUrl: "/visuals-logo.png",
          academyLogoUrl: "/academy-logo.png",
          faviconUrl: "/favicon.ico",
          academyFaviconUrl: "/favicon.ico",
          primaryColor: "#2DA16D",
          secondaryColor: "#E1992D",
          accentColor: "#49abc9",
          darkModeDefault: true,
          supportEmail: "greeksacademy@gmail.com",
          billingAddress: "Coimbatore, Tamil Nadu, India",
          website: "https://grekam.in",
        }
      });
    }

    return {
      ...org,
      name: org.name || "Grekam Visuals",
      logoUrl: org.logoUrl || "/visuals-logo.png",
      academyLogoUrl: org.academyLogoUrl || "/academy-logo.png",
      faviconUrl: org.faviconUrl || "/favicon.ico",
      academyFaviconUrl: org.academyFaviconUrl || "/favicon.ico",
      primaryColor: org.primaryColor || "#2DA16D",
      secondaryColor: org.secondaryColor || "#E1992D",
      accentColor: org.accentColor || "#49abc9",
    };
  });

  // PATCH /api/v1/settings/organization — Update the global organization branding
  app.patch('/organization', async (req, reply) => {
    const body = UpdateOrganizationSchema.parse(req.body);
    
    let org = await app.prisma.organization.findFirst();
    
    if (!org) {
      org = await app.prisma.organization.create({
        data: { name: "Grekam OS", ...body }
      });
    } else {
      org = await app.prisma.organization.update({
        where: { id: org.id },
        data: body,
      });
    }

    return org;
  });
}
