import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const UpdateOrganizationSchema = z.object({
  name: z.string().optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  academyLogoUrl: z.string().url().optional().or(z.literal('')),
  faviconUrl: z.string().url().optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).optional(),
  darkModeDefault: z.boolean().optional(),
  supportEmail: z.string().email().optional().or(z.literal('')),
  billingAddress: z.string().optional().or(z.literal('')),
  website: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
});

export default async function organizationRouter(app: FastifyInstance) {
  // GET /api/v1/settings/organization — Get the global organization branding
  app.get('/organization', async (req, reply) => {
    let org = await app.prisma.organization.findFirst();
    
    // Auto-seed default config if none exists
    if (!org) {
      org = await app.prisma.organization.create({
        data: {
          name: "Grekam OS",
          primaryColor: "#2563eb",
          darkModeDefault: true,
        }
      });
    }

    return org;
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
