import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const CreateVendorSchema = z.object({
  userId: z.string().optional(),
  vendorCode: z.string().optional(),
  type: z.enum(['CREATIVE', 'TECHNICAL', 'OPERATIONAL', 'SUPPLIER', 'FREELANCER', 'AGENCY', 'SOFTWARE', 'EQUIPMENT', 'OTHER']).optional(),
  company: z.string().optional(),
  skills: z.array(z.string()).optional(),
  dayRate: z.number().optional(),
  projectRate: z.number().optional(),
  gstin: z.string().optional(),
  
  user: z.object({
    name: z.string().optional(),
    email: z.string().email(),
  }).optional(),

  name: z.string().optional(),
  contactName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  taxId: z.string().optional()
});

export default async function vendorsRouter(app: FastifyInstance) {
  app.get('/vendors', async (req, reply) => {
    const vendors = await app.prisma.vendor.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });
    return { vendors };
  });

  app.post('/vendors', async (req, reply) => {
    const body = CreateVendorSchema.parse(req.body);
    
    let userId = body.userId;
    if (!userId) {
      const email = body.email || body.user?.email;
      if (!email) {
        return reply.badRequest("Email is required when userId is not provided");
      }
      
      let userRecord = await app.prisma.user.findUnique({ where: { email } });
      if (!userRecord) {
        const fullName = body.name || body.user?.name || body.contactName || "New Vendor";
        const parts = fullName.split(" ");
        const firstName = parts[0] || "New";
        const lastName = parts.slice(1).join(" ") || "Vendor";
        const bcrypt = require('bcryptjs');
        const passwordHash = await bcrypt.hash('GrekamVendor@123', 10);
        
        userRecord = await app.prisma.user.create({
          data: {
            email,
            passwordHash,
            role: "VENDOR",
            firstName,
            lastName,
            phone: body.phone || null,
            status: "ACTIVE"
          }
        });
      }
      userId = userRecord.id;
    }

    const vendorCode = body.vendorCode || `VND-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    let type: 'CREATIVE' | 'TECHNICAL' | 'OPERATIONAL' | 'SUPPLIER' = 'TECHNICAL';
    if (body.type) {
      const t = body.type.toUpperCase();
      if (t === 'CREATIVE' || t === 'TECHNICAL' || t === 'OPERATIONAL' || t === 'SUPPLIER') {
        type = t as any;
      } else if (t === 'FREELANCER') {
        type = 'CREATIVE';
      } else if (t === 'AGENCY') {
        type = 'OPERATIONAL';
      } else if (t === 'SOFTWARE') {
        type = 'TECHNICAL';
      } else if (t === 'EQUIPMENT') {
        type = 'SUPPLIER';
      } else {
        type = 'OPERATIONAL';
      }
    }

    const vendor = await app.prisma.vendor.create({
      data: {
        userId,
        vendorCode,
        type,
        company: body.company || body.name || null,
        skills: body.skills || [],
        dayRate: body.dayRate || 0,
        projectRate: body.projectRate || 0,
        gstin: body.gstin || body.taxId || null
      }
    });
    reply.code(201);
    return vendor;
  });
}
