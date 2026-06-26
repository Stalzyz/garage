import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { sendEmail, EmailTemplates } from '../integrations/email.service';

// ─── Drip Queue (in-memory for dev; swap for Bull/BullMQ in prod) ─────────────

interface DripJob {
  id: string;
  type: 'WELCOME' | 'FOLLOW_UP_3D' | 'WEEKLY';
  to: string;
  clientName: string;
  projectName?: string;
  progress?: number;
  nextMilestone?: string;
  scheduledAt: Date;
  sent: boolean;
}

const dripQueue: DripJob[] = [];

// Background ticker: runs every 60 seconds and flushes due drip emails
let dripTicker: NodeJS.Timeout | null = null;

function startDripTicker(app: FastifyInstance) {
  if (dripTicker) return;
  dripTicker = setInterval(async () => {
    const now = new Date();
    const due = dripQueue.filter(j => !j.sent && j.scheduledAt <= now);
    for (const job of due) {
      try {
        let template;
        if (job.type === 'WELCOME') {
          template = EmailTemplates.dripWelcome(job.clientName);
        } else if (job.type === 'FOLLOW_UP_3D') {
          template = EmailTemplates.dripFollowUp3Days(job.clientName, job.projectName || 'your project');
        } else {
          template = EmailTemplates.dripWeekly(job.clientName, job.projectName || 'your project', job.progress || 0, job.nextMilestone || 'TBD');
        }
        await sendEmail(job.to, template);
        job.sent = true;
        app.log.info(`[Drip] Sent ${job.type} to ${job.to}`);
      } catch (err) {
        app.log.error(`[Drip] Failed to send ${job.type} to ${job.to}: ${err}`);
      }
    }
  }, 60_000); // Check every 60s
}

// ─── Router ───────────────────────────────────────────────────────────────────

export default async function emailRouter(app: FastifyInstance) {
  startDripTicker(app);

  // POST /send/proposal-ready
  app.post('/send/proposal-ready', async (request, reply) => {
    const schema = z.object({
      to: z.string().email(),
      clientName: z.string(),
      proposalTitle: z.string(),
      proposalId: z.string(),
    });
    const body = schema.parse(request.body);
    const result = await sendEmail(body.to, EmailTemplates.proposalReady(body.clientName, body.proposalTitle, body.proposalId));
    return { success: true, ...result };
  });

  // POST /send/project-update
  app.post('/send/project-update', async (request, reply) => {
    const schema = z.object({
      to: z.string().email(),
      clientName: z.string(),
      projectName: z.string(),
      phase: z.string(),
      progress: z.number().min(0).max(100),
    });
    const body = schema.parse(request.body);
    const result = await sendEmail(body.to, EmailTemplates.projectUpdate(body.clientName, body.projectName, body.phase, body.progress));
    return { success: true, ...result };
  });

  // POST /send/invoice-due
  app.post('/send/invoice-due', async (request, reply) => {
    const schema = z.object({
      to: z.string().email(),
      clientName: z.string(),
      invoiceId: z.string(),
      amount: z.number(),
      dueDate: z.string(),
    });
    const body = schema.parse(request.body);
    const result = await sendEmail(body.to, EmailTemplates.invoiceDue(body.clientName, body.invoiceId, body.amount, body.dueDate));
    return { success: true, ...result };
  });

  // POST /send/deliverable-ready
  app.post('/send/deliverable-ready', async (request, reply) => {
    const schema = z.object({
      to: z.string().email(),
      clientName: z.string(),
      projectName: z.string(),
      fileName: z.string(),
    });
    const body = schema.parse(request.body);
    const result = await sendEmail(body.to, EmailTemplates.deliverableReady(body.clientName, body.projectName, body.fileName));
    return { success: true, ...result };
  });

  // POST /drip/enroll — enroll a client into the full drip sequence
  app.post('/drip/enroll', async (request, reply) => {
    const schema = z.object({
      to: z.string().email(),
      clientName: z.string(),
      projectName: z.string(),
      progress: z.number().default(0),
      nextMilestone: z.string().default('Kickoff Call'),
    });
    const body = schema.parse(request.body);

    const now = new Date();
    const jobs: DripJob[] = [
      {
        id: `drip_${Date.now()}_welcome`,
        type: 'WELCOME',
        to: body.to,
        clientName: body.clientName,
        scheduledAt: new Date(now.getTime() + 1_000), // 1s delay (immediate in dev)
        sent: false,
      },
      {
        id: `drip_${Date.now()}_followup`,
        type: 'FOLLOW_UP_3D',
        to: body.to,
        clientName: body.clientName,
        projectName: body.projectName,
        scheduledAt: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000), // 3 days
        sent: false,
      },
      {
        id: `drip_${Date.now()}_weekly`,
        type: 'WEEKLY',
        to: body.to,
        clientName: body.clientName,
        projectName: body.projectName,
        progress: body.progress,
        nextMilestone: body.nextMilestone,
        scheduledAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
        sent: false,
      },
    ];

    dripQueue.push(...jobs);

    // Send the welcome email immediately (don't wait for ticker)
    const welcomeJob = jobs[0];
    await sendEmail(welcomeJob.to, EmailTemplates.dripWelcome(welcomeJob.clientName));
    welcomeJob.sent = true;

    return {
      success: true,
      enrolled: jobs.length,
      jobs: jobs.map(j => ({ id: j.id, type: j.type, scheduledAt: j.scheduledAt })),
    };
  });

  // GET /drip/queue — view all queued drip jobs
  app.get('/drip/queue', async () => {
    return { total: dripQueue.length, pending: dripQueue.filter(j => !j.sent).length, jobs: dripQueue };
  });

  // DELETE /drip/queue/:id — cancel a specific drip job
  app.delete('/drip/queue/:id', async (request) => {
    const { id } = request.params as { id: string };
    const idx = dripQueue.findIndex(j => j.id === id);
    if (idx === -1) throw new Error('Job not found');
    dripQueue.splice(idx, 1);
    return { success: true };
  });
}
