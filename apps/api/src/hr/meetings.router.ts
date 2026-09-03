import { FastifyInstance } from 'fastify';
import { google } from 'googleapis';
import { z } from 'zod';
import { sendEmail } from '../integrations/email.service';

const CreateMeetingSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
  attendeeIds: z.array(z.string()),
});

export default async function meetingsRouter(app: FastifyInstance) {
  // GET /api/v1/hr/meetings
  app.get('/meetings', async (req, reply) => {
    try {
      const meetings = await app.prisma.internalMeeting.findMany({
        where: {
          OR: [
            { hostId: req.user?.id },
            {
              attendees: {
                some: {
                  employee: {
                    userId: req.user?.id
                  }
                }
              }
            }
          ]
        },
        include: {
          host: {
            select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true }
          },
          attendees: {
            include: {
              employee: {
                include: {
                  user: {
                    select: { id: true, firstName: true, lastName: true, email: true, avatarUrl: true }
                  }
                }
              }
            }
          }
        },
        orderBy: {
          startTime: 'asc'
        }
      });
      return { success: true, data: meetings };
    } catch (err: any) {
      app.log.error(err, 'Failed to fetch internal meetings');
      return reply.internalServerError('Failed to fetch internal meetings');
    }
  });

  // POST /api/v1/hr/meetings
  app.post('/meetings', async (req, reply) => {
    const { title, description, startTime, endTime, attendeeIds } = CreateMeetingSchema.parse(req.body);
    const hostId = req.user?.id;

    if (!hostId) {
      return reply.unauthorized('User not authenticated');
    }

    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

    let meetLink = '';
    
    // Try scheduling via Google Calendar API if credentials exist
    if (clientEmail && privateKey) {
      try {
        const auth = new google.auth.JWT({
          email: clientEmail,
          key: privateKey,
          scopes: ['https://www.googleapis.com/auth/calendar']
        });

        const calendar = google.calendar({ version: 'v3', auth });

        // Fetch attendee emails
        const attendeesData = await app.prisma.employee.findMany({
          where: { id: { in: attendeeIds } },
          include: { user: { select: { email: true } } }
        });

        const emails = attendeesData.map(a => ({ email: a.user.email }));

        const baseEvent = {
          summary: title,
          description: description || `Internal Meeting: ${title}`,
          start: { dateTime: startTime, timeZone: 'UTC' },
          end: { dateTime: endTime, timeZone: 'UTC' },
        };

        try {
          const response = await calendar.events.insert({
            calendarId,
            requestBody: {
              ...baseEvent,
              conferenceData: {
                createRequest: {
                  requestId: `internal-meet-${Date.now()}`,
                  conferenceSolutionKey: { type: 'hangoutsMeet' }
                }
              }
            },
            conferenceDataVersion: 1,
          });
          meetLink = response.data.conferenceData?.entryPoints?.[0]?.uri || '';
        } catch (confErr: any) {
          app.log.warn(`Google Meet auto-creation failed: ${confErr.message}, creating standard calendar event.`);
          await calendar.events.insert({
            calendarId,
            requestBody: baseEvent,
          });
          const roomCode = `Grekam-Meeting-${Math.random().toString(36).substring(2, 8)}`;
          meetLink = `https://meet.jit.si/${roomCode}`;
        }
      } catch (calendarError: any) {
        app.log.error(calendarError, 'Failed to create google calendar event for internal meeting');
        // Continue creating the meeting in the database even if GMeet fails
      }
    }

    try {
      const meeting = await app.prisma.internalMeeting.create({
        data: {
          title,
          description,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          meetLink,
          hostId,
          attendees: {
            create: attendeeIds.map(id => ({ employeeId: id }))
          }
        },
        include: {
          attendees: {
            include: { employee: { include: { user: true } } }
          }
        }
      });

      // Send email notifications to attendees
      if (meeting.attendees && meeting.attendees.length > 0) {
        for (const attendee of meeting.attendees) {
          if (attendee.employee?.user?.email) {
            await sendEmail(attendee.employee.user.email, {
              subject: `Meeting Scheduled: ${title}`,
              html: `
                <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#111;color:#fff;padding:20px;border-radius:10px;">
                  <h2 style="color:#3b82f6;">Meeting Scheduled</h2>
                  <p>You have been invited to an internal meeting: <strong>${title}</strong></p>
                  <p><strong>Time:</strong> ${new Date(startTime).toLocaleString()}</p>
                  <p><strong>Description:</strong> ${description || 'No description provided.'}</p>
                  ${meetLink ? `<p><a href="${meetLink}" style="display:inline-block;padding:10px 20px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:5px;">Join Google Meet</a></p>` : ''}
                </div>
              `
            });
          }
        }
      }

      return { success: true, data: meeting };
    } catch (dbError: any) {
      app.log.error(dbError, 'Failed to save meeting to DB');
      return reply.internalServerError('Failed to save meeting to database');
    }
  });

  // DELETE /api/v1/hr/meetings/:id
  app.delete('/meetings/:id', async (req: any, reply) => {
    const { id } = req.params;
    try {
      await app.prisma.internalMeeting.delete({
        where: { id }
      });
      return { success: true };
    } catch (error) {
      app.log.error(error);
      return reply.internalServerError('Failed to delete meeting');
    }
  });

  // POST /api/v1/hr/meetings/send-reminders (Send 10-minute before meeting alerts)
  app.post('/meetings/send-reminders', async (req, reply) => {
    try {
      const now = new Date();
      const fifteenMinsLater = new Date(now.getTime() + 15 * 60 * 1000);

      const upcomingMeetings = await app.prisma.internalMeeting.findMany({
        where: {
          startTime: { gte: now, lte: fifteenMinsLater }
        },
        include: {
          attendees: { include: { employee: { include: { user: true } } } }
        }
      });

      let sentCount = 0;
      for (const m of upcomingMeetings) {
        for (const att of m.attendees) {
          const email = att.employee?.user?.email;
          if (email) {
            await sendEmail(email, {
              subject: `⏰ Reminder: Meeting Starting Soon — ${m.title}`,
              html: `
                <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#111;color:#fff;padding:24px;border-radius:12px;border:1px solid #333;">
                  <h2 style="color:#f59e0b;margin-top:0;">⏰ Meeting Starting Soon</h2>
                  <p>Your meeting <strong>${m.title}</strong> starts in approximately 10 minutes.</p>
                  <p><strong>Time:</strong> ${new Date(m.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  ${m.meetLink ? `<p style="margin-top:20px;"><a href="${m.meetLink}" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Join Google Meet Now</a></p>` : ''}
                </div>
              `
            });
            sentCount++;
          }
        }
      }

      return { success: true, sentCount, meetingsChecked: upcomingMeetings.length };
    } catch (err: any) {
      app.log.error(err, 'Failed to send meeting reminders');
      return reply.internalServerError('Failed to send meeting reminders');
    }
  });
}
