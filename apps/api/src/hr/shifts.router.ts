import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function shiftsRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /
  server.get('/', async (req, reply) => {
    const shifts = await server.prisma.shift.findMany({
      include: {
        _count: {
          select: { employeeShifts: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { data: shifts };
  });

  // POST /
  server.post('/', {
    schema: {
      body: z.object({
        name: z.string(),
        type: z.enum(['STANDARD', 'SPLIT', 'OPEN']),
        startTime: z.string().default('09:00'),
        endTime: z.string().default('17:00'),
        startTime2: z.string().optional(),
        endTime2: z.string().optional(),
        minHours: z.number().default(8.0),
        isFlexible: z.boolean().default(false)
      })
    }
  }, async (req, reply) => {
    const shift = await server.prisma.shift.create({
      data: req.body
    });
    return reply.status(201).send(shift);
  });

  // PUT /:id
  server.put('/:id', {
    schema: {
      params: z.object({ id: z.string() }),
      body: z.object({
        name: z.string(),
        type: z.enum(['STANDARD', 'SPLIT', 'OPEN']),
        startTime: z.string(),
        endTime: z.string(),
        startTime2: z.string().optional().nullable(),
        endTime2: z.string().optional().nullable(),
        minHours: z.number(),
        isFlexible: z.boolean()
      })
    }
  }, async (req, reply) => {
    const { id } = req.params;
    const shift = await server.prisma.shift.update({
      where: { id },
      data: req.body
    });
    return shift;
  });

  // DELETE /:id
  server.delete('/:id', {
    schema: {
      params: z.object({ id: z.string() })
    }
  }, async (req, reply) => {
    const { id } = req.params;
    await server.prisma.shift.delete({
      where: { id }
    });
    return { success: true };
  });

  // GET /assignments
  server.get('/assignments', async (req, reply) => {
    const assignments = await server.prisma.employeeShift.findMany({
      include: {
        employee: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        shift: true
      },
      orderBy: { startDate: 'desc' }
    });
    return { data: assignments };
  });

  // POST /assign
  server.post('/assign', {
    schema: {
      body: z.object({
        employeeId: z.string(),
        shiftId: z.string(),
        startDate: z.string() // ISO Date or YYYY-MM-DD
      })
    }
  }, async (req, reply) => {
    const { employeeId, shiftId, startDate } = req.body;
    
    const parsedDate = new Date(startDate);
    
    // Upsert or create employee shift assignment
    const assignment = await server.prisma.employeeShift.upsert({
      where: {
        employeeId_startDate: {
          employeeId,
          startDate: parsedDate
        }
      },
      update: {
        shiftId
      },
      create: {
        employeeId,
        shiftId,
        startDate: parsedDate
      }
    });

    // Also update the employee's active attendance logs for this date if exists
    await server.prisma.attendance.updateMany({
      where: {
        employeeId,
        date: parsedDate
      },
      data: {
        shiftId
      }
    });

    return reply.status(201).send(assignment);
  });
}
