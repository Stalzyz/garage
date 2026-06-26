import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function messagesRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get('/channels', {
    preHandler: [server.requireAuth]
  }, async (req, reply) => {
    const userId = req.user.id;

    const channels = await server.prisma.chatChannel.findMany({
      where: {
        participants: {
          some: { userId }
        }
      },
      include: {
        participants: {
          include: { user: true }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' }
    });
    return { channels };
  });

  server.post('/channels', {
    preHandler: [server.requireAuth],
    schema: {
      body: z.object({
        name: z.string().optional(),
        type: z.enum(['DIRECT', 'GROUP', 'PROJECT']),
        participantIds: z.array(z.string())
      })
    }
  }, async (req, reply) => {
    const { name, type, participantIds } = req.body;
    const userId = req.user.id;

    // Include the creator in the participants
    const allParticipantIds = Array.from(new Set([...participantIds, userId]));

    // If it's a DIRECT chat, check if it already exists between these two users
    if (type === 'DIRECT' && allParticipantIds.length === 2) {
      const existing = await server.prisma.chatChannel.findFirst({
        where: {
          type: 'DIRECT',
          AND: [
            { participants: { some: { userId: allParticipantIds[0] } } },
            { participants: { some: { userId: allParticipantIds[1] } } }
          ]
        },
        include: { participants: true }
      });
      if (existing) return reply.send(existing);
    }

    const channel = await server.prisma.chatChannel.create({
      data: {
        name,
        type,
        participants: {
          create: allParticipantIds.map(id => ({ userId: id }))
        }
      },
      include: { participants: { include: { user: true } } }
    });

    return reply.status(201).send(channel);
  });

  server.get('/channels/:id/messages', {
    preHandler: [server.requireAuth],
    schema: { params: z.object({ id: z.string() }) }
  }, async (req, reply) => {
    const { id } = req.params;
    const messages = await server.prisma.chatMessage.findMany({
      where: { channelId: id },
      orderBy: { createdAt: 'asc' }
    });
    return { messages };
  });

  server.post('/channels/:id/messages', {
    preHandler: [server.requireAuth],
    schema: {
      params: z.object({ id: z.string() }),
      body: z.object({
        content: z.string(),
        attachment: z.string().optional()
      })
    }
  }, async (req, reply) => {
    const { id } = req.params;
    const data = req.body;
    const senderId = req.user.id;

    const message = await server.prisma.chatMessage.create({
      data: {
        channelId: id,
        senderId: senderId,
        content: data.content,
        attachment: data.attachment
      }
    });

    await server.prisma.chatChannel.update({
      where: { id },
      data: { updatedAt: new Date() }
    });

    const messageWithSender = await server.prisma.chatMessage.findUnique({
      where: { id: message.id }
    });

    // Broadcast via WebSockets
    (app as any).broadcast('NEW_CHAT_MESSAGE', messageWithSender);

    return reply.status(201).send(messageWithSender);
  });
}
