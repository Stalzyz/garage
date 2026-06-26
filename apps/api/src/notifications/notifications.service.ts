import { prisma } from '../db';

export async function createNotification(data: {
  userId: string;
  type: 'TASK_ASSIGNED' | 'DEADLINE_APPROACHING' | 'APPROVAL_NEEDED' | 'PAYMENT_RECEIVED' | 'PAYMENT_OVERDUE' | 'MILESTONE_REACHED' | 'LEAVE_APPROVED' | 'ASSIGNMENT_GRADED' | 'NEW_MESSAGE' | 'SYSTEM';
  title: string;
  body: string;
  link?: string;
}) {
  const notif = await prisma.notification.create({
    data,
  });

  // Future enhancement: Broadcast via WebSocket directly if we have access to the app instance
  return notif;
}
