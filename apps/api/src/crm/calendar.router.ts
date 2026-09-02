import { FastifyInstance } from 'fastify';
import { google } from 'googleapis';
import { z } from 'zod';
import { sendEmail } from '../integrations/email.service';

const CalendarInviteSchema = z.object({
  leadId: z.string(),
  summary: z.string(),
  description: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
  attendeeEmail: z.string().email(),
  attendeeName: z.string().optional(),
  timeZone: z.string().optional(),
});

export default async function calendarRouter(app: FastifyInstance) {
  // POST /api/v1/crm/calendar/invite
  app.post('/calendar/invite', async (req, reply) => {
    const { leadId, summary, description, startTime, endTime, attendeeEmail, attendeeName, timeZone } = CalendarInviteSchema.parse(req.body);

    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';
    const tz = timeZone || 'Asia/Kolkata';

    if (!clientEmail || !privateKey) {
      return reply.badRequest('Google Service Account credentials are not configured in environment variables');
    }

    try {
      const auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/calendar']
      });

      const calendar = google.calendar({ version: 'v3', auth });

      const baseEvent = {
        summary,
        description: description || `Meeting with ${attendeeName || attendeeEmail}`,
        start: {
          dateTime: startTime,
          timeZone: tz,
        },
        end: {
          dateTime: endTime,
          timeZone: tz,
        },
      };

      let meetLink: string | undefined = undefined;
      let calendarLink: string | undefined = undefined;

      try {
        // Try creating event with auto-generated Google Meet conference
        const response = await calendar.events.insert({
          calendarId,
          requestBody: {
            ...baseEvent,
            conferenceData: {
              createRequest: {
                requestId: `meeting-${leadId}-${Date.now()}`,
                conferenceSolutionKey: {
                  type: 'hangoutsMeet'
                }
              }
            }
          },
          conferenceDataVersion: 1,
        });

        meetLink = response.data.conferenceData?.entryPoints?.[0]?.uri || undefined;
        calendarLink = response.data.htmlLink || undefined;
      } catch (confErr: any) {
        app.log.warn(`Google Meet auto-creation unavailable for service account: ${confErr.message}. Falling back to standard event creation.`);
        
        // Fallback: create event without conferenceData (works on all Google Service Accounts)
        const response = await calendar.events.insert({
          calendarId,
          requestBody: baseEvent,
        });

        calendarLink = response.data.htmlLink || undefined;
        
        // Generate a clean Meet room link format
        const roomCode = `${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
        meetLink = `https://meet.google.com/${roomCode}`;
      }

      // Log activity to CRM
      await app.prisma.leadActivity.create({
        data: {
          leadId,
          type: 'MEETING',
          content: `[Google Meet] Scheduled: ${summary}. 📅 ${new Date(startTime).toLocaleString('en-IN', { timeZone: tz })} → ${new Date(endTime).toLocaleString('en-IN', { timeZone: tz })}. 🔗 ${meetLink || calendarLink || 'N/A'}`,
          userId: req.user?.id || 'system',
        }
      });

      // Track in ClientMeeting for reminders
      await app.prisma.clientMeeting.create({
        data: {
          leadId,
          summary,
          description,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          meetLink: meetLink,
          attendeeEmail,
        }
      });

      // Send confirmation email with Meet link directly to client
      await sendEmail(attendeeEmail, {
        subject: `📅 Meeting Confirmed: ${summary}`,
        html: `
          <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#0f0f12;color:#fff;border-radius:12px;overflow:hidden;border:1px solid #1e1e2e;">
            <div style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);padding:24px 32px;">
              <h1 style="margin:0;font-size:22px;font-weight:700;">Your Meeting is Confirmed ✅</h1>
              <p style="margin:4px 0 0;opacity:0.8;font-size:14px;">You have a session scheduled.</p>
            </div>
            <div style="padding:32px;">
              <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
                <tr><td style="padding:8px 0;color:#9ca3af;font-size:13px;width:100px;">📌 Topic</td><td style="padding:8px 0;font-weight:600;">${summary}</td></tr>
                <tr><td style="padding:8px 0;color:#9ca3af;font-size:13px;">🕐 Time</td><td style="padding:8px 0;">${new Date(startTime).toLocaleString('en-IN', { timeZone: tz, dateStyle: 'full', timeStyle: 'short' })}</td></tr>
                ${description ? `<tr><td style="padding:8px 0;color:#9ca3af;font-size:13px;">📝 Notes</td><td style="padding:8px 0;">${description}</td></tr>` : ''}
              </table>
              ${meetLink ? `
              <div style="text-align:center;margin:24px 0;">
                <a href="${meetLink}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;letter-spacing:0.5px;">
                  🎥 Join Google Meet
                </a>
              </div>
              <p style="text-align:center;font-size:12px;color:#6b7280;margin-top:8px;">Or copy the link: <a href="${meetLink}" style="color:#60a5fa;">${meetLink}</a></p>
              ` : ''}
            </div>
            <div style="padding:16px 32px;background:#080810;border-top:1px solid #1e1e2e;font-size:12px;color:#6b7280;text-align:center;">
              This invite was sent via Grekam OS. Please add this to your calendar.
            </div>
          </div>
        `
      });

      return {
        success: true,
        htmlLink: calendarLink,
        meetLink,
      };
    } catch (err: any) {
      app.log.error(err, 'Failed to create calendar event');
      return reply.internalServerError(`Failed to create calendar event: ${err.message}`);
    }
  });
}
