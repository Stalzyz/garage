import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function documentsRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get('/', async (req, reply) => {
    const documents = await server.prisma.documentTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { documents };
  });

  server.post('/', {
    schema: {
      body: z.object({
        name: z.string(),
        type: z.enum(['CERTIFICATE', 'EXPERIENCE_LETTER', 'OFFER_LETTER', 'CONTRACT', 'CUSTOM', 'PROPOSAL']),
        content: z.string()
      })
    }
  }, async (req, reply) => {
    const document = await server.prisma.documentTemplate.create({
      data: req.body
    });
    return reply.status(201).send(document);
  });
  
  server.delete('/:id', {
    schema: { params: z.object({ id: z.string() }) }
  }, async (req, reply) => {
    await server.prisma.documentTemplate.delete({
      where: { id: req.params.id }
    });
    return reply.status(204).send();
  });
}
