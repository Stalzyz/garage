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
          const portalUrl = process.env.PORTAL_URL || 'https://dashboard.grekam.in';
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
                <a href="https://dashboard.grekam.in" style="display:inline-block;background-color:#4f46e5;color:#ffffff !important;text-decoration:none;padding:13px 26px;border-radius:8px;font-weight:600;font-size:14px;">Visit Grekam OS &rarr;</a>
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

  // 6. Stagnant Task Escalation Engine
  // 6. Stagnant Task Escalation Engine (Runs every 3 hours)
  cron.schedule('0 */3 * * *', async () => {
    await runStagnantTaskEscalation();
  });

  // 7. Lead Response SLA Auto-Reassignment Engine (Runs every 15 minutes between 9 AM and 7 PM)
  cron.schedule('*/15 9-19 * * 1-6', async () => {
    await runLeadSlaReassignment();
  });

  // 8. Autonomous Morning Kickoff Agenda (Runs Mon-Fri at 9:30 AM)
  cron.schedule('30 9 * * 1-5', async () => {
    await runMorningKickoffAgenda();
  });

  // 9. Autonomous 6:30 PM EOD Rollup Digest for Management (Runs Mon-Fri at 6:30 PM)
  cron.schedule('30 18 * * 1-5', async () => {
    await runEodRollupDigest();
  });
}

/**
 * 6. Stagnant Task Escalation Engine
 * Finds tasks in progress or review untouched for >48 hours, auto-escalates priority to CRITICAL if >72h,
 * and notifies assignees and managers without any manual intervention.
 */
export async function runStagnantTaskEscalation() {
  console.log('[Autopilot] Running Stagnant Task Escalation...');
  try {
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 72 * 60 * 60 * 1000);

    const stagnantTasks = await prisma.task.findMany({
      where: {
        status: { in: ['IN_PROGRESS', 'IN_REVIEW'] },
        updatedAt: { lte: twoDaysAgo }
      },
      include: { project: true }
    });

    let escalatedCount = 0;
    for (const task of stagnantTasks) {
      const isCritical = task.updatedAt <= threeDaysAgo;
      
      if (isCritical && task.priority !== 'CRITICAL') {
        await prisma.task.update({
          where: { id: task.id },
          data: { priority: 'CRITICAL' }
        });
        escalatedCount++;
      }

      if (task.assigneeId) {
        await prisma.notification.create({
          data: {
            userId: task.assigneeId,
            type: isCritical ? 'DEADLINE_APPROACHING' : 'WARNING',
            title: isCritical ? `🚨 Task Auto-Escalated: ${task.title}` : `⚠️ Stagnant Task Reminder: ${task.title}`,
            body: isCritical
              ? `Task has had no activity for >72h and was auto-escalated to CRITICAL. Please update progress or flag blockers immediately.`
              : `Task '${task.title}' has had no activity for >48h. Please update status or log an update.`,
            link: task.projectId ? `/dashboard/projects/${task.projectId}` : `/dashboard/projects`
          }
        });
      }
    }
    return { scanned: stagnantTasks.length, escalated: escalatedCount };
  } catch (err: any) {
    console.error('[Autopilot] Error in runStagnantTaskEscalation:', err);
    return { error: err.message };
  }
}

/**
 * 7. Lead Response SLA Auto-Reassignment Engine
 * Automatically revokes and transfers uncontacted leads if the assigned staff member
 * does not dial or message them within 30 minutes of creation during business hours.
 */
export async function runLeadSlaReassignment() {
  console.log('[Autopilot] Running Lead SLA Auto-Reassignment...');
  try {
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const breachedLeads = await prisma.lead.findMany({
      where: {
        createdAt: { gte: todayStart, lte: thirtyMinutesAgo },
        status: 'NEW',
        assignedToId: { not: null },
        activities: { none: {} }
      }
    });

    let reassignedCount = 0;
    if (breachedLeads.length > 0) {
      const activeStaff = await prisma.user.findMany({
        where: {
          role: { in: ['STAFF', 'MANAGER'] },
          status: 'ACTIVE'
        },
        select: { id: true, firstName: true, lastName: true, email: true }
      });

      if (activeStaff.length > 1) {
        for (const lead of breachedLeads) {
          const candidateStaff = activeStaff.filter(s => s.id !== lead.assignedToId);
          if (candidateStaff.length === 0) continue;

          const randomPick = candidateStaff[Math.floor(Math.random() * candidateStaff.length)];
          const oldAssigneeId = lead.assignedToId!;

          await prisma.lead.update({
            where: { id: lead.id },
            data: { assignedToId: randomPick.id }
          });

          await prisma.leadActivity.create({
            data: {
              leadId: lead.id,
              type: 'STATUS_CHANGE',
              content: `[SLA Auto-Reassignment] Lead automatically transferred due to 30-minute first-touch SLA breach.`,
              userId: 'system'
            }
          });

          await prisma.notification.create({
            data: {
              userId: randomPick.id,
              type: 'TASK_ASSIGNED',
              title: `🔥 Hot Lead Auto-Transferred: ${lead.name}`,
              body: `Lead ${lead.name} (${lead.phone}) was transferred to you due to SLA response window. Dial immediately!`,
              link: `/dashboard/crm/dialer`
            }
          });

          await prisma.notification.create({
            data: {
              userId: oldAssigneeId,
              type: 'WARNING',
              title: `⚠️ Lead Reassigned: ${lead.name}`,
              body: `Lead ${lead.name} was auto-reassigned to ${randomPick.firstName || 'another staff'} due to 30-minute inactivity.`,
              link: `/dashboard/crm`
            }
          });

          reassignedCount++;
        }
      }
    }
    return { breached: breachedLeads.length, reassigned: reassignedCount };
  } catch (err: any) {
    console.error('[Autopilot] Error in runLeadSlaReassignment:', err);
    return { error: err.message };
  }
}

/**
 * 8. Autonomous Morning Kickoff Agenda
 * Assembles and sends the top 3 highest priority tasks directly to staff notifications and portal.
 */
export async function runMorningKickoffAgenda() {
  console.log('[Autopilot] Running Morning Kickoff Agenda...');
  try {
    const activeStaff = await prisma.user.findMany({
      where: {
        role: { in: ['STAFF', 'MANAGER', 'INTERN'] },
        status: 'ACTIVE'
      },
      select: { id: true, firstName: true, email: true }
    });

    let notifiedCount = 0;
    for (const staff of activeStaff) {
      const topTasks = await prisma.task.findMany({
        where: {
          assigneeId: staff.id,
          status: { in: ['TODO', 'IN_PROGRESS'] }
        },
        orderBy: [
          { priority: 'desc' },
          { dueDate: 'asc' }
        ],
        take: 3,
        select: { title: true, priority: true }
      });

      if (topTasks.length > 0) {
        const taskListStr = topTasks.map((t, idx) => `${idx + 1}. ${t.title}`).join(' | ');
        await prisma.notification.create({
          data: {
            userId: staff.id,
            type: 'TASK_ASSIGNED',
            title: `🎯 Morning Kickoff: Your Top Priorities Today`,
            body: `Good morning ${staff.firstName || 'there'}! Top deliverables for today: ${taskListStr}. Clock in and focus on these first!`,
            link: `/dashboard/projects`
          }
        });
        notifiedCount++;
      }
    }
    return { staffNotified: notifiedCount };
  } catch (err: any) {
    console.error('[Autopilot] Error in runMorningKickoffAgenda:', err);
    return { error: err.message };
  }
}

/**
 * 9. Autonomous 6:30 PM EOD Rollup Digest for Management
 * Automatically compiles tasks, calls, leads, and revenue into an executive summary.
 */
export async function runEodRollupDigest() {
  console.log('[Autopilot] Running EOD Rollup Digest...');
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [tasksDone, callsCount, newLeadsCount, paidInvoices] = await Promise.all([
      prisma.task.count({ where: { status: 'DONE', completedAt: { gte: todayStart } } }),
      prisma.leadActivity.count({ where: { type: 'CALL', createdAt: { gte: todayStart } } }),
      prisma.lead.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.invoice.findMany({
        where: { status: 'PAID', updatedAt: { gte: todayStart } },
        select: { totalAmount: true }
      })
    ]);

    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + (inv.totalAmount || 0), 0);

    const managers = await prisma.user.findMany({
      where: {
        role: { in: ['SUPER_ADMIN', 'MANAGER'] },
        status: 'ACTIVE'
      },
      select: { id: true, email: true }
    });

    const summaryText = `Daily Rollup: ${tasksDone} tasks completed | ${callsCount} calls logged | ${newLeadsCount} new leads | ₹${totalRevenue.toLocaleString('en-IN')} revenue collected today.`;

    for (const mgr of managers) {
      await prisma.notification.create({
        data: {
          userId: mgr.id,
          type: 'INFO',
          title: `📊 EOD Company Rollup (${new Date().toLocaleDateString()})`,
          body: summaryText,
          link: `/dashboard/analytics`
        }
      });
    }

    return { tasksDone, callsCount, newLeadsCount, revenue: totalRevenue, managersNotified: managers.length };
  } catch (err: any) {
    console.error('[Autopilot] Error in runEodRollupDigest:', err);
    return { error: err.message };
  }
}
