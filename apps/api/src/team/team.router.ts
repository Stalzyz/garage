import { FastifyInstance } from 'fastify';
import { z } from 'zod';

const CreateGoalSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  targetValue: z.coerce.number().positive(),
  currentValue: z.coerce.number().nonnegative().optional().default(0),
  unit: z.string().optional().default('%'),
  dueDate: z.string().min(1),
  status: z.string().optional().default('ON_TRACK'),
});

const CreateAnnouncementSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  category: z.string().optional().default('GENERAL'),
  isPinned: z.boolean().optional().default(false),
});

const CreateAchievementSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  badge: z.string().optional().default('PROJECT_HERO'),
  graffitiTheme: z.string().optional().default('CYBERPUNK_NEON'),
});

export default async function teamRouter(app: FastifyInstance) {
  
  // ─── GOALS ───────────────────────────────────────────────
  app.get('/goals', async (req, reply) => {
    const goals = await app.prisma.teamGoal.findMany({
      orderBy: { dueDate: 'asc' },
    });
    return { data: goals };
  });

  app.post('/goals', async (req, reply) => {
    const body = CreateGoalSchema.parse(req.body);
    const user = (req as any).user;
    const authorName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Admin';

    const goal = await app.prisma.teamGoal.create({
      data: {
        title: body.title,
        description: body.description || null,
        targetValue: body.targetValue,
        currentValue: body.currentValue || 0,
        unit: body.unit || '%',
        dueDate: new Date(body.dueDate),
        status: body.status || 'ON_TRACK',
        createdBy: authorName,
      },
    });

    reply.code(201);
    return goal;
  });

  app.patch('/goals/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const body = req.body as any;

    const goal = await app.prisma.teamGoal.update({
      where: { id },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.targetValue !== undefined && { targetValue: Number(body.targetValue) }),
        ...(body.currentValue !== undefined && { currentValue: Number(body.currentValue) }),
        ...(body.unit && { unit: body.unit }),
        ...(body.status && { status: body.status }),
        ...(body.dueDate && { dueDate: new Date(body.dueDate) }),
      },
    });

    return goal;
  });

  app.delete('/goals/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    await app.prisma.teamGoal.delete({ where: { id } });
    return { success: true };
  });


  // ─── ANNOUNCEMENTS ─────────────────────────────────────────
  app.get('/announcements', async (req, reply) => {
    const announcements = await app.prisma.teamAnnouncement.findMany({
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
    });
    return { data: announcements };
  });

  app.post('/announcements', async (req, reply) => {
    const body = CreateAnnouncementSchema.parse(req.body);
    const user = (req as any).user;
    const authorName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Management';

    const announcement = await app.prisma.teamAnnouncement.create({
      data: {
        title: body.title,
        content: body.content,
        category: body.category || 'GENERAL',
        isPinned: body.isPinned || false,
        authorName,
      },
    });

    reply.code(201);
    return announcement;
  });

  app.delete('/announcements/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    await app.prisma.teamAnnouncement.delete({ where: { id } });
    return { success: true };
  });


  // ─── ACHIEVEMENTS & WINS ─────────────────────────────────
  app.get('/achievements', async (req, reply) => {
    const achievements = await app.prisma.teamAchievement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { data: achievements };
  });

  app.post('/achievements', async (req, reply) => {
    const body = CreateAchievementSchema.parse(req.body);
    const user = (req as any).user;
    const authorName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Team Member';
    const authorRole = user?.role || 'Staff';

    const achievement = await app.prisma.teamAchievement.create({
      data: {
        authorId: user?.id || 'anonymous',
        authorName,
        authorRole,
        title: body.title,
        description: body.description,
        badge: body.badge || 'PROJECT_HERO',
        graffitiTheme: body.graffitiTheme || 'CYBERPUNK_NEON',
        reactions: { "🎉": 1, "🔥": 1 },
        wishes: [],
      },
    });

    reply.code(201);
    return achievement;
  });

  // Reaction to achievement
  app.post('/achievements/:id/react', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { emoji } = req.body as { emoji: string };

    if (!emoji) return reply.badRequest('Emoji is required');

    const achievement = await app.prisma.teamAchievement.findUnique({ where: { id } });
    if (!achievement) return reply.notFound('Achievement not found');

    const currentReactions: Record<string, number> = (achievement.reactions as any) || {};
    currentReactions[emoji] = (currentReactions[emoji] || 0) + 1;

    const updated = await app.prisma.teamAchievement.update({
      where: { id },
      data: { reactions: currentReactions },
    });

    return updated;
  });

  // Wish / Wish Comment on achievement
  app.post('/achievements/:id/wish', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { text } = req.body as { text: string };
    const user = (req as any).user;
    const authorName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'Team Member';

    if (!text || !text.trim()) return reply.badRequest('Wish text is required');

    const achievement = await app.prisma.teamAchievement.findUnique({ where: { id } });
    if (!achievement) return reply.notFound('Achievement not found');

    const currentWishes: any[] = (achievement.wishes as any[]) || [];
    const newWish = {
      id: `wish_${Date.now()}`,
      authorName,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    currentWishes.unshift(newWish);

    const updated = await app.prisma.teamAchievement.update({
      where: { id },
      data: { wishes: currentWishes },
    });

    return updated;
  });

}
