import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { createNotification } from '../notifications/notifications.service';

export default async function ticketsRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get('/', {
    preHandler: [server.requireAuth]
  }, async (req, reply) => {
    const tickets = await server.prisma.ticket.findMany({
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    return { tickets };
  });

  server.post('/', {
    schema: {
      body: z.object({
        subject: z.string(),
        priority: z.string(),
        message: z.string()
      })
    },
    preHandler: [server.requireAuth]
  }, async (req, reply) => {
    const data = req.body;
    const userId = req.user.id;

    const ticket = await server.prisma.ticket.create({
      data: {
        subject: data.subject,
        priority: data.priority,
        status: "OPEN",
        userId: userId,
        messages: {
          create: {
            senderId: userId,
            message: data.message,
            isInternal: false
          }
        }
      },
      include: { messages: true }
    });
    return reply.status(201).send(ticket);
  });

  server.post('/:id/messages', {
    schema: {
      params: z.object({ id: z.string() }),
      body: z.object({
        message: z.string(),
        isInternal: z.boolean().optional().default(false)
      })
    },
    preHandler: [server.requireAuth]
  }, async (req, reply) => {
    const { id } = req.params;
    const { message, isInternal } = req.body;
    const senderId = req.user.id;

    const ticketMessage = await server.prisma.ticketMessage.create({
      data: {
        ticketId: id,
        senderId: senderId,
        message: message,
        isInternal: isInternal
      }
    });

    const ticket = await server.prisma.ticket.update({
      where: { id },
      data: { updatedAt: new Date() }
    });

    if (ticket.userId !== senderId) {
      await createNotification({
        userId: ticket.userId,
        type: 'NEW_MESSAGE',
        title: 'New Support Reply',
        body: `Your ticket "${ticket.subject}" has a new response.`,
        link: '/dashboard/support',
      });
    }

    return reply.status(201).send(ticketMessage);
  });

  server.patch('/:id/status', {
    schema: {
      params: z.object({ id: z.string() }),
      body: z.object({ status: z.string() })
    },
    preHandler: [server.requireAuth]
  }, async (req, reply) => {
    const { id } = req.params;
    const { status } = req.body;
    
    // In a real app we'd verify the user owns the ticket or is staff
    const ticket = await server.prisma.ticket.update({
      where: { id },
      data: { status, updatedAt: new Date() }
    });

    return ticket;
  });
}
