import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function weekoffsRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /
  server.get('/', async (req, reply) => {
    const weekoffs = await server.prisma.weekOff.findMany({
      include: {
        employee: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { data: weekoffs };
  });

  // POST /
  server.post('/', {
    schema: {
      body: z.object({
        employeeId: z.string(),
        daysOfWeek: z.array(z.number().min(0).max(6)), // e.g. [0, 6] for Sun, Sat
        effectiveFrom: z.string() // ISO or YYYY-MM-DD
      })
    }
  }, async (req, reply) => {
    const { employeeId, daysOfWeek, effectiveFrom } = req.body;
    
    // Delete any existing weekoffs for this employee effective from same date or clean replacement
    await server.prisma.weekOff.deleteMany({
      where: {
        employeeId
      }
    });

    const weekoff = await server.prisma.weekOff.create({
      data: {
        employeeId,
        daysOfWeek,
        effectiveFrom: new Date(effectiveFrom)
      }
    });
    return reply.status(201).send(weekoff);
  });

  // DELETE /:id
  server.delete('/:id', {
    schema: {
      params: z.object({ id: z.string() })
    }
  }, async (req, reply) => {
    const { id } = req.params;
    await server.prisma.weekOff.delete({
      where: { id }
    });
    return { success: true };
  });
}
