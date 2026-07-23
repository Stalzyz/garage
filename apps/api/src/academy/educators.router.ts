import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const CreateEducatorSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  designation: z.string().optional(),
  company: z.string().optional(),
  yearsExperience: z.number().optional(),
  skills: z.array(z.string()).optional(),
  bio: z.string().optional(),
  deliveryMode: z.enum(['ONSITE', 'ONLINE']).optional(),
});

export default async function educatorsRouter(app: FastifyInstance) {
  // GET /api/v1/academy/educators
  app.get('/educators', async (req, reply) => {
    const educators = await app.prisma.educator.findMany({
      include: { user: true },
      orderBy: { user: { firstName: 'asc' } },
    });
    return educators;
  });

  // POST /api/v1/academy/educators
  app.post('/educators', async (req, reply) => {
    const body = CreateEducatorSchema.parse(req.body);
    
    // Create User, then Educator
    const educator = await app.prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          role: 'EDUCATOR',
          passwordHash: '$2a$10$x4R4Qz4hVfQW9y4r4hVfQ.W9y4r4hVfQW9y4r4hVfQW9y4r4hVfQ', // Dummy
        }
      });

      // 2. Create Educator
      return await tx.educator.create({
        data: {
          userId: user.id,
          designation: body.designation,
          company: body.company,
          yearsExperience: body.yearsExperience,
          skills: body.skills || [],
          bio: body.bio,
          deliveryMode: body.deliveryMode || 'ONSITE',
          verificationStatus: 'VERIFIED'
        },
        include: { user: true }
      });
    });

    reply.code(201);
    return educator;
  });
}
