import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const DncSchema = z.object({
  phone: z.string().min(1),
  reason: z.string().optional(),
});

export default async function dncRouter(app: FastifyInstance) {
  // GET /api/v1/crm/dnc
  app.get('/dnc', async (req, reply) => {
    const dncList = await app.prisma.dncNumber.findMany({
      orderBy: { addedAt: 'desc' },
    });
    return { data: dncList };
  });

  // POST /api/v1/crm/dnc
  app.post('/dnc', async (req, reply) => {
    const body = DncSchema.parse(req.body);
    const existing = await app.prisma.dncNumber.findUnique({
      where: { phone: body.phone },
    });

    if (existing) {
      return reply.badRequest('Phone number is already in DNC list');
    }

    const entry = await app.prisma.dncNumber.create({
      data: {
        phone: body.phone,
        reason: body.reason,
      },
    });
    reply.code(201);
    return entry;
  });

  // DELETE /api/v1/crm/dnc/:id
  app.delete('/dnc/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    try {
      await app.prisma.dncNumber.delete({
        where: { id },
      });
      reply.code(204);
    } catch (err) {
      return reply.notFound('DNC entry not found');
    }
  });
}
