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
    const { date, startDate, endDate, userId, all } = req.query as {
      date?: string;
      startDate?: string;
      endDate?: string;
      userId?: string;
      all?: string;
    };

    let startOfDay: Date;
    let endOfDay: Date;

    if (all === 'true' || date === 'ALL') {
      startOfDay = new Date(0);
      endOfDay = new Date(Date.now() + 86400000);
    } else if (startDate && endDate) {
      startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);
      endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
    } else {
      const targetDate = date ? new Date(date) : new Date();
      startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
    }

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

    // Query CommunicationLog where type = 'CALL' (Calls made to Contacts)
    const contactCommLogs = await app.prisma.communicationLog.findMany({
      where: {
        type: 'CALL',
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        ...(userId && userId !== 'ALL' ? { userId } : {}),
      },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch user details for telecallers across both lead activities and contact comm logs
    const allUserIds = Array.from(
      new Set([
        ...callActivities.map(a => a.userId),
        ...contactCommLogs.map(c => c.userId),
      ].filter(Boolean))
    );

    const users = await app.prisma.user.findMany({
      where: { id: { in: allUserIds } },
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
      uniqueProspects: Set<string>;
      hourlyDistribution: Record<number, number>;
    }>();

    const processLogForStats = (uId: string, content: string, prospectKey: string, createdAt: Date) => {
      const resolvedUId = uId || 'system';
      const uInfo = userMap.get(resolvedUId);
      const userName = uInfo
        ? `${uInfo.firstName || ''} ${uInfo.lastName || ''}`.trim() || uInfo.email
        : (resolvedUId === 'system' ? 'System Dialer' : resolvedUId);
      const email = uInfo?.email || '';

      if (!telecallerStatsMap.has(resolvedUId)) {
        telecallerStatsMap.set(resolvedUId, {
          userId: resolvedUId,
          userName,
          email,
          totalCalls: 0,
          totalDurationSeconds: 0,
          meetingsBooked: 0,
          callbacks: 0,
          notInterested: 0,
          voicemails: 0,
          uniqueProspects: new Set<string>(),
          hourlyDistribution: {},
        });
      }

      const stat = telecallerStatsMap.get(resolvedUId)!;
      stat.totalCalls += 1;

      const durationSec = extractDurationSeconds(content || '');
      stat.totalDurationSeconds += durationSec;

      if (prospectKey) stat.uniqueProspects.add(prospectKey);

      const contentUpper = (content || '').toUpperCase();
      if (contentUpper.includes('MEETING BOOKED') || contentUpper.includes('WON')) {
        stat.meetingsBooked += 1;
      } else if (contentUpper.includes('CALL BACK') || contentUpper.includes('CONTACTED')) {
        stat.callbacks += 1;
      } else if (contentUpper.includes('NOT INTERESTED') || contentUpper.includes('LOST')) {
        stat.notInterested += 1;
      } else if (contentUpper.includes('VOICEMAIL')) {
        stat.voicemails += 1;
      }

      const hour = new Date(createdAt).getHours();
      stat.hourlyDistribution[hour] = (stat.hourlyDistribution[hour] || 0) + 1;
    };

    for (const act of callActivities) {
      processLogForStats(act.userId, act.content || '', act.leadId || '', act.createdAt);
    }

    for (const comm of contactCommLogs) {
      processLogForStats(comm.userId, comm.summary || '', comm.contactId || '', comm.createdAt);
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
        uniqueLeadsCount: st.uniqueProspects.size,
        meetingsBooked: st.meetingsBooked,
        callbacks: st.callbacks,
        notInterested: st.notInterested,
        voicemails: st.voicemails,
        hourlyDistribution: st.hourlyDistribution,
      };
    });

    const grandTotalDurationSeconds = telecallersSummary.reduce((acc, curr) => acc + curr.totalDurationSeconds, 0);

    const leadLogs = callActivities.map(a => {
      const u = userMap.get(a.userId);
      const durSec = extractDurationSeconds(a.content || '');
      const recMatch = a.content ? a.content.match(/\[(?:Recording|Audio):\s*([^\]]+?)\s*\]/i) : null;
      const recordingUrl = recMatch ? recMatch[1].trim() : null;

      // Extract disposition
      const dispMatch = a.content ? a.content.match(/\[Disposition:\s*([^\]]+?)\s*\]/i) : null;
      const disposition = dispMatch ? dispMatch[1].trim() : null;

      return {
        id: a.id,
        recordType: 'LEAD' as const,
        recordId: a.leadId,
        userId: a.userId,
        telecallerName: u
          ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email
          : (a.userId === 'system' ? 'System' : a.userId),
        telecallerEmail: u?.email || '',
        leadName: a.lead?.name || 'Unknown Lead',
        leadPhone: a.lead?.phone || 'N/A',
        leadCompany: a.lead?.company || 'N/A',
        content: a.content,
        disposition,
        durationSeconds: durSec,
        formattedDuration: formatTalkTime(durSec),
        recordingUrl,
        timestamp: a.createdAt,
      };
    });

    const contactLogs = contactCommLogs.map(c => {
      const u = userMap.get(c.userId);
      const durSec = extractDurationSeconds(c.summary || '');
      const recMatch = c.summary ? c.summary.match(/\[(?:Recording|Audio):\s*([^\]]+?)\s*\]/i) : null;
      const recordingUrl = recMatch ? recMatch[1].trim() : null;

      const dispMatch = c.summary ? c.summary.match(/\[Disposition:\s*([^\]]+?)\s*\]/i) : null;
      const disposition = dispMatch ? dispMatch[1].trim() : null;

      const contactName = `${c.contact?.firstName || ''} ${c.contact?.lastName || ''}`.trim() || 'Unknown Contact';

      return {
        id: c.id,
        recordType: 'CONTACT' as const,
        recordId: c.contactId,
        userId: c.userId,
        telecallerName: u
          ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email
          : (c.userId === 'system' ? 'System' : c.userId),
        telecallerEmail: u?.email || '',
        leadName: contactName,
        leadPhone: c.contact?.phone || 'N/A',
        leadCompany: c.contact?.company?.name || 'N/A',
        content: c.summary,
        disposition,
        durationSeconds: durSec,
        formattedDuration: formatTalkTime(durSec),
        recordingUrl,
        timestamp: c.createdAt,
      };
    });

    const detailedLogs = [...leadLogs, ...contactLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return {
      date: startOfDay.toISOString().split('T')[0],
      totalCallsToday: detailedLogs.length,
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
      leadId?: string;
      contactId?: string;
      recordType?: 'LEAD' | 'CONTACT';
      userId?: string;
      recordingUrl?: string;
      durationSeconds?: number;
      disposition?: string;
      notes?: string;
    };

    const targetId = body.leadId || body.contactId;
    if (!targetId) {
      return reply.status(400).send({ error: 'leadId or contactId is required' });
    }

    const durationSec = body.durationSeconds || 0;
    const durStr = formatTalkTime(durationSec);
    const audioTag = body.recordingUrl ? ` [Recording: ${body.recordingUrl.trim()}]` : '';
    const dispositionTag = body.disposition ? ` [Disposition: ${body.disposition}]` : '';
    const notesStr = body.notes ? ` Notes: ${body.notes}` : '';

    const content = `[Call Duration: ${durStr}]${dispositionTag}${audioTag}${notesStr}`.trim();

    // Resolve the actual userId:
    const resolvedUserId =
      body.userId && body.userId !== 'ALL'
        ? body.userId
        : ((req as any).user?.sub || (req as any).user?.id || 'system');

    // Determine whether targetId is a Contact or a Lead
    let isContact = body.recordType === 'CONTACT' || !!body.contactId;

    if (!isContact && body.leadId) {
      // Check if leadId exists in Lead table
      const leadExists = await app.prisma.lead.findUnique({
        where: { id: body.leadId },
        select: { id: true },
      });
      if (!leadExists) {
        // Check if it exists in Contact table
        const contactExists = await app.prisma.contact.findUnique({
          where: { id: body.leadId },
          select: { id: true },
        });
        if (contactExists) {
          isContact = true;
        }
      }
    }

    if (isContact) {
      const contactId = body.contactId || body.leadId!;
      const commLog = await app.prisma.communicationLog.create({
        data: {
          contactId,
          type: 'CALL',
          direction: 'OUTBOUND',
          summary: content,
          userId: resolvedUserId,
        },
      });

      return { success: true, log: commLog, recordType: 'CONTACT' };
    }

    const activity = await app.prisma.leadActivity.create({
      data: {
        leadId: body.leadId!,
        type: 'CALL',
        content,
        userId: resolvedUserId,
      },
    });

    // Update Lead notes with follow-up information & update timestamp
    try {
      const existingLead = await app.prisma.lead.findUnique({
        where: { id: body.leadId! },
        select: { notes: true, status: true },
      });
      if (existingLead) {
        const oldNotes = existingLead.notes || '';
        const followupEntry = body.notes 
          ? body.notes 
          : `[${new Date().toLocaleDateString('en-IN')} ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}] Call (${durStr})${body.disposition ? ` [${body.disposition}]` : ''}`;
        const updatedNotes = oldNotes ? `${followupEntry}\n\n${oldNotes}` : followupEntry;
        
        await app.prisma.lead.update({
          where: { id: body.leadId! },
          data: {
            notes: updatedNotes,
            updatedAt: new Date(),
          },
        });
      }
    } catch (e) {
      req.log?.warn?.({ err: e }, 'Failed to append follow-up note to lead');
    }

    return { success: true, activity, recordType: 'LEAD' };
  };

  app.post('/recordings', handleRecordings);
  app.post('/telephony/recordings', handleRecordings);

  // PATCH /api/v1/crm/telephony/recordings/:id — attach or update recording link
  const handleAttachRecording = async (req: any, reply: any) => {
    const { id } = req.params as { id: string };
    const { recordingUrl, notes } = req.body as { recordingUrl: string; notes?: string };

    if (!recordingUrl) {
      return reply.status(400).send({ error: 'recordingUrl is required' });
    }

    const audioTag = ` [Recording: ${recordingUrl.trim()}]`;

    // Try finding in LeadActivity
    const leadAct = await app.prisma.leadActivity.findUnique({ where: { id } });
    if (leadAct) {
      let newContent = (leadAct.content || '').replace(/\[(?:Recording|Audio):\s*[^\]]+?\]/gi, '').trim();
      newContent = `${newContent}${audioTag}`.trim();
      if (notes) newContent += ` Notes: ${notes}`;
      const updated = await app.prisma.leadActivity.update({
        where: { id },
        data: { content: newContent },
      });
      return { success: true, activity: updated, recordType: 'LEAD' };
    }

    // Try finding in CommunicationLog
    const commLog = await app.prisma.communicationLog.findUnique({ where: { id } });
    if (commLog) {
      let newSummary = (commLog.summary || '').replace(/\[(?:Recording|Audio):\s*[^\]]+?\]/gi, '').trim();
      newSummary = `${newSummary}${audioTag}`.trim();
      if (notes) newSummary += ` Notes: ${notes}`;
      const updated = await app.prisma.communicationLog.update({
        where: { id },
        data: { summary: newSummary },
      });
      return { success: true, log: updated, recordType: 'CONTACT' };
    }

    return reply.status(404).send({ error: 'Call log not found' });
  };

  app.patch('/recordings/:id', handleAttachRecording);
  app.patch('/telephony/recordings/:id', handleAttachRecording);
}
