import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function emailRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get('/templates', async (req, reply) => {
    return { templates: [] };
  });

  server.post('/send', {
    schema: {
      body: z.object({
        templateId: z.string(),
        subject: z.string(),
        recipients: z.array(z.string().email())
      })
    }
  }, async (req, reply) => {
    return { success: true };
  });
}
