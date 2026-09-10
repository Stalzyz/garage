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
    const templates = await whatsappService.getTemplates();
    return { data: templates };
  });

  // POST /api/v1/integrations/whatsapp/test — Full diagnostic: test both Meta Cloud API and Grafty
  server.post('/test', async (req, reply) => {
    const [metaResult, graftyResult] = await Promise.all([
      whatsappService.testMetaConnection(),
      whatsappService.testGraftyConnection()
    ]);

    const anyConnected = metaResult.connected || graftyResult.connected;

    return reply.send({
      success: anyConnected,
      meta: metaResult,
      grafty: graftyResult,
      recommendation: !anyConnected
        ? 'Configure META_ACCESS_TOKEN + META_PHONE_NUMBER_ID in Settings → Integrations → META, OR configure GRAFTY_API_KEY in Settings → Integrations → WHATSAPP'
        : metaResult.connected
          ? 'Meta Cloud API is active — messages will be sent directly via Meta'
          : 'Grafty is active — messages will be routed via Grafty workspace'
    });
  });

  // GET /api/v1/integrations/whatsapp/status — Quick connectivity check
  server.get('/status', async (req, reply) => {
    const creds = await whatsappService.getCredentials();
    return reply.send({
      meta: {
        hasToken: !!creds.metaToken,
        hasPhoneNumberId: !!creds.metaPhoneNumberId,
        hasWabaId: !!creds.metaWabaId,
        ready: !!(creds.metaToken && creds.metaPhoneNumberId)
      },
      grafty: {
        hasKey: !!creds.graftyKey,
        url: creds.graftyUrl,
        ready: !!creds.graftyKey
      },
      overallReady: !!(creds.metaToken && creds.metaPhoneNumberId) || !!creds.graftyKey
    });
  });

  // POST /api/v1/integrations/whatsapp/send-template — Send WhatsApp template message
  server.post('/send-template', {
    schema: {
      body: z.object({
        phone: z.string().min(10),
        name: z.string().min(1),
        event: z.string().min(1),
        templateName: z.string().min(1),
        variables: z.array(z.string()),
        buttonVariables: z.array(z.string()).optional(),
        language: z.string().optional()
      })
    }
  }, async (req, reply) => {
    const data = req.body;

    try {
      const result = await whatsappService.sendTemplateMessage({
        phone: data.phone,
        name: data.name,
        event: data.event,
        templateName: data.templateName,
        variables: data.variables,
        buttonVariables: data.buttonVariables,
        language: data.language || 'en'
      });

      return reply.send({
        message: `WhatsApp message sent via ${result.provider}`,
        data: result.data
      });
    } catch (error: any) {
      console.error('[WhatsApp Router] Send failed:', error.message);
      return reply.code(400).send({
        error: 'WhatsApp delivery failed',
        message: error.message,
        hint: 'Go to Settings → Integrations → META and add META_ACCESS_TOKEN + META_PHONE_NUMBER_ID. Or add GRAFTY_API_KEY under WHATSAPP service.'
      });
    }
  });
}
