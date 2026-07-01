import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { EventBus, SystemEvents } from '../automations/event-bus';

const prisma = new PrismaClient();

/**
 * ACADEMY CRON JOB: Re-engagement Drip Trigger
 */
export function scheduleAcademyJobs() {
  // 1. Re-engagement for inactive leads — 11:00 AM daily
  cron.schedule('0 11 * * *', async () => {
    console.log('[CRON] Running academy inactive lead check...');
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const inactiveAcademyLeads = await prisma.lead.findMany({
        where: {
          businessUnit: 'ACADEMY',
          status: { in: ['ENQUIRY', 'COUNSELLING', 'TRIAL'] },
          updatedAt: { lt: sevenDaysAgo }
        }
      });

      for (const lead of inactiveAcademyLeads) {
        EventBus.emit(SystemEvents.ACADEMY_LEAD_INACTIVE, lead);
        await prisma.lead.update({
          where: { id: lead.id },
          data: { updatedAt: new Date() }
        });
      }
      console.log(`[CRON] Academy inactive lead check done. ${inactiveAcademyLeads.length} leads.`);
    } catch (err) {
      console.error('[CRON] Academy inactive lead job failed:', err);
    }
  }, { timezone: 'Asia/Kolkata' });

  // 2. Fee Due Reminders — 9:00 AM daily (3 days before due date)
  cron.schedule('0 9 * * *', async () => {
    console.log('[CRON] Running fee due reminder check...');
    try {
      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingInstallments = await prisma.feeInstallment.findMany({
        where: {
          status: { in: ['PENDING', 'PARTIAL'] },
          dueDate: {
            gte: today,
            lte: threeDaysFromNow
          }
        },
        include: {
          enrollment: {
            include: {
              student: { include: { user: true } },
              batch: { select: { name: true } }
            }
          }
        }
      });

      for (const inst of upcomingInstallments) {
        const student = inst.enrollment.student;
        EventBus.emit(SystemEvents.FEE_DUE_REMINDER, {
          studentId: student.id,
          studentName: `${student.user.firstName} ${student.user.lastName}`,
          studentEmail: student.user.email,
          studentPhone: student.user.phone,
          amount: `₹${inst.amount - inst.paidAmount}`,
          batchName: inst.enrollment.batch.name,
          dueDate: new Date(inst.dueDate).toLocaleDateString('en-IN'),
        });
      }
      console.log(`[CRON] Fee reminders sent: ${upcomingInstallments.length}`);
    } catch (err) {
      console.error('[CRON] Fee due reminder job failed:', err);
    }
  }, { timezone: 'Asia/Kolkata' });

  // 3. Overdue Fee Detection — 10:00 AM daily
  cron.schedule('0 10 * * *', async () => {
    console.log('[CRON] Running fee overdue check...');
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const overdueInstallments = await prisma.feeInstallment.findMany({
        where: {
          status: { in: ['PENDING', 'PARTIAL'] },
          dueDate: { lt: yesterday }
        },
        include: {
          enrollment: {
            include: {
              student: { include: { user: true } },
              batch: { select: { name: true } }
            }
          }
        }
      });

      for (const inst of overdueInstallments) {
        // Mark as OVERDUE in DB
        await prisma.feeInstallment.update({
          where: { id: inst.id },
          data: { status: 'OVERDUE' }
        });

        const student = inst.enrollment.student;
        EventBus.emit(SystemEvents.FEE_OVERDUE, {
          studentId: student.id,
          studentName: `${student.user.firstName} ${student.user.lastName}`,
          studentEmail: student.user.email,
          studentPhone: student.user.phone,
          amount: `₹${inst.amount - inst.paidAmount}`,
          batchName: inst.enrollment.batch.name,
          dueDate: new Date(inst.dueDate).toLocaleDateString('en-IN'),
          installmentId: inst.id,
        });
      }
      console.log(`[CRON] Overdue fee check done. ${overdueInstallments.length} installments marked OVERDUE.`);
    } catch (err) {
      console.error('[CRON] Fee overdue job failed:', err);
    }
  }, { timezone: 'Asia/Kolkata' });
}
