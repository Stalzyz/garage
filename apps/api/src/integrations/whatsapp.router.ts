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
        language: z.string().optional(),
        headerType: z.string().optional(),
        mediaUrl: z.string().optional(),
        filename: z.string().optional(),
        provider: z.enum(['auto', 'grafty', 'meta']).optional()
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
        language: data.language || 'en_US',
        headerType: data.headerType,
        mediaUrl: data.mediaUrl,
        filename: data.filename,
        provider: data.provider || 'auto'
      });

      const sent: any = result.data || {};

      // Be explicit when the requested template was rejected and a fallback was delivered
      // instead — the operator must never read this as "the template I picked was sent".
      let message = `WhatsApp message accepted via ${result.provider}`;
      if (sent.usedFallback && sent.requestedTemplate && sent.template !== sent.requestedTemplate) {
        message =
          `WhatsApp message accepted via ${result.provider} using FALLBACK template "${sent.template}" — ` +
          `the requested template "${sent.requestedTemplate}" was rejected by the provider. ` +
          `The customer received "${sent.template}", not "${sent.requestedTemplate}".`;
      } else if (sent.status === 'sent') {
        message = `WhatsApp message sent via ${result.provider}`;
      }

      return reply.send({
        message,
        data: sent
      });
    } catch (error: any) {
      const msg: string = error.message || 'WhatsApp delivery failed';
      const is132012 = msg.includes('132012') || msg.toLowerCase().includes('parameter format does not match');
      const is190 = msg.includes('190') || (msg.toLowerCase().includes('token') && msg.toLowerCase().includes('expire'));
      const is131030 = msg.includes('131030') || msg.toLowerCase().includes('not in allowed list') || msg.toLowerCase().includes('development mode');
      const is132001 = msg.includes('132001') || msg.toLowerCase().includes('template not found') || msg.toLowerCase().includes('does not exist in the translation');
      const is100 = msg.includes('Code 100') || msg.includes('recipient_type');
      const is131047 = msg.includes('131047') || msg.toLowerCase().includes('24 hours');

      let errorTitle = 'WhatsApp delivery failed';
      let hint = 'Go to Settings → Integrations → META and verify your META_ACCESS_TOKEN and META_PHONE_NUMBER_ID, or configure GRAFTY_API_KEY as a fallback.';
      let code = 'DELIVERY_FAILED';

      if (is190) {
        errorTitle = 'Meta Access Token Expired (#190)';
        hint = 'In Meta Business Settings → System Users, generate a permanent token with "whatsapp_business_messaging" and "whatsapp_business_management" permissions, then update Settings → Integrations → META.';
        code = 'META_190_TOKEN_EXPIRED';
      } else if (is131030) {
        errorTitle = 'Meta Development Mode Restriction (#131030)';
        hint = 'Your Meta App is in Development mode. Switch to Live mode in developers.facebook.com, or add this recipient phone number under WhatsApp → API Setup → Manage phone number list.';
        code = 'META_131030_DEV_MODE';
      } else if (is132001) {
        errorTitle = 'Meta Template Not Found (#132001)';
        hint = 'The template name or language is not approved in your Meta WABA. Verify spelling in Meta Business Manager or use the "Grafty Welcome" verified template.';
        code = 'META_132001_TEMPLATE_MISSING';
      } else if (is132012) {
        errorTitle = 'Meta Template Variable Mismatch (#132012)';
        hint = 'The template parameter count does not match the approved schema in Meta. Switch to "Grafty Welcome" or adjust header media attachments.';
        code = 'META_132012_PARAM_MISMATCH';
      } else if (is100) {
        errorTitle = 'Meta Phone Number ID Invalid (Code 100)';
        hint = 'Check Settings → Integrations → META: Ensure META_PHONE_NUMBER_ID contains the 15-digit Phone Number ID (from WhatsApp → API Setup), NOT the WABA ID or App ID.';
        code = 'META_100_INVALID_PHONE_ID';
      } else if (is131047) {
        errorTitle = '24-Hour Customer Window Expired (#131047)';
        hint = 'More than 24 hours have passed since the client messaged. You must send an approved template with matching variables.';
        code = 'META_131047_SESSION_EXPIRED';
      }

      console.error('[WhatsApp Router] Send failed:', msg);
      return reply.code(400).send({
        error: errorTitle,
        details: msg,
        message: msg,
        hint,
        code
      });
    }
  });
}
