import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { randomUUID } from 'crypto';

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
}
