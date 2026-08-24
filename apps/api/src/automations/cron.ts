import cron from 'node-cron';
import { prisma } from '../db';
import { sendEmail, EmailTemplates } from '../integrations/email.service';

export function initializeCronJobs() {
  console.log('[Autopilot] Initializing Cron Jobs...');

  // 1. Abandoned Proposals Drip
  // Runs every hour
  cron.schedule('0 * * * *', async () => {
    console.log('[Cron] Checking for abandoned proposals...');
    try {
      const now = new Date();
      
      // Find proposals that were SENT 24-25 hours ago, but not viewed or signed
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneDayAgoWindow = new Date(oneDayAgo.getTime() - 60 * 60 * 1000);
      
      const proposals24h = await prisma.proposal.findMany({
        where: {
          status: 'SENT',
          updatedAt: { gte: oneDayAgoWindow, lte: oneDayAgo },
          contact: { email: { not: null } }
        },
        include: { contact: true, lead: true }
      });

      for (const proposal of proposals24h) {
        const email = proposal.contact?.email || proposal.lead?.email;
        const name = proposal.contact?.firstName || proposal.lead?.name || 'Client';
        
        if (email) {
          const portalUrl = process.env.PORTAL_URL || 'https://garage.grekam.in';
          const link = `${portalUrl}/proposal/${proposal.publicToken}`;
          
          await sendEmail(email, {
            subject: `Still thinking about ${proposal.title}?`,
            html: `
              <h2 style="color:#fff;font-size:22px;margin:0 0 8px;">Just checking in!</h2>
              <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin:0 0 24px;">
                Hi ${name}, we noticed you haven't reviewed the proposal for <strong>${proposal.title}</strong> yet. 
                If you have any questions or need adjustments, we're here to help!
              </p>
              <a href="${link}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;text-decoration:none;padding:14px 28px;border-radius:10px;font-weight:600;font-size:14px;">Review Proposal</a>
            `
          });
          console.log(`[Cron] Sent 24h abandoned proposal drip to ${email}`);
        }
      }
    } catch (err) {
      console.error('[Cron] Error processing abandoned proposals:', err);
    }
  });

  // 2. Lead Nurturing (Cold Leads)
  // Runs daily at 10 AM
  cron.schedule('0 10 * * *', async () => {
    console.log('[Cron] Checking for cold leads...');
    try {
      const now = new Date();
      // Leads updated exactly 14 days ago, not WON/LOST
      const fourteenDaysAgoStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      fourteenDaysAgoStart.setHours(0, 0, 0, 0);
      const fourteenDaysAgoEnd = new Date(fourteenDaysAgoStart.getTime() + 24 * 60 * 60 * 1000);

      const coldLeads = await prisma.lead.findMany({
        where: {
          updatedAt: { gte: fourteenDaysAgoStart, lt: fourteenDaysAgoEnd },
          status: { notIn: ['WON', 'LOST'] },
          email: { not: null }
        }
      });

      for (const lead of coldLeads) {
        if (lead.email) {
          await sendEmail(lead.email, {
            subject: `Re-engage with Grekam Visuals`,
            html: `
              <h2 style="color:#fff;font-size:22px;margin:0 0 8px;">Hi ${lead.name},</h2>
              <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin:0 0 24px;">
                It's been a while since we last spoke! Are you still interested in starting a project with us? 
                Reply to this email and let's get the conversation moving.
              </p>
            `
          });
          console.log(`[Cron] Sent 14-day cold lead nurture to ${lead.email}`);
        }
      }
    } catch (err) {
      console.error('[Cron] Error processing cold leads:', err);
    }
  });

  // 3. Subscriptions Upcoming Billing Reminder
  // Runs daily at 9 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('[Cron] Checking for upcoming subscription billing...');
    try {
      const now = new Date();
      // 3 days from now
      const threeDaysFromNowStart = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      threeDaysFromNowStart.setHours(0, 0, 0, 0);
      const threeDaysFromNowEnd = new Date(threeDaysFromNowStart.getTime() + 24 * 60 * 60 * 1000);

      const upcomingBilling = await prisma.subscription.findMany({
        where: {
          status: 'active',
          nextBilling: { gte: threeDaysFromNowStart, lt: threeDaysFromNowEnd }
        },
        include: { company: { include: { contacts: { where: { isPrimary: true } } } } }
      });

      for (const sub of upcomingBilling) {
        const contact = sub.company?.contacts[0];
        if (contact?.email) {
          await sendEmail(contact.email, {
            subject: `Upcoming Billing Reminder: ${sub.planName}`,
            html: `
              <h2 style="color:#fff;font-size:22px;margin:0 0 8px;">Billing Reminder</h2>
              <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin:0 0 24px;">
                Hi ${contact.firstName}, this is a friendly reminder that your subscription for <strong>${sub.planName}</strong> 
                will automatically renew on <strong>${sub.nextBilling.toLocaleDateString()}</strong>.
              </p>
              <p style="color:rgba(255,255,255,0.6);font-size:15px;">
                Expected Charge: ₹${sub.mrr}
              </p>
            `
          });
          console.log(`[Cron] Sent billing reminder to ${contact.email} for subscription ${sub.id}`);
        }
      }
    } catch (err) {
      console.error('[Cron] Error processing subscription reminders:', err);
    }
  });

  // 4. Weekly Summary Report
  // Runs every Monday at 9 AM
  cron.schedule('0 9 * * 1', async () => {
    console.log('[Cron] Generating weekly summary reports...');
    try {
      // Find all admins
      const org = await prisma.organization.findFirst();
      if (org?.supportEmail) {
        // Compile stats (mock data for simplicity, easily replaceable with real aggregations)
        const newLeads = await prisma.lead.count({
          where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }
        });
        
        await sendEmail(org.supportEmail, {
          subject: `Weekly Summary Report for Grekam`,
          html: `
            <h2 style="color:#fff;font-size:22px;margin:0 0 8px;">Weekly Report</h2>
            <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin:0 0 24px;">
              Here's what happened over the last week:
            </p>
            <ul>
              <li style="color:#fff;">New Leads: ${newLeads}</li>
            </ul>
            <p style="color:rgba(255,255,255,0.6);font-size:15px;line-height:1.7;margin-top:24px;">
              Keep up the great work!
            </p>
          `
        });
        console.log(`[Cron] Sent weekly summary to admin ${org.supportEmail}`);
      }
    } catch (err) {
      console.error('[Cron] Error generating weekly reports:', err);
    }
  });
  // 5. 30-Minute Meeting Reminders (Internal & Client)
  // Runs every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const inThirtyMinutes = new Date(now.getTime() + 31 * 60 * 1000); // look ahead up to 31 mins

      // 5a. Internal Meetings
      const upcomingInternal = await prisma.internalMeeting.findMany({
        where: {
          startTime: { gt: now, lte: inThirtyMinutes },
          reminderSent: false,
        },
        include: { attendees: { include: { employee: { include: { user: true } } } } }
      });

      for (const meeting of upcomingInternal) {
        if (meeting.attendees) {
          for (const attendee of meeting.attendees) {
            if (attendee.employee?.user?.email) {
              await sendEmail(attendee.employee.user.email, {
                subject: `Reminder: ${meeting.title} starts in 30 minutes`,
                html: `
                  <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#111;color:#fff;padding:20px;border-radius:10px;">
                    <h2 style="color:#3b82f6;">Meeting Reminder</h2>
                    <p>Your meeting <strong>${meeting.title}</strong> is starting soon.</p>
                    <p><strong>Time:</strong> ${meeting.startTime.toLocaleString()}</p>
                    ${meeting.meetLink ? `<p><a href="${meeting.meetLink}" style="display:inline-block;padding:10px 20px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:5px;">Join Google Meet</a></p>` : ''}
                  </div>
                `
              });
            }
          }
        }
        await prisma.internalMeeting.update({ where: { id: meeting.id }, data: { reminderSent: true } });
      }

      // 5b. Client Meetings
      const upcomingClient = await prisma.clientMeeting.findMany({
        where: {
          startTime: { gt: now, lte: inThirtyMinutes },
          reminderSent: false,
        }
      });

      for (const meeting of upcomingClient) {
        if (meeting.attendeeEmail) {
          await sendEmail(meeting.attendeeEmail, {
            subject: `Reminder: Your meeting starts in 30 minutes`,
            html: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#111;color:#fff;padding:20px;border-radius:10px;">
                <h2 style="color:#3b82f6;">Meeting Reminder</h2>
                <p>Your scheduled meeting <strong>${meeting.summary}</strong> is starting soon.</p>
                <p><strong>Time:</strong> ${meeting.startTime.toLocaleString()}</p>
                ${meeting.meetLink ? `<p><a href="${meeting.meetLink}" style="display:inline-block;padding:10px 20px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:5px;">Join Google Meet</a></p>` : ''}
              </div>
            `
          });
        }
        await prisma.clientMeeting.update({ where: { id: meeting.id }, data: { reminderSent: true } });
      }

    } catch (err) {
      console.error('[Cron] Error processing meeting reminders:', err);
    }
  });
}
