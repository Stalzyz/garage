import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { whatsappService } from './whatsapp.service';

export default async function whatsappRouter(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // Ensure only authenticated internal users can trigger bulk notifications
  server.addHook('preHandler', app.requireAuth);

  // GET /api/v1/integrations/whatsapp/templates — Get standard WhatsApp templates & metadata
  server.get('/templates', async (req, reply) => {
    const templates = whatsappService.getTemplates();
    return { data: templates };
  });

  // POST /api/v1/integrations/whatsapp/test — Test Grafty connection
  server.post('/test', async (req, reply) => {
    const creds = await whatsappService.getCredentials();
    if (!creds.key) {
      return reply.code(400).send({ success: false, error: 'GRAFTY_API_KEY is not configured in Settings -> Integrations' });
    }
    return { success: true, message: 'Grafty credentials found & ready' };
  });

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

