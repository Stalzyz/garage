import { FastifyInstance } from 'fastify';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';

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

function parseDurationSeconds(val: any): number {
  if (!val) return 0;
  if (typeof val === 'number') return Math.max(0, Math.floor(val));
  const str = String(val).trim();
  if (str.includes(':')) {
    const parts = str.split(':').map((p) => parseInt(p, 10) || 0);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  const mMatch = str.match(/(\d+)\s*m/i);
  const sMatch = str.match(/(\d+)\s*s/i);
  if (mMatch || sMatch) {
    const mins = mMatch ? parseInt(mMatch[1], 10) : 0;
    const secs = sMatch ? parseInt(sMatch[1], 10) : 0;
    return mins * 60 + secs;
  }
  const directNum = parseInt(str, 10);
  return isNaN(directNum) ? 0 : Math.max(0, directNum);
}

function sanitizePhoneNumber(raw: string): { full: string; last10: string } {
  if (!raw) return { full: '', last10: '' };
  const clean = raw.trim();
  const digits = clean.replace(/\D/g, '');
  const last10 = digits.slice(-10);
  return {
    full: clean,
    last10: last10.length === 10 ? last10 : digits,
  };
}

export default async function publicTelephonyRouter(app: FastifyInstance) {
  const recordingsDir = path.resolve(process.cwd(), 'uploads', 'recordings');
  if (!fs.existsSync(recordingsDir)) {
    fs.mkdirSync(recordingsDir, { recursive: true });
  }

  const handleCallSync = async (req: any, reply: any) => {
    let fields: Record<string, any> = {};
    let savedRecordingPath: string | null = null;
    let savedRecordingFilename: string | null = null;

    if (req.isMultipart && req.isMultipart()) {
      const parts = req.parts();
      for await (const part of parts) {
        if ((part as any).file) {
          const filePart = part as any;
          const origName = filePart.filename || 'recording.m4a';
          const safeName = origName.replace(/[^a-zA-Z0-9.\-_]/g, '_');
          const ext = path.extname(safeName) || '.m4a';
          const base = path.basename(safeName, ext);
          const uniqueKey = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}_${base}${ext}`;
          const destPath = path.join(recordingsDir, uniqueKey);

          await pipeline(filePart.file, fs.createWriteStream(destPath));

          savedRecordingPath = `/api/v1/uploads/recordings/${uniqueKey}`;
          savedRecordingFilename = uniqueKey;
        } else {
          const fieldPart = part as any;
          fields[fieldPart.fieldname] = fieldPart.value;
        }
      }
    } else {
      fields = req.body || {};
      if (fields.recordingUrl) {
        savedRecordingPath = fields.recordingUrl;
      }
    }

    const rawContactPhone = fields.phone || fields.phoneNumber || fields.number || fields.contact || fields.leadPhone || fields.caller || '';
    const rawCallerPhone = fields.callerPhone || fields.agentPhone || fields.telecallerPhone || fields.devicePhone || '';
    const callerEmail = fields.callerEmail || fields.email || fields.telecallerEmail || '';
    const syncToken = fields.telecallerToken || fields.token || fields.syncToken || fields.employeeCode || req.headers['x-telephony-token'] || req.query?.token || '';
    const rawDirection = String(fields.callType || fields.direction || fields.type || 'OUTGOING').toUpperCase();
    const durationSeconds = parseDurationSeconds(fields.duration || fields.callDuration || fields.durationSeconds || 0);
    const disposition = fields.disposition || fields.status || '';
    const notes = fields.notes || fields.comment || fields.remarks || '';
    const customCallTime = fields.timestamp || fields.callTime || fields.callEndedAt ? new Date(fields.timestamp || fields.callTime || fields.callEndedAt) : new Date();

    const normalizedDirection = rawDirection.includes('IN') ? 'INCOMING' : (rawDirection.includes('MISS') ? 'MISSED' : 'OUTGOING');

    const { full: contactPhoneFull, last10: contactLast10 } = sanitizePhoneNumber(rawContactPhone);
    const { last10: callerLast10 } = sanitizePhoneNumber(rawCallerPhone);

    if (!contactLast10) {
      return reply.code(400).send({
        error: 'Invalid Phone',
        message: 'A valid customer/contact phone number is required to sync call log.',
      });
    }

    let resolvedUserId: string = 'system';
    let telecallerName: string = 'Android Telecaller';

    if (syncToken || callerEmail || callerLast10) {
      const employee = await req.db.employee.findFirst({
        where: {
          OR: [
            ...(syncToken ? [{ employeeCode: String(syncToken) }] : []),
            ...(callerEmail ? [{ user: { email: String(callerEmail) } }] : []),
            ...(callerLast10 ? [{ user: { phone: { endsWith: callerLast10 } } }] : []),
          ],
        },
        include: { user: true },
      });

      if (employee) {
        resolvedUserId = employee.userId || employee.user?.id || employee.id;
        telecallerName = `${employee.user?.firstName || ''} ${employee.user?.lastName || ''}`.trim() || employee.employeeCode;
      } else {
        const user = await req.db.user.findFirst({
          where: {
            OR: [
              ...(callerEmail ? [{ email: String(callerEmail) }] : []),
              ...(syncToken ? [{ id: String(syncToken) }] : []),
              ...(callerLast10 ? [{ phone: { endsWith: callerLast10 } }] : []),
            ],
          },
        });
        if (user) {
          resolvedUserId = user.id;
          telecallerName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email;
        }
      }
    }

    let lead = await req.db.lead.findFirst({
      where: {
        OR: [
          { phone: { endsWith: contactLast10 } },
          { phone: { contains: contactLast10 } },
        ],
      },
      orderBy: { updatedAt: 'desc' },
    });

    let autoCreatedLead = false;

    if (!lead) {
      const contact = await req.db.contact.findFirst({
        where: {
          OR: [
            { phone: { endsWith: contactLast10 } },
            { phone: { contains: contactLast10 } },
          ],
        },
        include: { company: true },
      });

      if (contact) {
        const contactName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || `Contact ${contactLast10}`;
        lead = await req.db.lead.create({
          data: {
            name: contactName,
            phone: contact.phone || `+91${contactLast10}`,
            email: contact.email || null,
            company: contact.company?.name || null,
            source: 'COLD_OUTREACH',
            status: 'CONTACTED',
            businessUnit: 'AGENCY',
            score: 35,
            notes: `Auto-linked from Contact #${contact.id} via Android Native Call Sync`,
          },
        });
        autoCreatedLead = true;
      }
    }

    if (!lead) {
      const displayPhone = contactPhoneFull.startsWith('+') ? contactPhoneFull : `+91${contactLast10}`;
      lead = await req.db.lead.create({
        data: {
          name: `Auto-Captured (${normalizedDirection === 'INCOMING' ? 'Inbound' : 'Outbound'} ${contactLast10})`,
          phone: displayPhone,
          source: 'COLD_OUTREACH',
          status: 'CONTACTED',
          businessUnit: 'AGENCY',
          score: 25,
          notes: `Auto-captured via Android Native Call Sync (${normalizedDirection}). Initial call duration: ${formatTalkTime(durationSeconds)}`,
        },
      });
      autoCreatedLead = true;
    } else {
      const updateData: any = { updatedAt: new Date() };
      if (lead.status === 'NEW') {
        updateData.status = 'CONTACTED';
      }
      await req.db.lead.update({
        where: { id: lead.id },
        data: updateData,
      });
    }

    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000);
    const existingRecentActivity = await req.db.leadActivity.findFirst({
      where: {
        leadId: lead.id,
        type: 'CALL',
        createdAt: { gte: threeMinutesAgo },
      },
      orderBy: { createdAt: 'desc' },
    });

    let activity: any = null;
    const durStr = formatTalkTime(durationSeconds);
    const recordingTag = savedRecordingPath ? ` [Recording: ${savedRecordingPath}]` : '';
    const dispositionTag = disposition ? ` [Disposition: ${disposition}]` : '';
    const notesStr = notes ? ` Notes: ${notes}` : '';
    const directionTag = ` [Direction: ${normalizedDirection}]`;

    if (existingRecentActivity && (!existingRecentActivity.content.includes('[Recording:') || !existingRecentActivity.content.includes('http') && savedRecordingPath)) {
      const updatedContent = `${existingRecentActivity.content}${recordingTag}`.trim();
      activity = await req.db.leadActivity.update({
        where: { id: existingRecentActivity.id },
        data: { content: updatedContent },
      });
      app.log.info(`[TelephonySync] Attached recording to recent activity ${activity.id}`);
    } else {
      const content = `[Call Duration: ${durStr}]${directionTag}${dispositionTag}${recordingTag}${notesStr}`.trim();
      activity = await req.db.leadActivity.create({
        data: {
          leadId: lead.id,
          type: 'CALL',
          content,
          userId: resolvedUserId,
          createdAt: customCallTime,
        },
      });
      app.log.info(`[TelephonySync] Created new call activity ${activity.id} for lead ${lead.id}`);
    }

    try {
      (app as any).broadcast('NEW_CALL_SYNCED', {
        activityId: activity.id,
        leadId: lead.id,
        leadName: lead.name,
        leadPhone: lead.phone,
        leadCompany: lead.company,
        duration: durationSeconds,
        formattedDuration: durStr,
        direction: normalizedDirection,
        recordingUrl: savedRecordingPath,
        telecallerName,
        timestamp: (activity.createdAt || new Date()).toISOString(),
      });

      (app as any).broadcast('telemetry-event', {
        event: 'Android Native Call Synced',
        data: {
          lead: lead.name,
          phone: lead.phone,
          duration: durStr,
          direction: normalizedDirection,
          telecaller: telecallerName,
          hasRecording: !!savedRecordingPath,
        },
      });
    } catch (wsErr) {
      app.log.warn(wsErr, '[TelephonySync] WebSocket broadcast failed');
    }

    reply.code(201);
    return {
      success: true,
      message: 'Call synced successfully',
      leadId: lead.id,
      leadName: lead.name,
      leadPhone: lead.phone,
      autoCreatedLead,
      activityId: activity.id,
      recordingUrl: savedRecordingPath,
      telecallerName,
      durationSeconds,
    };
  };

  app.post('/sync', handleCallSync);
  app.post('/', handleCallSync);

  app.get('/recent', async (req: any) => {
    const limit = Math.min(parseInt(req.query?.limit, 10) || 20, 50);

    const activities = await req.db.leadActivity.findMany({
      where: {
        type: 'CALL',
        content: { contains: '[Recording:' },
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            phone: true,
            company: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const userIds = Array.from(new Set(activities.map((a) => a.userId).filter(Boolean)));
    const users = await req.db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true, email: true },
    });
    const userMap = new Map<string, { id: string; firstName: string; lastName: string; email: string }>(
      users.map((u) => [u.id, u])
    );

    const items = activities.map((a) => {
      const u = userMap.get(a.userId);
      const recMatch = a.content.match(/\[(?:Recording|Audio):\s*([^\]]+?)\s*\]/i);
      const durMatch = a.content.match(/\[(?:Call\s*)?Duration:\s*([^\]]+?)\s*\]/i);
      const dirMatch = a.content.match(/\[Direction:\s*([^\]]+?)\s*\]/i);

      return {
        id: a.id,
        leadId: a.lead?.id,
        leadName: a.lead?.name || 'Unknown',
        leadPhone: a.lead?.phone || '',
        leadCompany: a.lead?.company || '',
        recordingUrl: recMatch ? recMatch[1].trim() : null,
        formattedDuration: durMatch ? durMatch[1].trim() : '0m 0s',
        direction: dirMatch ? dirMatch[1].trim() : 'OUTGOING',
        telecaller: u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email : 'Android Dialer',
        timestamp: a.createdAt,
      };
    });

    return {
      success: true,
      count: items.length,
      recordings: items,
    };
  });

  app.get('/setup', async () => {
    return {
      success: true,
      webhookUrl: 'https://grekam.in/api/v1/crm/public/telephony/sync',
      method: 'POST',
      contentType: 'multipart/form-data',
      description: 'Zero-cost Android Native Auto Call Recording Sync for Grekam OS',
      brandGuides: {
        samsung: {
          step1: 'Open Phone App -> 3 dots (top right) -> Settings',
          step2: 'Tap "Record calls" -> Turn ON "Auto record calls" (All calls)',
          recordingFolder: '/Recordings/Call/',
        },
        xiaomi_redmi_poco: {
          step1: 'Open Phone App -> Settings (Gear icon) -> Call recording',
          step2: 'Turn ON "Record calls automatically" -> All numbers',
          recordingFolder: '/MIUI/sound_recorder/call_rec/',
        },
        vivo_iqoo: {
          step1: 'Settings -> Phone (or System app settings -> Phone)',
          step2: 'Record settings -> Select "Record all calls automatically"',
          recordingFolder: '/Record/Call/',
        },
        oppo_realme_oneplus: {
          step1: 'Phone app -> 3 dots -> Settings -> Call recording',
          step2: 'Turn ON "Record all calls"',
          recordingFolder: '/Recordings/Call/',
        },
      },
      macroDroidQuickGuide: {
        trigger: 'Call Ended (Any contact or unknown number)',
        action1: 'File Operation -> Get newest file from recording directory',
        action2: 'HTTP Request -> POST to https://grekam.in/api/v1/crm/public/telephony/sync with multipart audio file, phone=[call_number], duration=[call_duration], direction=[call_type]',
      },
    };
  });

  app.post('/test-sync', async (req: any, reply: any) => {
    const testPhone = req.body?.phone || '+919999900001';
    const result = await handleCallSync({
      isMultipart: () => false,
      body: {
        phone: testPhone,
        callerPhone: '+919876543210',
        duration: 45,
        callType: 'OUTGOING',
        notes: 'Simulated test call to verify failproof Android Call Sync pipeline',
        disposition: 'CONTACTED',
        recordingUrl: '/api/v1/uploads/recordings/sample_test.m4a',
      },
      headers: {},
      query: {},
    }, reply);

    return result;
  });
}
