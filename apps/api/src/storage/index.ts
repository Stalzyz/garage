import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

export default async function storageRouter(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // Ensure only authenticated users can upload
  server.addHook('preHandler', app.requireAuth);

  // Mock PUT endpoint for local development without S3
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
    
    // Generate unique key to prevent overwriting
    const ext = filename.split('.').pop() || '';
    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${prefix}/${randomUUID()}-${safeFilename}`;

    try {
      const uploadUrl = await server.s3.generateUploadUrl(key, contentType);
      const downloadUrl = await server.s3.generateDownloadUrl(key);
      
      // Normally downloadUrl requires signing if private. If bucket is public, it can just be constructed.
      // Here we return both the presigned PUT URL and the final public/presigned GET URL.
      
      return reply.send({
        uploadUrl,
        key,
        // Since getSignedUrl gives a temporary URL, if we need a public URL:
        // publicUrl: `https://${server.s3.bucket}.s3.amazonaws.com/${key}`
        downloadUrl
      });
    } catch (err) {
      server.log.error(err as any, 'Failed to generate presigned URL');
      return reply.code(500).send({ error: 'Storage Error', message: 'Failed to generate upload URL' });
    }
  });

  server.post('/upload-local', async (req, reply) => {
    const data = await req.file();
    if (!data) {
      return reply.code(400).send({ error: 'No file uploaded' });
    }
    
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
}
