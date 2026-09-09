import { FastifyInstance } from 'fastify';

interface DialMobileBody {
  leadPhone: string;
  email: string;
}

export default async function telephonyRouter(app: FastifyInstance) {
  app.post<{ Body: DialMobileBody }>('/dial-mobile', async (req, reply) => {
    const { leadPhone, email } = req.body;

    if (!leadPhone || !email) {
      return reply.status(400).send({ error: 'leadPhone and email are required' });
    }

    // Broadcast trigger via WebSockets
    (app as any).broadcast('MOBILE_DIAL_TRIGGER', { email, leadPhone });

    return { success: true };
  });

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
        ...(userId ? { userId } : {}),
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

    const telecallersSummary = Array.from(telecallerStatsMap.values()).map(st => ({
      userId: st.userId,
      userName: st.userName,
      email: st.email,
      totalCalls: st.totalCalls,
      uniqueLeadsCount: st.uniqueLeads.size,
      meetingsBooked: st.meetingsBooked,
      callbacks: st.callbacks,
      notInterested: st.notInterested,
      voicemails: st.voicemails,
      hourlyDistribution: st.hourlyDistribution,
    }));

    return {
      date: startOfDay.toISOString().split('T')[0],
      totalCallsToday: callActivities.length,
      telecallersCount: telecallersSummary.length,
      summary: telecallersSummary,
      detailedLogs: callActivities.map(a => {
        const u = userMap.get(a.userId);
        return {
          id: a.id,
          telecallerName: u
            ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email
            : (a.userId === 'system' ? 'System' : a.userId),
          telecallerEmail: u?.email || '',
          leadName: a.lead?.name || 'Unknown Lead',
          leadPhone: a.lead?.phone || 'N/A',
          leadCompany: a.lead?.company || 'N/A',
          content: a.content,
          timestamp: a.createdAt,
        };
      }),
    };
  };

  app.get('/daily-report', getDailyCallReport);
  app.get('/calls/daily-report', getDailyCallReport);
}
