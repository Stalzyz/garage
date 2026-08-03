import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function holidaysRoutes(app: FastInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /
  server.get('/', async (req, reply) => {
    const holidays = await server.prisma.holiday.findMany({
      orderBy: { date: 'asc' }
    });
    return { data: holidays };
  });

  // POST /
  server.post('/', {
    schema: {
      body: z.object({
        name: z.string(),
        date: z.string(), // ISO or YYYY-MM-DD
        isOptional: z.boolean().default(false)
      })
    }
  }, async (req, reply) => {
    const { name, date, isOptional } = req.body;
    const holiday = await server.prisma.holiday.create({
      data: {
        name,
        date: new Date(date),
        isOptional
      }
    });
    return reply.status(201).send(holiday);
  });

  // PUT /:id
  server.put('/:id', {
    schema: {
      params: z.object({ id: z.string() }),
      body: z.object({
        name: z.string(),
        date: z.string(),
        isOptional: z.boolean()
      })
    }
  }, async (req, reply) => {
    const { id } = req.params;
    const { name, date, isOptional } = req.body;
    const holiday = await server.prisma.holiday.update({
      where: { id },
      data: {
        name,
        date: new Date(date),
        isOptional
      }
    });
    return holiday;
  });

  // DELETE /:id
  server.delete('/:id', {
    schema: {
      params: z.object({ id: z.string() })
    }
  }, async (req, reply) => {
    const { id } = req.params;
    await server.prisma.holiday.delete({
      where: { id }
    });
    return { success: true };
  });
}
type FastInstance = FastifyInstance;
