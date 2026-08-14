import { FastifyInstance } from 'fastify';
import { google } from 'googleapis';
import { z } from 'zod';

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
