import Fastify, { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import sensible from '@fastify/sensible';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import websocket from '@fastify/websocket';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { serializerCompiler, validatorCompiler, jsonSchemaTransform } from 'fastify-type-provider-zod';
import { prisma } from './db';
import dotenv from 'dotenv';
import authPlugin, { authenticateRequest } from './plugins/auth.plugin';
import authGatePlugin from './plugins/auth-gate.plugin';
import tenantPlugin from './plugins/tenant.plugin';
import redactSecretsPlugin from './plugins/redact-secrets.plugin';
import storagePlugin from './plugins/storage.plugin';
import storageRouter from './storage/storage.router';
import { registerGlobalListeners } from './automations/listeners';
import { startCronJobs } from './cron/invoice-jobs';
import { initializeCronJobs as startAutomatedDrips } from './automations/cron';
import { initSentry } from './sentry';

import path from 'path';
import fs from 'fs';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
// fallback for development if run directly from apps/api
dotenv.config();

initSentry();

// Temporary minimal setup
export async function buildApp(opts: any = {}): Promise<any> {
  const app = Fastify({
      logger: true,
      bodyLimit: 30 * 1024 * 1024, // 30MB payload limit for telemetry screenshots
      // Without this req.ip is nginx's 127.0.0.1 for every request, so the
      // rate limiter put all visitors into one bucket and unrelated users
      // tripped each other's 429s. 2 hops: browser -> Cloudflare -> nginx
      // (which appends $remote_addr to X-Forwarded-For) -> api.
      trustProxy: 2,
      ...opts,
    });

  // Start Autopilot Engine Listeners
  registerGlobalListeners();

  // Start Scheduled Cron Jobs
  startCronJobs();
  startAutomatedDrips();

  // Security: Helmet HTTP headers with cross-origin resource policy enabled for public assets & APIs
  await app.register(helmet, {
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  });

  // Rate Limiting: higher in test to allow E2E parallel requests
  const isTest = process.env.NODE_ENV === 'test';
  await app.register(rateLimit, {
    // Per-user budget (trustProxy above makes req.ip the real client).
    // Previously a single global 100/min with no per-route overrides.
    max: isTest ? 1000 : 300,
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

  // Capture raw body for webhook signature verification
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (req, body, done) => {
    try {
      const json = JSON.parse(body as string);
      (req as any).rawBody = body;
      done(null, json);
    } catch (err: any) {
      err.statusCode = 400;
      done(err, undefined);
    }
  });

  // Register buffer parser for media/binary uploads (image/*, application/*, text/*, etc.) to prevent 415 errors
  app.addContentTypeParser('*', { parseAs: 'buffer' }, (req, body, done) => {
    done(null, body);
  });

  // Core Plugins
  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) {
        cb(null, true);
        return;
      }
      
      const allowedOrigins = [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
      ];
      
      if (process.env.CORS_ORIGIN) {
        const envOrigins = process.env.CORS_ORIGIN.split(',').map(o => o.trim());
        allowedOrigins.push(...envOrigins);
      }
      
      try {
        const url = new URL(origin);
        const host = url.hostname;
        
        const isAllowed = allowedOrigins.includes(origin) || 
                          host === 'grekam.in' || 
                          host.endsWith('.grekam.in') || 
                          host === 'grafty.pro' || 
                          host.endsWith('.grafty.pro') ||
                          host === 'localhost' || 
                          host === '127.0.0.1';

        if (isAllowed) {
          cb(null, true);
        } else {
          cb(new Error("Not allowed by CORS"), false);
        }
      } catch (err) {
        cb(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });

  await app.register(sensible);
  await app.register(websocket);

  await app.register(jwt, {
    // No fallback: a published default secret means anyone can mint tokens when
    // JWT_SECRET is unset. Fail loudly at boot instead.
    secret: (() => {
      const s = process.env.JWT_SECRET;
      if (!s) throw new Error('JWT_SECRET is required — refusing to start with a hardcoded signing key.');
      return s;
    })(),
  });

  // Deny-by-default gate. Registered BEFORE any router so its onRequest hook sits
  // on the root instance and covers every route. Without it only the 17/116
  // routers that remembered `requireAuth` were protected, so /hr/employees and
  // /finance/* served PII to anonymous callers.
  await app.register(authGatePlugin);
  await app.register(authPlugin);
  await app.register(tenantPlugin);
  await app.register(storagePlugin);
  // Strips passwordHash / twoFaSecret / twoFaBackupCodes from every response, so
  // the ~47 `include: { user: true }` call sites can no longer leak credentials.
  await app.register(redactSecretsPlugin);

  await app.register(multipart, {
    limits: {
      fileSize: 50 * 1024 * 1024 // 50MB
    }
  });

  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  await app.register(fastifyStatic, {
    root: uploadsDir,
    prefix: '/api/v1/uploads/',
  });

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


  const projectsModule = (await import('./projects')).default;
  await app.register(projectsModule, { prefix: '/api/v1/projects' });

  const financeModule = (await import('./finance')).default;
  await app.register(financeModule, { prefix: '/api/v1/finance' });


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

  const teamModule = (await import('./team')).default;
  await app.register(teamModule, { prefix: '/api/v1/team' });

  const razorpayWebhook = (await import('./webhooks/razorpay.router')).default;
  const { handleRazorpayWebhook } = await import('./webhooks/razorpay.router');
  await app.register(razorpayWebhook, { prefix: '/api/v1/webhooks' });
  app.post('/api/billing/razorpay/webhook', async (req, reply) => {
    return handleRazorpayWebhook(req as any, reply as any, app as any);
  });

  const metaWebhook = (await import('./webhooks/meta.router')).default;
  await app.register(metaWebhook, { prefix: '/api/v1/webhooks' });
  await app.register(metaWebhook, { prefix: '/api' });

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


  const workspaceModule = (await import('./workspace')).default;
  await app.register(workspaceModule, { prefix: '/api/v1/workspace' });

  const portalModule = (await import('./portal')).default;
  await app.register(portalModule, { prefix: '/api/v1/portal' });

  // Email & Drip
  const emailRouter = (await import('./integrations/email.router')).default;
  await app.register(emailRouter, { prefix: '/api/v1/email' });

  // WhatsApp Integration
  const whatsappRouter = (await import('./integrations/whatsapp.router')).default;
  await app.register(whatsappRouter, { prefix: '/api/v1/integrations/whatsapp' });
  await app.register(whatsappRouter, { prefix: '/api/v1/whatsapp' });

  // Payments
  const paymentsRouter = (await import('./integrations/payments.router')).default;
  await app.register(paymentsRouter, { prefix: '/api/v1/payments' });

  // Licenses / Subscriptions
  const licensesRouter = (await import('./integrations/licenses.router')).default;
  await app.register(licensesRouter, { prefix: '/api/v1/licenses' });

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
  const aiGenerateRouter = (await import('./ai/generate.router')).default;
  await app.register(aiGenerateRouter, { prefix: '/api/v1/ai' });
  const aiProspectRouter = (await import('./ai/prospect.router')).default;
  await app.register(aiProspectRouter, { prefix: '/api/v1/ai' });

  // WebSocket — real-time broadcast hub
  const wsClients = new Set<any>();

  // The auth gate skips this path because an HTTP hook cannot reject an upgrade
  // handshake, so the upgrade is authorised here instead. Previously ANY client
  // could connect and receive every CRM lead/call broadcast.
  app.get('/api/v1/ws', { websocket: true }, async (socket, req) => {
    // @fastify/websocket types `req` with the HTTP2 request generic; the gate only
    // reads .headers.cookie, so widen it rather than fight the generics.
    const result = await authenticateRequest(req as unknown as FastifyRequest);
    if (!result.ok) {
      // Log the actual reason: "no cookie", "bad token" and "account not
      // active" all collapsed into one line, which made a reconnect loop
      // impossible to diagnose from the logs alone.
      app.log.warn(`[WS] Rejected upgrade from ${req.socket.remoteAddress}: ${result.message}`);
      socket.close(4401, 'Unauthorized');
      return;
    }
    wsClients.add(socket);
    app.log.info(`[WS] Client connected — total: ${wsClients.size}`);

    // Keepalive ping to prevent Cloudflare idle timeout
    const pingInterval = setInterval(() => {
      if (socket.readyState === 1) { // 1 = OPEN
        try {
          socket.send(JSON.stringify({ type: 'PING', timestamp: new Date().toISOString() }));
        } catch (e) {
          app.log.error(`[WS] Ping failed: ${e}`);
        }
      }
    }, 45000); // 45 seconds

    socket.on('close', () => {
      clearInterval(pingInterval);
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
