import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function rbacRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get('/roles', async (req, reply) => {
    const roles = await server.prisma.role.findMany({
      include: { permissions: true },
      orderBy: { name: 'asc' }
    });
    return { roles };
  });

  server.post('/roles', {
    schema: {
      body: z.object({
        name: z.string(),
        description: z.string().optional(),
        permissions: z.array(z.object({
          resource: z.string(),
          action: z.string()
        }))
      })
    }
  }, async (req, reply) => {
    const data = req.body;
    
    const role = await server.prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        permissions: {
          create: data.permissions
        }
      },
      include: { permissions: true }
    });
    
    return reply.status(201).send(role);
  });

  server.patch('/roles/:id', {
    schema: {
      params: z.object({ id: z.string() }),
      body: z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        permissions: z.array(z.object({
          resource: z.string(),
          action: z.string()
        })).optional()
      })
    }
  }, async (req, reply) => {
    const { id } = req.params;
    const data = req.body;
    
    // If updating permissions, we replace all existing ones (simplest approach)
    if (data.permissions) {
      await server.prisma.permission.deleteMany({ where: { roleId: id } });
    }

    const role = await server.prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        ...(data.permissions && {
          permissions: {
            create: data.permissions
          }
        })
      },
      include: { permissions: true }
    });
    
    return reply.status(200).send(role);
  });

  server.get('/system', async (req, reply) => {
    const settings = await server.prisma.systemSetting.findMany();
    return { settings };
  });

  server.put('/system/:key', {
    schema: {
      params: z.object({ key: z.string() }),
      body: z.object({
        value: z.any()
      })
    }
  }, async (req, reply) => {
    const { key } = req.params;
    const { value } = req.body;

    const setting = await server.prisma.systemSetting.upsert({
      where: { key },
      update: { value, updatedBy: "cuid-admin-1" },
      create: { key, value, updatedBy: "cuid-admin-1" }
    });

    return reply.status(200).send(setting);
  });
}
