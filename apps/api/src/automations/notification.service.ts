import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const NotificationService = {
  /**
   * Generates a persistent in-app notification in the database
   */
  async createNotification(userId: string, title: string, body: string, link?: string, type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' | 'SYSTEM' = 'SYSTEM') {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId,
          title,
          body,
          link,
          type,
        }
      });
      console.log(`[NotificationService] Generated in-app notification for User: ${userId}`);
      return notification;
    } catch (err) {
      console.error(`[NotificationService] Failed to create notification`, err);
    }
  }
};
