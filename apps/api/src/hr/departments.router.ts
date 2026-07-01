import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function departmentsRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /
  server.get('/', async (req, reply) => {
    const departments = await server.prisma.department.findMany({
      include: {
        _count: {
          select: { employees: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    return { data: departments };
  });

  // POST /
  server.post('/', {
    schema: {
      body: z.object({
        name: z.string(),
        businessUnit: z.enum(['AGENCY', 'ACADEMY', 'BOTH']).default('BOTH')
      })
    }
  }, async (req, reply) => {
    const { name, businessUnit } = req.body;
    
    // Create new department
    const department = await server.prisma.department.create({
      data: {
        name,
        businessUnit
      }
    });
    
    return reply.status(201).send(department);
  });
}
