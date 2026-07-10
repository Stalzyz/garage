import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import sensible from '@fastify/sensible';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import websocket from '@fastify/websocket';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from 'fastify-type-provider-zod';
import { prisma } from './db';
import dotenv from 'dotenv';
import authPlugin from './plugins/auth.plugin';
import storagePlugin from './plugins/storage.plugin';
import notificationsModule from './notifications';
import settingsModule from './settings';
import storageRouter from './storage/storage.router';
import { registerGlobalListeners } from './automations/listeners';
import { startCronJobs } from './cron/invoice-jobs';
import { initSentry } from './sentry';

dotenv.config();
initSentry();

// Temporary minimal setup
export async function buildApp(opts: any = {}): Promise<any> {
  const app = Fastify({
    logger: true,
    ...opts,
  });

  // Start Autopilot Engine Listeners
  registerGlobalListeners();

  // Start Scheduled Cron Jobs
  startCronJobs();

  // Security: Helmet HTTP headers
  await app.register(helmet, { contentSecurityPolicy: false });

  // Rate Limiting: higher in test to allow E2E parallel requests
  const isTest = process.env.NODE_ENV === 'test';
  await app.register(rateLimit, {
    max: isTest ? 1000 : 100,
    timeWindow: '1 minute',
  });

  // Prisma Client
  app.decorate('prisma', prisma);
  
  app.addHook('onClose', async (instance) => {
    await instance.prisma.$disconnect();
  });

  // Type provider
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Core Plugins
  await app.register(cors, {
    origin: [process.env.CORS_ORIGIN || 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  await app.register(sensible);
  await app.register(websocket);

  await app.register(jwt, {
    secret: process.env.JWT_SECRET || 'super-secret-key-change-me',
  });

  await app.register(authPlugin);
  await app.register(storagePlugin);

  // Swagger setup
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Grekam OS API',
        description: 'Enterprise API for Grekam Visuals & Academy',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
    transform: jsonSchemaTransform,
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
  });

  // Health check route
  app.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Register Modules
  const crmModule = (await import('./crm')).default;
  await app.register(crmModule, { prefix: '/api/v1/crm' });

  const hrModule = (await import('./hr')).default;
  await app.register(hrModule, { prefix: '/api/v1/hr' });

  const academyModule = (await import('./academy')).default;
  await app.register(academyModule, { prefix: '/api/v1/academy' });

  const projectsModule = (await import('./projects')).default;
  await app.register(projectsModule, { prefix: '/api/v1/projects' });

  const financeModule = (await import('./finance')).default;
  await app.register(financeModule, { prefix: '/api/v1/finance' });

  const lmsModule = (await import('./lms')).default;
  await app.register(lmsModule, { prefix: '/api/v1/lms' });

  const marketingModule = (await import('./marketing')).default;
  await app.register(marketingModule, { prefix: '/api/v1/marketing' });

  const supportModule = (await import('./support')).default;
  await app.register(supportModule, { prefix: '/api/v1/support' });

  const automationsModule = (await import('./automations')).default;
  await app.register(automationsModule, { prefix: '/api/v1/automations' });

  const chatModule = (await import('./chat')).default;
  await app.register(chatModule, { prefix: '/api/v1/chat' });

  const driveModule = (await import('./drive')).default;
  await app.register(driveModule, { prefix: '/api/v1/drive' });

  const settingsModule = (await import('./settings')).default;
  await app.register(settingsModule, { prefix: '/api/v1/settings' });

  const razorpayWebhook = (await import('./webhooks/razorpay.router')).default;
  await app.register(razorpayWebhook, { prefix: '/api/v1/webhooks' });

  const analyticsModule = (await import('./analytics')).default;
  await app.register(analyticsModule, { prefix: '/api/v1/analytics' });

  const vendorsModule = (await import('./vendors')).default;
  await app.register(vendorsModule, { prefix: '/api/v1/vendors' });

  const notificationsModule = (await import('./notifications')).default;
  await app.register(notificationsModule, { prefix: '/api/v1/notifications' });

  const documentsModule = (await import('./documents')).default;
  await app.register(documentsModule, { prefix: '/api/v1/documents' });

  const storageModule = (await import('./storage')).default;
  await app.register(storageModule, { prefix: '/api/v1/storage' });

  const cmsModule = (await import('./cms')).default;
  await app.register(cmsModule, { prefix: '/api/v1/cms' });

  const workspaceModule = (await import('./workspace')).default;
  await app.register(workspaceModule, { prefix: '/api/v1/workspace' });

  const portalModule = (await import('./portal')).default;
  await app.register(portalModule, { prefix: '/api/v1/portal' });

  // Email & Drip
  const emailRouter = (await import('./integrations/email.router')).default;
  await app.register(emailRouter, { prefix: '/api/v1/email' });

  // WhatsApp
  const whatsappRouter = (await import('./integrations/whatsapp.router')).default;
  await app.register(whatsappRouter, { prefix: '/api/v1/whatsapp' });

  // Payments
  const paymentsRouter = (await import('./integrations/payments.router')).default;
  await app.register(paymentsRouter, { prefix: '/api/v1/payments' });

  // CSV Exports
  const csvExportsRouter = (await import('./exports/csv.router')).default;
  await app.register(csvExportsRouter, { prefix: '/api/v1/exports' });

  // Google Calendar / Meet Integration
  const googleRouter = (await import('./integrations/google.router')).default;
  await app.register(googleRouter, { prefix: '/api/v1/google' });

  // Auth (2FA & Me)
  const twoFaRouter = (await import('./auth/two-fa.router')).default;
  await app.register(twoFaRouter, { prefix: '/api/v1/auth' });
  const meRouter = (await import('./auth/me.router')).default;
  await app.register(meRouter, { prefix: '/api/v1/auth' });

  // AI Integration
  const aiMentorRouter = (await import('./ai/mentor.router')).default;
  await app.register(aiMentorRouter, { prefix: '/api/v1/ai/mentor' });

  // WebSocket — real-time broadcast hub
  const wsClients = new Set<any>();

  app.get('/api/v1/ws', { websocket: true }, (socket) => {
    wsClients.add(socket);
    app.log.info(`[WS] Client connected — total: ${wsClients.size}`);

    socket.on('close', () => {
      wsClients.delete(socket);
      app.log.info(`[WS] Client disconnected — total: ${wsClients.size}`);
    });

    // Send welcome ping
    socket.send(JSON.stringify({ type: 'CONNECTED', message: 'Grekam OS real-time stream ready' }));
  });

  // Expose broadcast helper so other routers can use it
  app.decorate('broadcast', (event: string, payload: unknown) => {
    const msg = JSON.stringify({ type: event, payload, timestamp: new Date().toISOString() });
    wsClients.forEach(client => {
      try { client.send(msg); } catch {}
    });
  });

  return app;
}

// Start server
if (require.main === module) {
  const start = async () => {
    try {
      const app = await buildApp();
      await app.listen({ port: Number(process.env.PORT) || 4000, host: '0.0.0.0' });
      app.log.info(`Server listening on ${app.server.address()}`);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  };
  start();
}
