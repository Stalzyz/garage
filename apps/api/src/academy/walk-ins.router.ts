import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import OpenAI from 'openai';

// Lazy initialization — avoids crash on startup if OPENAI_API_KEY is not set
let _openai: OpenAI | null = null;
function getOpenAI() {
  if (!_openai) {
    if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not set');
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _openai;
}

// Simple round-robin auto-assign from a fixed pool of counsellor user IDs
// In production, pull these from the DB (staff with role COUNSELLOR)
async function autoAssignCounsellor(prisma: any): Promise<string | null> {
  // Find the counsellor with fewest walk-ins today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const result = await prisma.walkIn.groupBy({
    by: ['counsellorId'],
    where: { counsellorId: { not: null }, createdAt: { gte: today } },
    _count: { counsellorId: true },
    orderBy: { _count: { counsellorId: 'asc' } }
  });

  // Get all staff users (admins/managers who can counsel)
  const counsellors = await prisma.user.findMany({
    where: { role: { in: ['MANAGER', 'STAFF'] } },
    select: { id: true }
  });

  if (!counsellors.length) return null;

  // Pick the one with fewest assignments
  const assignedIds = result.map((r: any) => r.counsellorId);
  const unassigned = counsellors.find((c: any) => !assignedIds.includes(c.id));
  if (unassigned) return unassigned.id;

  // Otherwise return the least loaded
  return result[0]?.counsellorId || counsellors[0].id;
}

async function sendWalkInWhatsApp(phone: string, name: string, message: string, provider?: string, token?: string) {
  const cleanPhone = phone.replace(/\D/g, '');
  const fullMessage = message || `👋 Hi ${name}!\n\nThank you for visiting *Grekam Academy*! 🎓\n\nOne of our counsellors will reach out to you shortly.\n\n_We look forward to having you with us!_`;

  if (!token) {
    console.log(`[WhatsApp MOCK] To: ${cleanPhone} | ${fullMessage.substring(0, 60)}...`);
    return;
  }

  // Grafty.pro integration
  if (provider === 'grafty') {
    try {
      await fetch('https://api.grafty.pro/v1/messages/send', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, message: fullMessage })
      });
      return;
    } catch (e) {
      console.error('[Grafty.pro] Failed to send WhatsApp message:', e);
    }
  }

  // WATI fallback
  if (provider === 'wati') {
    try {
      await fetch(`https://live-server-114.wati.io/api/v1/sendSessionMessage/${cleanPhone}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageText: fullMessage })
      });
    } catch (e) {
      console.error('[WATI] Failed to send WhatsApp message:', e);
    }
  }
}

export default async function walkInsRouter(app: FastifyInstance) {
  const whatsappProvider = (process.env.WHATSAPP_PROVIDER || 'grafty') as 'grafty' | 'wati';
  const whatsappToken = process.env.GRAFTY_TOKEN || process.env.WATI_TOKEN;

  // ── GET /api/v1/academy/walk-ins ──────────────────────────────────────────
  app.get('/walk-ins', async (req, reply) => {
    const { status, date, counsellorId } = req.query as any;

    const where: any = {};
    if (status) where.status = status;
    if (counsellorId) where.counsellorId = counsellorId;
    if (date) {
      const d = new Date(date);
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      where.createdAt = { gte: d, lt: next };
    }

    const walkIns = await app.prisma.walkIn.findMany({
      where,
      include: { demoRegistration: { include: { demoSession: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return walkIns;
  });



  // ── POST /api/v1/academy/walk-ins (Kiosk submission) ─────────────────────
  app.post('/walk-ins', async (req, reply) => {
    const schema = z.object({
      name: z.string().min(2),
      phone: z.string().min(10),
      email: z.string().email().optional(),
      interestArea: z.string(),
      type: z.enum(['WALKIN', 'DEMO', 'ENQUIRY', 'CAMPUS_TOUR']).default('WALKIN'),
      source: z.string().default('OTHER'),
      preferredDate: z.string().optional(),
      notes: z.string().optional(),
    });
    const body = schema.parse(req.body);

    // Auto-assign counsellor
    const counsellorId = await autoAssignCounsellor(app.prisma);

    const walkIn = await app.prisma.walkIn.create({
      data: {
        name: body.name,
        phone: body.phone,
        email: body.email,
        interestArea: body.interestArea,
        type: body.type as any,
        source: body.source,
        counsellorId,
        preferredDate: body.preferredDate ? new Date(body.preferredDate) : undefined,
        notes: body.notes,
        status: 'NEW',
      }
    });

    // Automatically sync to CRM Leads for ACADEMY business unit
    try {
      await app.prisma.lead.create({
        data: {
          name: body.name,
          phone: body.phone,
          email: body.email,
          courseInterest: body.interestArea,
          businessUnit: 'ACADEMY',
          status: 'ENQUIRY',
          source: body.source as any || 'WEBSITE',
          assignedToId: counsellorId || undefined,
          notes: `Kiosk Walk-In (${body.type}). Notes: ${body.notes || 'N/A'}`
        }
      });
    } catch (crmErr) {
      console.error('[Walk-in to CRM sync warning]:', crmErr);
    }

    // Auto-send WhatsApp immediately
    const welcomeMsg = `👋 Hi ${body.name}!\n\nThank you for visiting *Grekam Academy*! 🎓\n\nWe've registered your interest in *${body.interestArea}*.\n\nOne of our counsellors will reach out to you shortly.\n\n_We look forward to having you with us!_`;
    await sendWalkInWhatsApp(body.phone, body.name, welcomeMsg, whatsappProvider, whatsappToken);

    // Mark whatsapp sent
    await app.prisma.walkIn.update({ where: { id: walkIn.id }, data: { whatsappSent: true } });

    // Also create a Lead in Admission CRM if email or phone doesn't exist
    const existingLead = await app.prisma.lead.findFirst({ where: { phone: body.phone } });
    if (!existingLead) {
      await app.prisma.lead.create({
        data: {
          name: body.name,
          phone: body.phone,
          email: body.email,
          source: 'OTHER',
          status: 'NEW',
          notes: `Walk-in: ${body.type}. Interest: ${body.interestArea}.`
        }
      });
    }

    reply.code(201);
    return { success: true, walkIn, counsellorId };
  });

  // ── PATCH /api/v1/academy/walk-ins/:id ───────────────────────────────────
  app.patch('/walk-ins/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const schema = z.object({
      status: z.enum(['NEW', 'COUNSELLING', 'DEMO_SCHEDULED', 'CONVERTED', 'FOLLOW_UP', 'COLD', 'LOST']).optional(),
      counsellorId: z.string().optional(),
      notes: z.string().optional(),
      followUpAt: z.string().optional(),
    });
    const body = schema.parse(req.body);

    const updated = await app.prisma.walkIn.update({
      where: { id },
      data: {
        ...body,
        followUpAt: body.followUpAt ? new Date(body.followUpAt) : undefined,
        convertedAt: body.status === 'CONVERTED' ? new Date() : undefined,
      }
    });
    return updated;
  });

  // ── GET /api/v1/academy/walk-ins/stats ───────────────────────────────────
  app.get('/walk-ins/stats', async (req, reply) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayCount, totalNew, totalConverted, bySource] = await Promise.all([
      app.prisma.walkIn.count({ where: { createdAt: { gte: today } } }),
      app.prisma.walkIn.count({ where: { status: 'NEW' } }),
      app.prisma.walkIn.count({ where: { status: 'CONVERTED' } }),
      app.prisma.walkIn.groupBy({ by: ['source'], _count: { source: true } }),
    ]);

    const total = await app.prisma.walkIn.count();
    const conversionRate = total > 0 ? Math.round((totalConverted / total) * 100) : 0;

    return { todayCount, totalNew, totalConverted, conversionRate, bySource };
  });

  // ── GET /api/v1/academy/demo-sessions ─────────────────────────────────────
  app.get('/demo-sessions', async (req, reply) => {
    const sessions = await app.prisma.demoSession.findMany({
      where: { isActive: true, scheduledAt: { gte: new Date() } },
      include: { _count: { select: { registrations: true } } },
      orderBy: { scheduledAt: 'asc' }
    });
    return sessions;
  });

  // ── POST /api/v1/academy/demo-sessions ────────────────────────────────────
  app.post('/demo-sessions', async (req, reply) => {
    const schema = z.object({
      title: z.string(),
      courseId: z.string().optional(),
      scheduledAt: z.string(),
      durationMins: z.number().default(60),
      venue: z.string().optional(),
      meetLink: z.string().optional(),
      capacity: z.number().default(20),
      mentorId: z.string().optional(),
    });
    const body = schema.parse(req.body);

    const session = await app.prisma.demoSession.create({
      data: { ...body, scheduledAt: new Date(body.scheduledAt) }
    });
    reply.code(201);
    return session;
  });

  // ── POST /api/v1/academy/demo-sessions/:id/register ──────────────────────
  app.post('/demo-sessions/:id/register', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { walkInId } = req.body as { walkInId: string };

    const session = await app.prisma.demoSession.findUnique({
      where: { id },
      include: { _count: { select: { registrations: true } } }
    });
    if (!session) return reply.notFound('Demo session not found');
    if (session._count.registrations >= session.capacity) {
      return reply.code(400).send({ message: 'This demo session is fully booked' });
    }

    const reg = await app.prisma.demoRegistration.create({
      data: { demoSessionId: id, walkInId }
    });

    // Update walk-in status
    const walkIn = await app.prisma.walkIn.update({
      where: { id: walkInId },
      data: { status: 'DEMO_SCHEDULED' }
    });

    // Send WhatsApp reminder about demo
    const sessionDate = new Date(session.scheduledAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    const demoMsg = `👋 Hi ${walkIn.name}!\n\nYour demo class has been scheduled! 🎓\n\n📅 *${session.title}*\n🕒 ${sessionDate}\n📍 ${session.venue || 'Grekam Campus'}\n\nSee you there!`;
    await sendWalkInWhatsApp(walkIn.phone, walkIn.name, demoMsg, whatsappProvider, whatsappToken);

    reply.code(201);
    return reg;
  });

  // ── PATCH /api/v1/academy/demo-sessions/registrations/:id ────────────────
  // Counsellor marks attendance + outcome after demo
  app.patch('/demo-sessions/registrations/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const schema = z.object({
      status: z.enum(['ATTENDED', 'NO_SHOW', 'INTERESTED', 'NOT_INTERESTED']),
      feedback: z.string().optional(),
    });
    const body = schema.parse(req.body);

    const updated = await app.prisma.demoRegistration.update({
      where: { id },
      data: body,
      include: { walkIn: true }
    });

    // Move walk-in to COUNSELLING if interested
    if (body.status === 'INTERESTED') {
      await app.prisma.walkIn.update({
        where: { id: updated.walkInId },
        data: { status: 'COUNSELLING' }
      });
    } else if (body.status === 'NOT_INTERESTED') {
      await app.prisma.walkIn.update({
        where: { id: updated.walkInId },
        data: { status: 'LOST' }
      });
    }

    return updated;
  });

  // ── POST /api/v1/academy/walk-ins/:id/generate-pitch ─────────────────────
  app.post('/:id/generate-pitch', async (req, reply) => {
    const { id } = req.params as { id: string };
    
    const walkIn = await app.prisma.walkIn.findUnique({ where: { id } });
    if (!walkIn) return reply.notFound('Walk-in not found');

    if (!process.env.OPENAI_API_KEY) {
      return reply.code(500).send({ message: "OpenAI API key not configured." });
    }

    const prompt = `
      You are an expert admissions counselor for Grekam Academy.
      A student visited us. Here are their details:
      Name: ${walkIn.name}
      Interest Area: ${walkIn.interestArea}
      Source: ${walkIn.source}
      Visit Type: ${walkIn.type}
      Status: ${walkIn.status}
      Notes: ${walkIn.notes || 'None'}
      Date of Visit: ${walkIn.createdAt.toLocaleDateString()}

      Generate exactly 3 distinct, highly personalized WhatsApp follow-up messages to send to this student.
      Do not include any placeholders like [Your Name], just write the pure message body.
      Format the output as a JSON array of strings. Do not include markdown formatting or backticks.
      Example: ["Message 1", "Message 2", "Message 3"]
      
      Make variation 1 professional and direct.
      Make variation 2 casual, friendly, and enthusiastic.
      Make variation 3 action-oriented (inviting them to a demo session or campus tour).
    `;

    try {
      const response = await getOpenAI().chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
      });

      const text = response.choices[0].message.content || '[]';
      // Strip markdown code blocks if AI returned them
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      
      let pitches: string[] = [];
      try {
        pitches = JSON.parse(cleanText);
      } catch (e) {
        // Fallback if parsing fails
        pitches = [cleanText];
      }

      return { success: true, pitches };
    } catch (error: any) {
      app.log.error(error);
      return reply.code(500).send({ message: "Failed to generate pitch", error: error.message });
    }
  });
}
