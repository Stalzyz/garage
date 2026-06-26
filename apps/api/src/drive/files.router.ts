import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

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

    const files = await server.prisma.driveFile.findMany({
      where: { folderId: isRoot ? null : id },
      orderBy: { name: 'asc' }
    });

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

  // Simplified file record creation (assuming client uploads to S3 directly and sends metadata)
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
    const uploader = "cuid-user-1"; // Mock uploader

    const file = await server.prisma.driveFile.create({
      data: {
        name: data.name,
        folderId: data.folderId,
        fileUrl: data.fileUrl,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
        uploadedBy: uploader
      }
    });
    return reply.status(201).send(file);
  });
}
