import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { EventBus, SystemEvents } from '../automations/event-bus';

const prisma = new PrismaClient();

/**
 * ACADEMY CRON JOB: Re-engagement Drip Trigger
 * Runs every day at 11:00 AM.
 * Finds ACADEMY leads in ENQUIRY, COUNSELLING, or TRIAL status that have had no updates in the last 7 days.
 * Emits the ACADEMY_LEAD_INACTIVE event (which sends a re-engagement email).
 */
export function scheduleAcademyJobs() {
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
        console.log(`[CRON] Triggered re-engagement for inactive Academy lead: ${lead.name} (${lead.email})`);
        
        // Touch updatedAt so we don't spam them every single day.
        // It updates the updatedAt timestamp to the current time, giving them another 7 days.
        await prisma.lead.update({
          where: { id: lead.id },
          data: { updatedAt: new Date() }
        });
      }

      console.log(`[CRON] Academy inactive lead check complete. Processed ${inactiveAcademyLeads.length} leads.`);
    } catch (err) {
      console.error('[CRON] Academy inactive lead job failed:', err);
    }
  }, { timezone: 'Asia/Kolkata' });
}
