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
});

export default async function calendarRouter(app: FastifyInstance) {
  // POST /api/v1/crm/calendar/invite
  app.post('/calendar/invite', async (req, reply) => {
    const { leadId, summary, description, startTime, endTime, attendeeEmail } = CalendarInviteSchema.parse(req.body);

    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const calendarId = process.env.GOOGLE_CALENDAR_ID || 'primary';

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

      const event = {
        summary,
        description: description || `Meeting with ${attendeeEmail}`,
        start: {
          dateTime: startTime,
          timeZone: 'UTC',
        },
        end: {
          dateTime: endTime,
          timeZone: 'UTC',
        },
        attendees: [
          { email: attendeeEmail }
        ],
        conferenceData: {
          createRequest: {
            requestId: `meeting-${leadId}-${Date.now()}`,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        }
      };

      const response = await calendar.events.insert({
        calendarId,
        requestBody: event,
        conferenceDataVersion: 1,
      });

      // Log activity to CRM
      await app.prisma.leadActivity.create({
        data: {
          leadId,
          type: 'MEETING',
          content: `[Google Calendar] Meeting scheduled: ${summary}. Link: ${response.data.htmlLink || 'N/A'}. Meet Link: ${response.data.conferenceData?.entryPoints?.[0]?.uri || 'N/A'}`,
          userId: req.user?.id || 'system',
        }
      });

      // Track in ClientMeeting for reminders
      const meetLinkUri = response.data.conferenceData?.entryPoints?.[0]?.uri;
      
      await app.prisma.clientMeeting.create({
        data: {
          leadId,
          summary,
          description,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          meetLink: meetLinkUri,
          attendeeEmail,
        }
      });

      // Send confirmation email
      await sendEmail(attendeeEmail, {
        subject: `Meeting Confirmed: ${summary}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#111;color:#fff;padding:20px;border-radius:10px;">
            <h2 style="color:#3b82f6;">Your meeting is confirmed!</h2>
            <p><strong>Topic:</strong> ${summary}</p>
            <p><strong>Time:</strong> ${new Date(startTime).toLocaleString()}</p>
            ${description ? `<p><strong>Details:</strong> ${description}</p>` : ''}
            ${meetLinkUri ? `<p><a href="${meetLinkUri}" style="display:inline-block;padding:10px 20px;background:#3b82f6;color:#fff;text-decoration:none;border-radius:5px;">Join Google Meet</a></p>` : ''}
          </div>
        `
      });

      return {
        success: true,
        htmlLink: response.data.htmlLink,
        meetLink: response.data.conferenceData?.entryPoints?.[0]?.uri,
      };
    } catch (err: any) {
      app.log.error(err, 'Failed to create calendar event');
      return reply.internalServerError(`Failed to create calendar event: ${err.message}`);
    }
  });
}
