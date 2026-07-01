import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export default async function internshipsRouter(app: FastifyInstance) {
  // GET /api/v1/academy/internships
  app.get('/internships', async (req, reply) => {
    const { studentId } = req.query as { studentId?: string };
    const where = studentId ? { studentId } : {};
    
    const internships = await app.prisma.internship.findMany({
      where,
      include: {
        student: { select: { id: true, studentCode: true, user: { select: { firstName: true, lastName: true } } } },
        _count: { select: { dailyLogs: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return internships;
  });

  // POST /api/v1/academy/internships
  app.post('/internships', async (req, reply) => {
    const schema = z.object({
      studentId: z.string(),
      companyName: z.string(),
      role: z.string(),
      stipend: z.number().optional(),
    });
    const body = schema.parse(req.body);

    const internship = await app.prisma.internship.create({
      data: body
    });

    reply.code(201);
    return internship;
  });
}
