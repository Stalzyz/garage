import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const CreateVendorSchema = z.object({
  userId: z.string(),
  vendorCode: z.string(),
  type: z.enum(['CREATIVE', 'TECHNICAL', 'OPERATIONAL', 'SUPPLIER']),
  company: z.string().optional(),
  skills: z.array(z.string()).optional(),
  dayRate: z.number().optional(),
  projectRate: z.number().optional(),
  gstin: z.string().optional()
});

export default async function vendorsRouter(app: FastifyInstance) {
  app.get('/vendors', async (req, reply) => {
    const vendors = await app.prisma.vendor.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { vendors };
  });

  app.post('/vendors', async (req, reply) => {
    const body = CreateVendorSchema.parse(req.body);
    const vendor = await app.prisma.vendor.create({
      data: {
        userId: body.userId,
        vendorCode: body.vendorCode,
        type: body.type,
        company: body.company,
        skills: body.skills || [],
        dayRate: body.dayRate,
        projectRate: body.projectRate,
        gstin: body.gstin
      }
    });
    reply.code(201);
    return vendor;
  });
}
