import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function teamsRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get('/', async (req, reply) => {
    const teams = await server.prisma.team.findMany({
      include: {
        department: true,
        _count: {
          select: { employees: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    return { teams };
  });

  server.post('/', {
    schema: {
      body: z.object({
        name: z.string(),
        departmentId: z.string(),
        leaderId: z.string().optional()
      })
    }
  }, async (req, reply) => {
    const { name, departmentId, leaderId } = req.body;
    
    try {
      const team = await server.prisma.team.create({
        data: {
          name,
          departmentId,
          leaderId: leaderId || null
        }
      });
      return reply.status(201).send(team);
    } catch (error: any) {
      return reply.status(500).send({ error: "Failed to create team" });
    }
  });

  server.put('/:id', {
    schema: {
      params: z.object({ id: z.string() }),
      body: z.object({
        name: z.string().optional(),
        departmentId: z.string().optional(),
        leaderId: z.string().optional()
      })
    }
  }, async (req, reply) => {
    try {
      const team = await server.prisma.team.update({
        where: { id: req.params.id },
        data: req.body
      });
      return { team };
    } catch (error) {
      return reply.status(404).send({ error: "Team not found" });
    }
  });

  server.delete('/:id', {
    schema: {
      params: z.object({ id: z.string() })
    }
  }, async (req, reply) => {
    try {
      await server.prisma.team.delete({
        where: { id: req.params.id }
      });
      return reply.status(204).send();
    } catch (error) {
      return reply.status(404).send({ error: "Team not found" });
    }
  });
}
