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
          const portalUrl = process.env.PORTAL_URL || 'https://agency.grekam.in';
          const link = `${portalUrl}/proposal/${proposal.publicToken}`;
          
          await sendEmail(email, {
            subject: `Still thinking about ${proposal.title}?`,
            html: `
              <h2 style="color:#0f172a;font-size:22px;font-weight:700;margin:0 0 10px;">Just checking in!</h2>
              <p style="color:#334155;font-size:15px;line-height:1.65;margin:0 0 20px;">
                Hi ${name}, we noticed you haven't reviewed the proposal for <strong style="color:#0f172a;">${proposal.title}</strong> yet. 
                If you have any questions or need scope adjustments, our creative team is ready to help!
              </p>
              <div style="margin:24px 0;">
                <a href="${link}" style="display:inline-block;background-color:#4f46e5;color:#ffffff !important;text-decoration:none;padding:13px 26px;border-radius:8px;font-weight:600;font-size:14px;">Review Proposal &rarr;</a>
              </div>
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
              <h2 style="color:#0f172a;font-size:22px;font-weight:700;margin:0 0 10px;">Hi ${lead.name},</h2>
              <p style="color:#334155;font-size:15px;line-height:1.65;margin:0 0 20px;">
                It's been a while since we last spoke! Are you still interested in starting a project or exploring visual production with us?
              </p>
              <p style="color:#334155;font-size:15px;line-height:1.65;margin:0 0 24px;">
                Simply reply directly to this email and let's get the conversation moving. We'd love to partner with you!
              </p>
              <div style="margin:24px 0;">
                <a href="https://agency.grekam.in" style="display:inline-block;background-color:#4f46e5;color:#ffffff !important;text-decoration:none;padding:13px 26px;border-radius:8px;font-weight:600;font-size:14px;">Visit Grekam OS &rarr;</a>
              </div>
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
              <h2 style="color:#0f172a;font-size:22px;font-weight:700;margin:0 0 10px;">Billing Reminder</h2>
              <p style="color:#334155;font-size:15px;line-height:1.65;margin:0 0 20px;">
                Hi ${contact.firstName}, this is a friendly reminder that your subscription for <strong style="color:#0f172a;">${sub.planName}</strong> 
                will automatically renew on <strong style="color:#0f172a;">${sub.nextBilling.toLocaleDateString()}</strong>.
              </p>
              <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px;margin-bottom:24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="color:#334155;font-size:14px;">
                  <tr>
                    <td style="color:#64748b;">Plan:</td>
                    <td align="right" style="color:#0f172a;font-weight:700;">${sub.planName}</td>
                  </tr>
                  <tr>
                    <td style="color:#64748b;padding-top:8px;">Expected Charge:</td>
                    <td align="right" style="color:#0f172a;font-weight:800;padding-top:8px;">₹${sub.mrr}</td>
                  </tr>
                </table>
              </div>
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
            <h2 style="color:#0f172a;font-size:22px;font-weight:700;margin:0 0 10px;">Weekly Report</h2>
            <p style="color:#334155;font-size:15px;line-height:1.65;margin:0 0 20px;">
              Here's your activity overview over the past 7 days:
            </p>
            <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px;margin-bottom:24px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="color:#334155;font-size:14px;">
                <tr>
                  <td style="color:#64748b;">New Leads Inquired:</td>
                  <td align="right" style="color:#4f46e5;font-weight:700;font-size:18px;">${newLeads}</td>
                </tr>
              </table>
            </div>
            <p style="color:#334155;font-size:14px;line-height:1.65;margin-top:20px;">
              Keep up the great momentum!
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
                  <h2 style="color:#0f172a;font-size:20px;font-weight:700;margin:0 0 10px;">Meeting Reminder</h2>
                  <p style="color:#334155;font-size:15px;line-height:1.65;margin:0 0 16px;">Your scheduled staff meeting <strong style="color:#0f172a;">${meeting.title}</strong> is starting in 30 minutes.</p>
                  <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px;margin-bottom:24px;">
                    <p style="color:#334155;font-size:14px;margin:0 0 8px;"><strong>Scheduled Time:</strong> ${meeting.startTime.toLocaleString()}</p>
                    ${meeting.meetLink ? `<div style="margin-top:14px;"><a href="${meeting.meetLink}" style="display:inline-block;padding:11px 22px;background-color:#4f46e5;color:#ffffff !important;text-decoration:none;border-radius:8px;font-weight:600;font-size:13px;">Join Video Meeting &rarr;</a></div>` : ''}
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
              <h2 style="color:#0f172a;font-size:20px;font-weight:700;margin:0 0 10px;">Meeting Reminder</h2>
              <p style="color:#334155;font-size:15px;line-height:1.65;margin:0 0 16px;">Your consultation with Grekam <strong style="color:#0f172a;">${meeting.summary}</strong> is starting soon.</p>
              <div style="background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px;margin-bottom:24px;">
                <p style="color:#334155;font-size:14px;margin:0 0 8px;"><strong>Scheduled Time:</strong> ${meeting.startTime.toLocaleString()}</p>
                ${meeting.meetLink ? `<div style="margin-top:14px;"><a href="${meeting.meetLink}" style="display:inline-block;padding:11px 22px;background-color:#4f46e5;color:#ffffff !important;text-decoration:none;border-radius:8px;font-weight:600;font-size:13px;">Join Video Meeting &rarr;</a></div>` : ''}
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
