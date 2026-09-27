import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

export default async function storageRouter(app: FastifyInstance) {
  // PUBLIC GET /api/v1/storage/asset/*
  // Streams R2/local images directly with CORS & caching headers enabled (no auth required)
  app.get('/asset/*', async (req, reply) => {
    const key = (req.params as any)['*'];
    if (!key) return reply.code(400).send({ error: 'Missing key' });

    try {
      if (app.s3?.client) {
        const { GetObjectCommand } = await import('@aws-sdk/client-s3');
        const command = new GetObjectCommand({
          Bucket: app.s3.bucket,
          Key: key,
        });

        const response = await app.s3.client.send(command);
        if (response.Body) {
          reply.header('Access-Control-Allow-Origin', '*');
          reply.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
          reply.header('Access-Control-Allow-Headers', '*');
          reply.header('Cross-Origin-Resource-Policy', 'cross-origin');
          reply.header('Cache-Control', 'public, max-age=31536000, immutable');
          if (response.ContentType) {
            reply.header('Content-Type', response.ContentType);
          }
          if (response.ContentLength) {
            reply.header('Content-Length', response.ContentLength);
          }
          return reply.send(response.Body as any);
        }
      }
    } catch (err: any) {
      // S3 failed, fallback to checking local storage
    }

    // Local file fallback
    const uploadsDir = path.resolve(process.cwd(), 'uploads');
    const safeKey = key.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const localFile = path.join(uploadsDir, safeKey);
    if (fs.existsSync(localFile)) {
      reply.header('Access-Control-Allow-Origin', '*');
      reply.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
      reply.header('Access-Control-Allow-Headers', '*');
      reply.header('Cross-Origin-Resource-Policy', 'cross-origin');
      reply.header('Cache-Control', 'public, max-age=31536000, immutable');
      return reply.send(fs.createReadStream(localFile));
    }

    return reply.code(404).send({ error: 'File not found' });
  });

  // PUT & POST /mock-upload and /mock-upload/* - Saves stream/buffer directly to disk when S3/R2 is not configured
  const handleMockUpload = async (req: any, reply: any) => {
    const key = (req.params as any)['*'] || (req.query as any)?.key || `upload-${Date.now()}-${randomUUID()}`;
    const uploadsDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const safeKey = key.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const destinationPath = path.join(uploadsDir, safeKey);

    if (Buffer.isBuffer(req.body)) {
      fs.writeFileSync(destinationPath, req.body);
    } else if (typeof req.body === 'string') {
      fs.writeFileSync(destinationPath, Buffer.from(req.body));
    } else if (req.raw && typeof req.raw.pipe === 'function' && !req.raw.readableEnded) {
      try {
        await pipeline(req.raw, fs.createWriteStream(destinationPath));
      } catch {
        if (!fs.existsSync(destinationPath)) {
          fs.writeFileSync(destinationPath, Buffer.alloc(0));
        }
      }
    } else if (!fs.existsSync(destinationPath)) {
      fs.writeFileSync(destinationPath, Buffer.alloc(0));
    }

    const hostHeader = (req.headers['x-forwarded-host'] as string) || (req.headers.host as string) || '';
    const protoHeader = (req.headers['x-forwarded-proto'] as string) || ((req.socket as any)?.encrypted ? 'https' : 'http');
    let API_URL = process.env.NEXT_PUBLIC_API_URL || '';
    if (!API_URL || API_URL.includes('localhost') || API_URL.includes('127.0.0.1')) {
      if (hostHeader && !hostHeader.includes('localhost') && !hostHeader.includes('127.0.0.1')) {
        API_URL = `${protoHeader}://${hostHeader}/api/v1`;
      } else {
        API_URL = 'https://garage.grekam.in/api/v1';
      }
    }
    const downloadUrl = `${API_URL}/uploads/${safeKey}`;

    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    reply.header('Access-Control-Allow-Headers', '*');
    return reply.code(200).send({ 
      success: true, 
      key: safeKey, 
      url: downloadUrl,
      downloadUrl 
    });
  };

  app.put('/mock-upload', handleMockUpload);
  app.put('/mock-upload/*', handleMockUpload);
  app.post('/mock-upload', handleMockUpload);
  app.post('/mock-upload/*', handleMockUpload);
  app.options('/mock-upload', async (req, reply) => {
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Methods', 'PUT, POST, GET, OPTIONS');
    reply.header('Access-Control-Allow-Headers', '*');
    return reply.code(200).send();
  });
  app.options('/mock-upload/*', async (req, reply) => {
    reply.header('Access-Control-Allow-Origin', '*');
    reply.header('Access-Control-Allow-Methods', 'PUT, POST, GET, OPTIONS');
    reply.header('Access-Control-Allow-Headers', '*');
    return reply.code(200).send();
  });

  // Protected upload endpoints wrapped in nested plugin scope with requireAuth hook
  await app.register(async function protectedStorageRoutes(childApp) {
    const server = childApp.withTypeProvider<ZodTypeProvider>();
    childApp.addHook('preHandler', app.requireAuth);

    server.post('/upload-url', {
      schema: {
        body: z.object({
          filename: z.string().min(1),
          contentType: z.string().min(1),
          prefix: z.string().optional().default('uploads'),
        })
      }
    }, async (req, reply) => {
      const { filename, contentType, prefix } = req.body;
      const tenantId = (req as any).user?.tenantId || 'default';
      
      const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const key = `${tenantId}/${prefix}/${randomUUID()}-${safeFilename}`;

      const hostHeader = (req.headers['x-forwarded-host'] as string) || (req.headers.host as string) || '';
      const protoHeader = (req.headers['x-forwarded-proto'] as string) || ((req.socket as any)?.encrypted ? 'https' : 'http');
      let API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      if (!API_URL || API_URL.includes('localhost') || API_URL.includes('127.0.0.1')) {
        if (hostHeader && !hostHeader.includes('localhost') && !hostHeader.includes('127.0.0.1')) {
          API_URL = `${protoHeader}://${hostHeader}/api/v1`;
        } else {
          API_URL = 'https://garage.grekam.in/api/v1';
        }
      }

      try {
        if (app.s3 && app.s3.client) {
          const uploadUrl = await app.s3.generateUploadUrl(key, contentType);
          const downloadUrl = await app.s3.generateDownloadUrl(key);
          return reply.send({ uploadUrl, key, downloadUrl });
        } else {
          const safeKey = key.replace(/\//g, '_');
          return reply.send({
            uploadUrl: `${API_URL}/storage/mock-upload/${encodeURIComponent(key)}`,
            key,
            downloadUrl: `${API_URL}/uploads/${safeKey}`,
          });
        }
      } catch (err) {
        app.log.warn(err as any, 'S3 unavailable. Falling back to local mock upload.');
        const safeKey = key.replace(/\//g, '_');
        return reply.send({
          uploadUrl: `${API_URL}/storage/mock-upload/${encodeURIComponent(key)}`,
          key,
          downloadUrl: `${API_URL}/uploads/${safeKey}`,
        });
      }
    });

    server.post('/upload-local', async (req, reply) => {
      const data = await req.file();
      if (!data) return reply.code(400).send({ error: 'No file uploaded' });
      
      const uploadsDir = path.resolve(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const tenantId = (req as any).user?.tenantId || 'default';
      const uniqueId = Math.random().toString(36).substring(2, 10);
      const safeFilename = data.filename.replace(/[^a-zA-Z0-9.\-_]/g, '');
      const key = `${tenantId}_${Date.now()}_${uniqueId}_${safeFilename}`;
      const destinationPath = path.join(uploadsDir, key);

      await pipeline(data.file, fs.createWriteStream(destinationPath));

      const hostHeader = (req.headers['x-forwarded-host'] as string) || (req.headers.host as string) || '';
      const protoHeader = (req.headers['x-forwarded-proto'] as string) || ((req.socket as any)?.encrypted ? 'https' : 'http');
      let API_URL = process.env.NEXT_PUBLIC_API_URL || '';
      if (!API_URL || API_URL.includes('localhost') || API_URL.includes('127.0.0.1')) {
        if (hostHeader && !hostHeader.includes('localhost') && !hostHeader.includes('127.0.0.1')) {
          API_URL = `${protoHeader}://${hostHeader}/api/v1`;
        } else {
          API_URL = 'https://garage.grekam.in/api/v1';
        }
      }
      const downloadUrl = `${API_URL}/uploads/${key}`;

      return reply.send({ downloadUrl, key, success: true });
    });
  });
}
