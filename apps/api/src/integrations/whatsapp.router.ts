import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { whatsappService } from './whatsapp.service';

export default async function whatsappRouter(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // Ensure only authenticated internal users can trigger bulk notifications
  server.addHook('preHandler', app.requireAuth);

  server.post('/send-template', {
    schema: {
      body: z.object({
        phone: z.string().min(10),
        name: z.string().min(1),
        event: z.string().min(1),
        templateName: z.string().min(1),
        variables: z.array(z.string()),
        buttonVariables: z.array(z.string()).optional()
      })
    }
  }, async (req, reply) => {
    const data = req.body;
    const result = await whatsappService.sendTemplateMessage({
      phone: data.phone,
      name: data.name,
      event: data.event,
      templateName: data.templateName,
      variables: data.variables,
      buttonVariables: data.buttonVariables
    });

    if (!result.success) {
      return reply.code(400).send({ error: 'WhatsApp delivery failed', message: result.error });
    }

    return reply.send({ message: 'WhatsApp notification sent successfully', data: result.data });
  });
}
