import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function geofencesRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /
  server.get('/', async (req, reply) => {
    const geofences = await server.prisma.geofence.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { data: geofences };
  });

  // POST /
  server.post('/', {
    schema: {
      body: z.object({
        name: z.string(),
        latitude: z.number(),
        longitude: z.number(),
        radius: z.number().default(100.0),
        isActive: z.boolean().default(true)
      })
    }
  }, async (req, reply) => {
    const geofence = await server.prisma.geofence.create({
      data: req.body
    });
    return reply.status(201).send(geofence);
  });

  // PUT /:id
  server.put('/:id', {
    schema: {
      params: z.object({ id: z.string() }),
      body: z.object({
        name: z.string(),
        latitude: z.number(),
        longitude: z.number(),
        radius: z.number(),
        isActive: z.boolean()
      })
    }
  }, async (req, reply) => {
    const { id } = req.params;
    const geofence = await server.prisma.geofence.update({
      where: { id },
      data: req.body
    });
    return geofence;
  });

  // DELETE /:id
  server.delete('/:id', {
    schema: {
      params: z.object({ id: z.string() })
    }
  }, async (req, reply) => {
    const { id } = req.params;
    await server.prisma.geofence.delete({
      where: { id }
    });
    return { success: true };
  });
}
