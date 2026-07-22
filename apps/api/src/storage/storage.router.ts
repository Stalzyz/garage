import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

const GetUploadUrlSchema = z.object({
  filename: z.string(),
  contentType: z.string(),
  prefix: z.string().default('drive/root')
});

export default async function storageRouter(app: FastifyInstance) {
  // Ensure we have S3 config available via env vars
  // Cloudflare R2 uses the S3 API
  const s3 = new S3Client({
    region: 'auto',
    endpoint: process.env.R2_ENDPOINT_URL || '', // e.g. https://<ACCOUNT_ID>.r2.cloudflarestorage.com
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    },
  });

  const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'grekam-os-assets';

  // Mock PUT endpoint for local development without S3
  app.put('/mock-upload', async (req, reply) => {
    // Simply accept the upload and do nothing
    return reply.code(200).send({ success: true });
  });

  // GET /api/v1/storage/asset/*
  // Proxies files directly from R2 if no public domain is configured
  app.get('/asset/*', async (req, reply) => {
    const key = (req.params as any)['*'];
    if (!key) return reply.code(400).send({ error: 'Missing key' });

    try {
      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const response = await s3.send(command);
      if (!response.Body) {
        return reply.code(404).send({ error: 'File empty or not found' });
      }

      // Set headers
      if (response.ContentType) {
        reply.header('Content-Type', response.ContentType);
      }
      if (response.ContentLength) {
        reply.header('Content-Length', response.ContentLength);
      }

      // Stream the response body
      return reply.send(response.Body as any);
    } catch (err: any) {
      if (err.name === 'NoSuchKey') {
        return reply.code(404).send({ error: 'File not found' });
      }
      console.error('R2 GetObject Error:', err);
      return reply.code(500).send({ error: 'Failed to fetch asset' });
    }
  });

  // POST /api/v1/storage/upload-url
  app.post('/upload-url', async (req, reply) => {
    const body = GetUploadUrlSchema.parse(req.body);
    
    // Generate a unique file key
    const uniqueId = Math.random().toString(36).substring(2, 10);
    const safeFilename = body.filename.replace(/[^a-zA-Z0-9.\-_]/g, '');
    const key = `${body.prefix}/${Date.now()}_${uniqueId}_${safeFilename}`;

    // MOCK UPLOAD LOGIC IF NO CREDENTIALS
    if (!process.env.R2_ACCESS_KEY_ID) {
      console.warn('[Storage] R2 Credentials missing. Returning mock upload URL.');
      return {
        uploadUrl: `/api/v1/storage/mock-upload`,
        key,
        downloadUrl: `https://dummyimage.com/600x400/000/fff&text=${safeFilename}`, // Mock image download
      };
    }

    try {
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: body.contentType,
      });

      // The presigned URL allows the frontend to upload directly to R2 for 15 minutes
      const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 900 });

      // We don't have a custom domain setup yet, so we'll mock the public download URL or construct it if there's a public dev URL
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const publicDomain = process.env.R2_PUBLIC_DOMAIN;
      const downloadUrl = publicDomain ? `${publicDomain}/${key}` : `${API_URL}/storage/asset/${key}`;

      return { uploadUrl, key, downloadUrl };
    } catch (err) {
      console.error('Presigned URL Error:', err);
      return reply.code(500).send({ error: 'Failed to generate upload URL. Check R2 environment variables.' });
    }
  });

  // POST /api/v1/storage/upload-local
  app.post('/upload-local', async (req, reply) => {
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

    return { downloadUrl, key, success: true };
  });
}
