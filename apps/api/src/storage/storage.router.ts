import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      return {
        uploadUrl: `${API_URL}/storage/mock-upload`,
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
      const publicDomain = process.env.R2_PUBLIC_DOMAIN || 'https://your-public-r2-domain.com';
      const downloadUrl = `${publicDomain}/${key}`;

      return { uploadUrl, key, downloadUrl };
    } catch (err) {
      console.error('Presigned URL Error:', err);
      return reply.code(500).send({ error: 'Failed to generate upload URL. Check R2 environment variables.' });
    }
  });
}
