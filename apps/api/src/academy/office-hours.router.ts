import { FastifyInstance } from 'fastify';
import { z } from 'zod';

export default async function officeHoursRouter(app: FastifyInstance) {
  
  // ── GET /api/v1/academy/office-hours ─────────────────────────────────────
  // Get upcoming office hours
  app.get('/', async (req, reply) => {
    const hours = await app.prisma.officeHour.findMany({
      where: { scheduledFor: { gte: new Date() } },
      include: {
        mentor: { select: { firstName: true, lastName: true, avatarUrl: true } },
        _count: { select: { bookings: true } }
      },
      orderBy: { scheduledFor: 'asc' }
    });
    return hours;
  });

  // ── POST /api/v1/academy/office-hours ────────────────────────────────────
  // Mentor creates a slot
  app.post('/', async (req, reply) => {
    const schema = z.object({
      title: z.string(),
      scheduledFor: z.string(),
      durationMins: z.number().default(15),
      capacity: z.number().default(1),
      meetLink: z.string().optional()
    });
    const body = schema.parse(req.body);

    // Get current mentor (mocking auth)
    const mentor = await app.prisma.user.findFirst({ where: { role: 'EDUCATOR' } });
    if (!mentor) return reply.code(401).send({ error: 'Not authorized' });

    const slot = await app.prisma.officeHour.create({
      data: {
        ...body,
        scheduledFor: new Date(body.scheduledFor),
        mentorId: mentor.id
      }
    });
    return slot;
  });

  // ── POST /api/v1/academy/office-hours/:id/book ─────────────────────────
  app.post('/:id/book', async (req, reply) => {
    const { id } = req.params as { id: string };
    
    // Get current student (mocking auth)
    const user = await app.prisma.user.findFirst({ where: { role: 'STUDENT' } });
    if (!user) return reply.code(401).send({ error: 'Not authorized' });
    const student = await app.prisma.student.findUnique({ where: { userId: user.id } });
    if (!student) return reply.code(401).send({ error: 'Student profile not found' });

    // Check capacity
    const slot = await app.prisma.officeHour.findUnique({
      where: { id },
      include: { _count: { select: { bookings: true } } }
    });

    if (!slot) return reply.notFound('Slot not found');
    if (slot._count.bookings >= slot.capacity) {
      return reply.code(400).send({ message: 'This slot is fully booked' });
    }

    try {
      const booking = await app.prisma.officeHourBooking.create({
        data: {
          officeHourId: slot.id,
          studentId: student.id
        }
      });
      return { success: true, booking };
    } catch (err: any) {
      // Prisma unique constraint violation
      if (err.code === 'P2002') {
        return reply.code(400).send({ message: 'You have already booked this slot' });
      }
      throw err;
    }
  });
}
