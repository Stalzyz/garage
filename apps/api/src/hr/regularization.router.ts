import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function regularizationRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // GET /
  server.get('/', async (req, reply) => {
    const requests = await server.prisma.attendanceRegularization.findMany({
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
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    return { data: requests };
  });

  // POST /
  server.post('/', {
    schema: {
      body: z.object({
        employeeId: z.string(),
        date: z.string(), // ISO Date
        requestType: z.enum(['CLOCK_IN', 'CLOCK_OUT', 'FULL_DAY']),
        requestedTime: z.string().optional(), // ISO Date String
        reason: z.string()
      })
    }
  }, async (req, reply) => {
    const { employeeId, date, requestType, requestedTime, reason } = req.body;
    
    const request = await server.prisma.attendanceRegularization.create({
      data: {
        employeeId,
        date: new Date(date),
        requestType,
        requestedTime: requestedTime ? new Date(requestedTime) : null,
        reason,
        status: 'PENDING'
      }
    });

    return reply.status(201).send(request);
  });

  // PUT /:id/action
  server.put('/:id/action', {
    schema: {
      params: z.object({ id: z.string() }),
      body: z.object({
        action: z.enum(['APPROVED', 'REJECTED']),
        approvedBy: z.string().optional()
      })
    }
  }, async (req, reply) => {
    const { id } = req.params;
    const { action, approvedBy } = req.body;

    const request = await server.prisma.attendanceRegularization.findUnique({
      where: { id }
    });

    if (!request) {
      return reply.status(404).send({ message: "Request not found" });
    }

    const updatedRequest = await server.prisma.attendanceRegularization.update({
      where: { id },
      data: {
        status: action,
        approvedBy: approvedBy || 'Admin',
        approvedAt: new Date()
      }
    });

    // If approved, update the actual Attendance log for that date
    if (action === 'APPROVED') {
      const attDate = new Date(request.date);
      
      const existingAttendance = await server.prisma.attendance.findFirst({
        where: {
          employeeId: request.employeeId,
          date: attDate
        }
      });

      const updateData: any = {
        isRegularized: true
      };

      if (request.requestType === 'CLOCK_IN' && request.requestedTime) {
        updateData.clockIn = new Date(request.requestedTime);
        updateData.status = 'PRESENT';
      } else if (request.requestType === 'CLOCK_OUT' && request.requestedTime) {
        updateData.clockOut = new Date(request.requestedTime);
      } else if (request.requestType === 'FULL_DAY') {
        updateData.status = 'PRESENT';
        if (request.requestedTime) {
          updateData.clockIn = new Date(request.requestedTime);
          const outTime = new Date(request.requestedTime);
          outTime.setHours(outTime.getHours() + 8);
          updateData.clockOut = outTime;
        }
      }

      if (existingAttendance) {
        await server.prisma.attendance.update({
          where: { id: existingAttendance.id },
          data: updateData
        });
      } else {
        await server.prisma.attendance.create({
          data: {
            employeeId: request.employeeId,
            date: attDate,
            status: 'PRESENT',
            ...updateData
          }
        });
      }
    }

    return updatedRequest;
  });
}
