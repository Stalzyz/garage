import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function campaignsRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get('/', async (req, reply) => {
    const campaigns = await server.prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return { campaigns };
  });

  server.post('/', {
    schema: {
      body: z.object({
        title: z.string(),
        type: z.string(),
        status: z.string(),
        targetAudience: z.string().optional(),
        content: z.string().optional()
      })
    }
  }, async (req, reply) => {
    const data = req.body;
    const campaign = await server.prisma.campaign.create({
      data: {
        title: data.title,
        type: data.type,
        status: data.status,
        targetAudience: data.targetAudience,
        content: data.content
      }
    });
    return reply.status(201).send(campaign);
  });
}
