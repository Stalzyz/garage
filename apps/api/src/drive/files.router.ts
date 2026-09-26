import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';

function normalizeDriveUrl(url: string): string {
  if (!url) return url;
  if (url.includes('r2.cloudflarestorage.com')) {
    const match = url.match(/\/grekamos\/(drive\/[^?]+)/);
    if (match && match[1]) {
      return `https://dashboard.grekam.in/api/v1/storage/asset/${match[1]}`;
    }
  }
  if (url.includes('localhost:4000') || url.includes('127.0.0.1:4000')) {
    return url.replace(/https?:\/\/(localhost|127\.0\.0\.1):4000/g, 'https://agency.grekam.in');
  }
  return url;
}

export default async function filesRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get('/folders/:id/contents', {
    schema: { params: z.object({ id: z.string() }) }
  }, async (req, reply) => {
    const { id } = req.params;
    const isRoot = id === 'root';

    const folders = await server.prisma.driveFolder.findMany({
      where: { parentId: isRoot ? null : id },
      orderBy: { name: 'asc' }
    });

    const rawFiles = await server.prisma.driveFile.findMany({
      where: { folderId: isRoot ? null : id },
      orderBy: { createdAt: 'desc' }
    });

    const files = rawFiles.map(f => ({
      ...f,
      fileUrl: normalizeDriveUrl(f.fileUrl)
    }));

    return { folders, files };
  });

  server.post('/folders', {
    schema: {
      body: z.object({
        name: z.string(),
        parentId: z.string().nullable().optional()
      })
    }
  }, async (req, reply) => {
    const data = req.body;
    const folder = await server.prisma.driveFolder.create({
      data: {
        name: data.name,
        parentId: data.parentId
      }
    });
    return reply.status(201).send(folder);
  });

  server.delete('/folders/:id', {
    schema: { params: z.object({ id: z.string() }) }
  }, async (req, reply) => {
    const { id } = req.params;
    await server.prisma.driveFile.deleteMany({ where: { folderId: id } });
    await server.prisma.driveFolder.delete({ where: { id } });
    return { success: true, message: 'Folder and contents deleted successfully' };
  });

  server.post('/files', {
    schema: {
      body: z.object({
        name: z.string(),
        folderId: z.string().nullable().optional(),
        fileUrl: z.string().url(),
        mimeType: z.string(),
        sizeBytes: z.number()
      })
    }
  }, async (req, reply) => {
    const data = req.body;
    const uploader = (req as any).user?.id || 'cuid-user-1';

    const normalizedUrl = normalizeDriveUrl(data.fileUrl);

    const file = await server.prisma.driveFile.create({
      data: {
        name: data.name,
        folderId: data.folderId,
        fileUrl: normalizedUrl,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
        uploadedBy: uploader
      }
    });
    return reply.status(201).send(file);
  });

  server.delete('/files/:id', {
    schema: { params: z.object({ id: z.string() }) }
  }, async (req, reply) => {
    const { id } = req.params;
    const file = await server.prisma.driveFile.findUnique({ where: { id } });
    if (!file) {
      return reply.status(404).send({ error: 'File not found' });
    }

    await server.prisma.driveFile.delete({ where: { id } });

    // Remove from R2 if credentials present
    try {
      if (process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
        const s3 = new S3Client({
          region: 'auto',
          endpoint: process.env.R2_ENDPOINT_URL || '',
          credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
          },
        });
        const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'grekamos';
        let key = '';
        if (file.fileUrl.includes('/storage/asset/')) {
          key = file.fileUrl.split('/storage/asset/')[1]?.split('?')[0];
        } else if (file.fileUrl.includes('/grekamos/')) {
          key = file.fileUrl.split('/grekamos/')[1]?.split('?')[0];
        }
        if (key) {
          await s3.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: decodeURIComponent(key) }));
        }
      }
    } catch (err) {
      app.log.warn(`Failed to delete object from R2: ${err}`);
    }

    return { success: true, message: 'File deleted successfully' };
  });
}
