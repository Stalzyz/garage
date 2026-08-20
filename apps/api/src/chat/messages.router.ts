import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function messagesRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get('/channels', {
    preHandler: [server.requireAuth]
  }, async (req, reply) => {
    const userId = req.user.id;

    let channels = await server.prisma.chatChannel.findMany({
      where: {
        participants: {
          some: { userId }
        }
      },
      include: {
        participants: {
          include: { user: { select: { id: true, name: true, email: true, image: true, role: true } } }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: { select: { id: true, name: true, email: true, image: true, role: true } }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    // If user has no channels yet, auto-provision a General / Support channel
    if (channels.length === 0) {
      const admins = await server.prisma.user.findMany({
        where: { role: { in: ['SUPER_ADMIN', 'MANAGER', 'STAFF'] } },
        take: 3,
        select: { id: true }
      });
      const participantIds = Array.from(new Set([userId, ...admins.map(a => a.id)]));

      const newChannel = await server.prisma.chatChannel.create({
        data: {
          name: "Project & Team Support",
          type: "GROUP",
          participants: {
            create: participantIds.map(id => ({ userId: id }))
          },
          messages: {
            create: {
              senderId: admins[0]?.id || userId,
              content: "Welcome to Grekam Team Chat! You can message us here directly regarding your projects, deliverables, and support requests."
            }
          }
        },
        include: {
          participants: {
            include: { user: { select: { id: true, name: true, email: true, image: true, role: true } } }
          },
          messages: {
            include: {
              sender: { select: { id: true, name: true, email: true, image: true, role: true } }
            }
          }
        }
      });
      channels = [newChannel];
    }

    return { channels };
  });

  server.post('/channels', {
    preHandler: [server.requireAuth],
    schema: {
      body: z.object({
        name: z.string().optional(),
        type: z.enum(['DIRECT', 'GROUP', 'PROJECT']).default('GROUP'),
        participantIds: z.array(z.string()).optional().default([]),
        projectId: z.string().optional()
      })
    }
  }, async (req, reply) => {
    const { name, type, participantIds = [], projectId } = req.body;
    const userId = req.user.id;

    // Include admin users if participant list is empty
    let allParticipantIds = Array.from(new Set([...participantIds, userId]));
    if (allParticipantIds.length === 1) {
      const admins = await server.prisma.user.findMany({
        where: { role: { in: ['SUPER_ADMIN', 'MANAGER', 'STAFF'] } },
        take: 2,
        select: { id: true }
      });
      allParticipantIds = Array.from(new Set([...allParticipantIds, ...admins.map(a => a.id)]));
    }

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
        include: { 
          participants: { include: { user: true } },
          messages: { take: 1, orderBy: { createdAt: 'desc' } }
        }
      });
      if (existing) return reply.send(existing);
    }

    const channel = await server.prisma.chatChannel.create({
      data: {
        name: name || "Project Chat",
        type,
        projectId,
        participants: {
          create: allParticipantIds.map(id => ({ userId: id }))
        }
      },
      include: { 
        participants: { include: { user: true } },
        messages: true
      }
    });

    return reply.status(201).send(channel);
  });

  server.get('/channels/:id/messages', {
    preHandler: [server.requireAuth],
    schema: { params: z.object({ id: z.string() }) }
  }, async (req, reply) => {
    const { id } = req.params;
    const rawMessages = await server.prisma.chatMessage.findMany({
      where: { channelId: id },
      include: {
        sender: {
          select: { id: true, name: true, email: true, image: true, role: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    // Map sender to user property for frontend compatibility
    const messages = rawMessages.map(m => ({
      ...m,
      user: m.sender
    }));

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

    // Ensure sender is a participant
    const isParticipant = await server.prisma.chatParticipant.findFirst({
      where: { channelId: id, userId: senderId }
    });
    if (!isParticipant) {
      await server.prisma.chatParticipant.create({
        data: { channelId: id, userId: senderId }
      });
    }

    const message = await server.prisma.chatMessage.create({
      data: {
        channelId: id,
        senderId: senderId,
        content: data.content,
        attachment: data.attachment
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true, image: true, role: true }
        }
      }
    });

    await server.prisma.chatChannel.update({
      where: { id },
      data: { updatedAt: new Date() }
    });

    const formattedMessage = {
      ...message,
      user: message.sender
    };

    // Broadcast via WebSockets if available
    try {
      if ((app as any).broadcast) {
        (app as any).broadcast('NEW_CHAT_MESSAGE', formattedMessage);
      }
    } catch (e) {
      // WS broadcast safe catch
    }

    return reply.status(201).send(formattedMessage);
  });
}
