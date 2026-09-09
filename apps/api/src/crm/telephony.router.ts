import { FastifyInstance } from 'fastify';

interface DialMobileBody {
  leadPhone: string;
  email: string;
}

function extractDurationSeconds(content: string): number {
  if (!content) return 0;
  
  // 1. Explicit [Call Duration: 120s] or [Call Duration: 2m 15s]
  const matchMinSec = content.match(/\[(?:Call\s*)?Duration:\s*(\d+)m\s*(\d+)s\]/i);
  if (matchMinSec) return parseInt(matchMinSec[1], 10) * 60 + parseInt(matchMinSec[2], 10);

  const matchSec = content.match(/\[(?:Call\s*)?Duration:\s*(\d+)s?\]/i) || content.match(/\b(\d+)\s*sec(?:onds)?\b/i);
  if (matchSec) return parseInt(matchSec[1], 10);

  const matchMin = content.match(/\[(?:Call\s*)?Duration:\s*(\d+)m\]/i) || content.match(/\b(\d+)\s*min(?:utes)?\b/i);
  if (matchMin) return parseInt(matchMin[1], 10) * 60;

  // 2. Fallback estimate based on call disposition if not explicitly provided
  const upper = content.toUpperCase();
  if (upper.includes('MEETING BOOKED') || upper.includes('WON')) return 240; // ~4 minutes
  if (upper.includes('CALL BACK') || upper.includes('CONTACTED')) return 120; // ~2 minutes
  if (upper.includes('NOT INTERESTED') || upper.includes('LOST')) return 60; // ~1 minute
  if (upper.includes('VOICEMAIL')) return 25; // ~25 seconds
  return 90; // ~1.5 minutes default
}

function formatTalkTime(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return '0m 0s';
  const hours = Math.floor(totalSeconds / 3600);
  const mins = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m ${secs}s`;
}

export default async function telephonyRouter(app: FastifyInstance) {
  const handleDialMobile = async (req: any, reply: any) => {
    const { leadPhone, email } = req.body || {};

    if (!leadPhone || !email) {
      return reply.status(400).send({ error: 'leadPhone and email are required' });
    }

    // Broadcast trigger via WebSockets
    (app as any).broadcast('MOBILE_DIAL_TRIGGER', { email, leadPhone });

    return { success: true };
  };

  app.post('/dial-mobile', handleDialMobile);
  app.post('/telephony/dial-mobile', handleDialMobile);

  // GET /api/v1/crm/telephony/daily-report (or /calls/daily-report)
  const getDailyCallReport = async (req: any) => {
    const { date, userId } = req.query as { date?: string; userId?: string };

    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Query LeadActivity where type = 'CALL'
    const callActivities = await app.prisma.leadActivity.findMany({
      where: {
        type: 'CALL',
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        ...(userId && userId !== 'ALL' ? { userId } : {}),
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
            company: true,
            status: true,
            businessUnit: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch user details for telecallers
    const userIds = Array.from(new Set(callActivities.map(a => a.userId).filter(Boolean)));
    const users = await app.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true, email: true },
    });

    const userMap = new Map(users.map(u => [u.id, u]));

    // Aggregate statistics by Telecaller (userId)
    const telecallerStatsMap = new Map<string, {
      userId: string;
      userName: string;
      email: string;
      totalCalls: number;
      totalDurationSeconds: number;
      meetingsBooked: number;
      callbacks: number;
      notInterested: number;
      voicemails: number;
      uniqueLeads: Set<string>;
      hourlyDistribution: Record<number, number>;
    }>();

    for (const act of callActivities) {
      const uId = act.userId || 'system';
      const uInfo = userMap.get(uId);
      const userName = uInfo
        ? `${uInfo.firstName || ''} ${uInfo.lastName || ''}`.trim() || uInfo.email
        : (uId === 'system' ? 'System Dialer' : uId);
      const email = uInfo?.email || '';

      if (!telecallerStatsMap.has(uId)) {
        telecallerStatsMap.set(uId, {
          userId: uId,
          userName,
          email,
          totalCalls: 0,
          totalDurationSeconds: 0,
          meetingsBooked: 0,
          callbacks: 0,
          notInterested: 0,
          voicemails: 0,
          uniqueLeads: new Set<string>(),
          hourlyDistribution: {},
        });
      }

      const stat = telecallerStatsMap.get(uId)!;
      stat.totalCalls += 1;
      
      const durationSec = extractDurationSeconds(act.content || '');
      stat.totalDurationSeconds += durationSec;

      if (act.leadId) stat.uniqueLeads.add(act.leadId);

      const contentUpper = (act.content || '').toUpperCase();
      if (contentUpper.includes('MEETING BOOKED') || contentUpper.includes('WON')) {
        stat.meetingsBooked += 1;
      } else if (contentUpper.includes('CALL BACK') || contentUpper.includes('CONTACTED')) {
        stat.callbacks += 1;
      } else if (contentUpper.includes('NOT INTERESTED') || contentUpper.includes('LOST')) {
        stat.notInterested += 1;
      } else if (contentUpper.includes('VOICEMAIL')) {
        stat.voicemails += 1;
      }

      const hour = new Date(act.createdAt).getHours();
      stat.hourlyDistribution[hour] = (stat.hourlyDistribution[hour] || 0) + 1;
    }

    const telecallersSummary = Array.from(telecallerStatsMap.values()).map(st => {
      const avgSec = st.totalCalls > 0 ? Math.round(st.totalDurationSeconds / st.totalCalls) : 0;
      return {
        userId: st.userId,
        userName: st.userName,
        email: st.email,
        totalCalls: st.totalCalls,
        totalDurationSeconds: st.totalDurationSeconds,
        formattedTalkTime: formatTalkTime(st.totalDurationSeconds),
        avgCallDurationSeconds: avgSec,
        formattedAvgCallDuration: formatTalkTime(avgSec),
        uniqueLeadsCount: st.uniqueLeads.size,
        meetingsBooked: st.meetingsBooked,
        callbacks: st.callbacks,
        notInterested: st.notInterested,
        voicemails: st.voicemails,
        hourlyDistribution: st.hourlyDistribution,
      };
    });

    const grandTotalDurationSeconds = telecallersSummary.reduce((acc, curr) => acc + curr.totalDurationSeconds, 0);

    const detailedLogs = callActivities.map(a => {
      const u = userMap.get(a.userId);
      const durSec = extractDurationSeconds(a.content || '');
      const recMatch = a.content ? a.content.match(/\[(?:Recording|Audio):\s*([^\s\]]+)\]/i) : null;
      const recordingUrl = recMatch ? recMatch[1] : null;

      return {
        id: a.id,
        userId: a.userId,
        telecallerName: u
          ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email
          : (a.userId === 'system' ? 'System' : a.userId),
        telecallerEmail: u?.email || '',
        leadName: a.lead?.name || 'Unknown Lead',
        leadPhone: a.lead?.phone || 'N/A',
        leadCompany: a.lead?.company || 'N/A',
        content: a.content,
        durationSeconds: durSec,
        formattedDuration: formatTalkTime(durSec),
        recordingUrl,
        timestamp: a.createdAt,
      };
    });

    return {
      date: startOfDay.toISOString().split('T')[0],
      totalCallsToday: callActivities.length,
      totalTalkTimeSeconds: grandTotalDurationSeconds,
      formattedTotalTalkTime: formatTalkTime(grandTotalDurationSeconds),
      telecallersCount: telecallersSummary.length,
      summary: telecallersSummary,
      detailedLogs,
    };
  };

  app.get('/daily-report', getDailyCallReport);
  app.get('/calls/daily-report', getDailyCallReport);
  app.get('/telephony/daily-report', getDailyCallReport);
  app.get('/telephony/calls/daily-report', getDailyCallReport);

  // POST /api/v1/crm/telephony/recordings — log call with audio recording URL
  const handleRecordings = async (req: any, reply: any) => {
    const body = req.body as {
      leadId: string;
      userId?: string;
      recordingUrl?: string;
      durationSeconds?: number;
      disposition?: string;
      notes?: string;
    };

    if (!body.leadId) {
      return reply.status(400).send({ error: 'leadId is required' });
    }

    const durationSec = body.durationSeconds || 0;
    const durStr = formatTalkTime(durationSec);
    const audioTag = body.recordingUrl ? ` [Recording: ${body.recordingUrl}]` : '';
    const dispositionTag = body.disposition ? ` [Disposition: ${body.disposition}]` : '';
    const notesStr = body.notes ? ` Notes: ${body.notes}` : '';

    const content = `[Call Duration: ${durStr}]${dispositionTag}${audioTag}${notesStr}`.trim();

    const activity = await app.prisma.leadActivity.create({
      data: {
        leadId: body.leadId,
        type: 'CALL',
        content,
        userId: body.userId || (req as any).user?.id || 'system',
      },
    });

    return { success: true, activity };
  };

  app.post('/recordings', handleRecordings);
  app.post('/telephony/recordings', handleRecordings);
}
