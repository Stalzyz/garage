import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';

export default async function badgesRoutes(app: FastifyInstance) {
  const server = app.withTypeProvider<ZodTypeProvider>();

  // Get badges for a student
  server.get('/', {
    schema: {
      querystring: z.object({
        studentId: z.string().optional()
      })
    }
  }, async (req, reply) => {
    const { studentId } = req.query as { studentId?: string };

    if (!studentId) {
      // Return all global badges if no student specified
      const badges = await server.prisma.badge.findMany({
        orderBy: { xpReward: 'asc' }
      });
      return { badges };
    }

    const studentBadges = await server.prisma.studentBadge.findMany({
      where: { studentId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' }
    });
    
    return { badges: studentBadges.map((sb: any) => ({ ...sb.badge, earnedAt: sb.earnedAt })) };
  });

  // For testing/mocking gamification: manually award badge
  server.post('/award', {
    schema: {
      body: z.object({
        studentId: z.string(),
        badgeName: z.string(),
        description: z.string(),
        xp: z.number()
      })
    }
  }, async (req, reply) => {
    const { GamificationService } = await import('./gamification.service');
    const { studentId, badgeName, description, xp } = req.body;
    
    await GamificationService.awardBadge(studentId, badgeName, description, xp);
    
    return reply.status(201).send({ success: true, message: `Badge ${badgeName} awarded!` });
  });
}
