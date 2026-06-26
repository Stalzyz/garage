import { prisma } from '../db';

export class GamificationService {
  /**
   * Process an assignment grade and conditionally award a badge.
   * For example, if score is >= 90, award the "High Achiever" badge.
   */
  static async evaluateAssignmentGrade(studentId: string, score: number, courseName: string) {
    try {
      if (score >= 90) {
        await this.awardBadge(studentId, "High Achiever", "Score 90% or higher on an assignment", 50);
      }
      
      if (score === 100) {
        await this.awardBadge(studentId, "Perfect Protocol", "Achieve a perfect 100% on any assignment", 100);
      }
      
      // Award a generic completion badge for submitting and getting a grade
      await this.awardBadge(studentId, "First Step", "Complete your first graded assignment", 20);

    } catch (err) {
      console.error("[Gamification] Error evaluating assignment grade", err);
    }
  }

  /**
   * Automatically creates the badge if it doesn't exist,
   * then assigns it to the student if they don't already have it.
   */
  static async awardBadge(studentId: string, badgeName: string, description: string, xp: number) {
    // Upsert the badge definition
    const badge = await prisma.badge.upsert({
      where: { name: badgeName },
      update: {},
      create: {
        name: badgeName,
        description,
        criteria: badgeName.toUpperCase().replace(/\s+/g, '_'),
        xpReward: xp,
        imageUrl: `/badges/${badgeName.toLowerCase().replace(/\s+/g, '-')}.png` // mock URL
      }
    });

    // Check if student already has this badge
    const existing = await prisma.studentBadge.findUnique({
      where: {
        studentId_badgeId: {
          studentId,
          badgeId: badge.id
        }
      }
    });

    if (!existing) {
      await prisma.studentBadge.create({
        data: {
          studentId,
          badgeId: badge.id
        }
      });
      
      // Also increment student XP
      await prisma.student.update({
        where: { id: studentId },
        data: { xp: { increment: xp } }
      });

      console.log(`[Gamification] 🏆 Awarded badge "${badgeName}" to student ${studentId} (+${xp} XP)`);
    }
  }
}
