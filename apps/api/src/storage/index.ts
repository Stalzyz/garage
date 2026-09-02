import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

export default async function storageRouter(app: FastifyInstance) {
  // PUBLIC GET /api/v1/storage/asset/*
  // Streams R2 images directly with CORS & caching headers enabled (no auth required)
  app.get('/asset/*', async (req, reply) => {
    const key = (req.params as any)['*'];
    if (!key) return reply.code(400).send({ error: 'Missing key' });

    try {
      const { GetObjectCommand } = await import('@aws-sdk/client-s3');
      const command = new GetObjectCommand({
        Bucket: app.s3.bucket,
        Key: key,
      });

      const response = await app.s3.client.send(command);
      if (!response.Body) {
        return reply.code(404).send({ error: 'File empty or not found' });
      }

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
    } catch (err: any) {
      if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) {
        return reply.code(404).send({ error: 'File not found' });
      }
      app.log.error(err, 'R2 GetObject Error');
      return reply.code(500).send({ error: 'Failed to fetch asset' });
    }
  });

  // Protected upload endpoints wrapped in nested plugin scope with requireAuth hook
  await app.register(async function protectedStorageRoutes(childApp) {
    const server = childApp.withTypeProvider<ZodTypeProvider>();
    childApp.addHook('preHandler', app.requireAuth);

    server.put('/mock-upload', async (req, reply) => {
      return reply.code(200).send({ success: true });
    });

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
      
      const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const key = `${prefix}/${randomUUID()}-${safeFilename}`;

      try {
        const uploadUrl = await app.s3.generateUploadUrl(key, contentType);
        const downloadUrl = await app.s3.generateDownloadUrl(key);
        return reply.send({ uploadUrl, key, downloadUrl });
      } catch (err) {
        app.log.error(err as any, 'Failed to generate presigned URL');
        return reply.code(500).send({ error: 'Storage Error', message: 'Failed to generate upload URL' });
      }
    });

    server.post('/upload-local', async (req, reply) => {
      const data = await req.file();
      if (!data) return reply.code(400).send({ error: 'No file uploaded' });
      
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const uniqueId = Math.random().toString(36).substring(2, 10);
      const safeFilename = data.filename.replace(/[^a-zA-Z0-9.\-_]/g, '');
      const key = `${Date.now()}_${uniqueId}_${safeFilename}`;
      const destinationPath = path.join(uploadsDir, key);

      await pipeline(data.file, fs.createWriteStream(destinationPath));

      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const downloadUrl = `${API_URL}/uploads/${key}`;

      return reply.send({ downloadUrl, key, success: true });
    });
  });
}
