import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import crypto from 'crypto';

interface MetaLeadgenValue {
  form_id: string;
  leadgen_id: string;
  created_time: number;
  page_id: string;
}

interface MetaNfmReplyValue {
  messaging_product: string;
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };
  contacts?: Array<{
    profile: { name: string };
    wa_id: string;
  }>;
  messages?: Array<{
    from: string;
    id: string;
    timestamp: string;
    type: string;
    interactive?: {
      type: 'nfm_reply';
      nfm_reply: {
        name: string;
        body: string;
        response_json: string;
      };
    };
  }>;
}

interface MetaWebhookPayload {
  object: string;
  entry: Array<{
    id: string;
    time?: number;
    changes: Array<{
      field: string;
      value: MetaLeadgenValue | MetaNfmReplyValue | any;
    }>;
  }>;
}

/**
 * Verify HMAC SHA-256 signature sent by Meta in header 'x-hub-signature-256'
 */
function verifyMetaSignature(req: FastifyRequest): boolean {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret) {
    // If secret is not configured in env, bypass validation (useful for local development)
    return true;
  }

  const signature = req.headers['x-hub-signature-256'] as string;
  if (!signature) return false;

  const rawBody = (req as any).rawBody || JSON.stringify(req.body);
  try {
    const hmac = crypto.createHmac('sha256', appSecret);
    const expectedSignature = `sha256=${hmac.update(rawBody).digest('hex')}`;
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch (error) {
    return false;
  }
}

export default async function metaRouter(app: FastifyInstance) {
  // Shared verification handler for GET /meta & GET /whatsapp/webhook
  const verificationHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as any;
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;

    if (mode && token) {
      if (mode === 'subscribe' && (token === VERIFY_TOKEN || !VERIFY_TOKEN)) {
        app.log.info('Meta webhook verification succeeded');
        reply.type('text/plain').send(challenge);
      } else {
        app.log.warn('Meta webhook verification failed: Token mismatch');
        reply.code(403).send('Forbidden');
      }
    } else {
      reply.code(400).send('Bad Request');
    }
  };

  // Shared event handler for POST /meta & POST /whatsapp/webhook
  const eventHandler = async (req: FastifyRequest, reply: FastifyReply) => {
    if (!verifyMetaSignature(req)) {
      app.log.warn('Invalid Meta Webhook Signature');
      return reply.code(401).send({ error: 'Invalid HMAC signature' });
    }

    const body = req.body as MetaWebhookPayload;

    // Acknowledge receipt immediately to avoid Meta retries (within 20s required by Meta)
    reply.send({ received: true });

    if (!body?.entry) return;

    for (const entry of body.entry) {
      if (!entry.changes) continue;
      for (const change of entry.changes) {
        // 1. Meta Lead Ads (Leadgen Form Submissions)
        if (change.field === 'leadgen') {
          const val = change.value as MetaLeadgenValue;
          if (val?.leadgen_id) {
            app.log.info(`Received Meta Leadgen: ${val.leadgen_id} from form ${val.form_id}`);
            try {
              await fetchAndProcessLead(app, val.leadgen_id, val.form_id, val.page_id);
            } catch (error: any) {
              app.log.error({ err: error }, `Failed to process lead ${val.leadgen_id}`);
            }
          }
        }

        // 2. Meta WhatsApp Flows (nfm_reply Interactive Submissions)
        if (change.field === 'messages') {
          const val = change.value as MetaNfmReplyValue;
          if (val?.messages) {
            for (const msg of val.messages) {
              if (msg.type === 'interactive' && msg.interactive?.type === 'nfm_reply') {
                app.log.info(`Received Meta WhatsApp Flow submission from ${msg.from}`);
                try {
                  await processWhatsAppFlowLead(app, msg, val.contacts);
                } catch (error: any) {
                  app.log.error({ err: error }, `Failed to process WhatsApp Flow lead from ${msg.from}`);
                }
              }
            }
          }
        }
      }
    }
  };

  // Register primary endpoints
  app.get('/meta', verificationHandler);
  app.post('/meta', eventHandler);

  // Register alias endpoints for compatibility with existing WABA webhook URLs (/api/whatsapp/webhook)
  app.get('/whatsapp/webhook', verificationHandler);
  app.post('/whatsapp/webhook', eventHandler);
}

/**
 * Process Facebook/Instagram Lead Ads via Graph API
 */
async function fetchAndProcessLead(app: FastifyInstance, leadgenId: string, formId: string, pageId: string) {
  const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
  if (!ACCESS_TOKEN) {
    app.log.error('META_ACCESS_TOKEN is not configured');
    return;
  }

  // Fetch lead data from Meta Graph API
  const response = await fetch(`https://graph.facebook.com/v19.0/${leadgenId}?access_token=${ACCESS_TOKEN}`);
  const data = await response.json();

  if (data.error) {
    throw new Error(`Graph API Error: ${data.error.message}`);
  }

  // Field mapping from Meta Form fields
  let email = '';
  let phone = '';
  let fullName = 'Unknown Lead';
  let company = '';

  if (data.field_data) {
    for (const field of data.field_data) {
      const val = field.values[0];
      if (!val) continue;

      switch (field.name) {
        case 'email':
          email = val;
          break;
        case 'phone_number':
          phone = val;
          break;
        case 'full_name':
          fullName = val;
          break;
        case 'first_name':
          if (fullName === 'Unknown Lead') fullName = val;
          else fullName = val + ' ' + fullName.split(' ').slice(1).join(' ');
          break;
        case 'last_name':
          if (fullName === 'Unknown Lead') fullName = val;
          else fullName = fullName.split(' ')[0] + ' ' + val;
          break;
        case 'company_name':
          company = val;
          break;
      }
    }
  }

  // Determine routing: Academy vs Agency
  const academyFormIds = (process.env.META_ACADEMY_FORM_IDS || '').split(',');
  const academyPageIds = (process.env.META_ACADEMY_PAGE_IDS || '').split(',');

  let businessUnit = 'AGENCY';
  if (academyFormIds.includes(formId) || academyPageIds.includes(pageId)) {
    businessUnit = 'ACADEMY';
  }

  // Upsert or Create Lead in Database
  const searchConditions: any[] = [];
  if (email) searchConditions.push({ email });
  if (phone) {
    const cleanDigits = phone.replace(/\D/g, '').slice(-10);
    if (cleanDigits) searchConditions.push({ phone: { contains: cleanDigits } });
  }

  let existingLead: any = null;
  if (searchConditions.length > 0) {
    existingLead = await app.prisma.lead.findFirst({
      where: { OR: searchConditions }
    });
  }

  let newLead;
  if (existingLead) {
    newLead = await app.prisma.lead.update({
      where: { id: existingLead.id },
      data: {
        name: fullName !== 'Unknown Lead' ? fullName : existingLead.name,
        company: company || existingLead.company,
        notes: `${existingLead.notes || ''}\n[${new Date().toISOString()}] Meta Form re-submission (Form: ${formId})`,
      }
    });
    app.log.info(`Updated existing CRM lead: ${newLead.id} (${newLead.name})`);
  } else {
    newLead = await app.prisma.lead.create({
      data: {
        name: fullName,
        email: email || undefined,
        phone: phone || undefined,
        company: company || undefined,
        source: 'META_ADS',
        status: 'NEW',
        businessUnit,
        notes: `Imported via Meta Webhook (Lead ID: ${leadgenId}, Form: ${formId})`,
      },
    });
    app.log.info(`Successfully created ${businessUnit} lead: ${newLead.id} (${newLead.name})`);
  }

  // Real-time broadcast to connected CRM UI clients
  if (typeof (app as any).broadcast === 'function') {
    (app as any).broadcast('LEAD_CREATED', { lead: newLead, source: 'META_ADS' });
  }
}

/**
 * Process Meta WhatsApp Flow (nfm_reply) submissions
 */
async function processWhatsAppFlowLead(
  app: FastifyInstance,
  msg: NonNullable<MetaNfmReplyValue['messages']>[number],
  contacts?: MetaNfmReplyValue['contacts']
) {
  const nfmReply = msg.interactive?.nfm_reply;
  if (!nfmReply?.response_json) return;

  let flowData: Record<string, any> = {};
  try {
    flowData = JSON.parse(nfmReply.response_json);
  } catch (err) {
    app.log.error('Failed to parse WhatsApp Flow response_json');
    return;
  }

  const waContact = contacts?.find((c) => c.wa_id === msg.from);
  const waName = waContact?.profile?.name;

  let name = flowData.name || flowData.full_name || flowData.first_name || waName || `WhatsApp Lead (${msg.from})`;
  if (flowData.first_name && flowData.last_name) {
    name = `${flowData.first_name} ${flowData.last_name}`;
  }
  const email = flowData.email || flowData.email_address;
  const phone = flowData.phone || flowData.phone_number || msg.from;
  const company = flowData.company || flowData.company_name;
  const courseInterest = flowData.course || flowData.course_interest || flowData.program;
  const projectType = flowData.service || flowData.project_type || flowData.interest;
  const notes = flowData.notes || flowData.message || `Meta Flow Response (${nfmReply.name || 'Flow'})`;

  // Route business unit
  const isAcademy = Boolean(courseInterest || nfmReply.name?.toLowerCase().includes('academy'));
  const businessUnit = isAcademy ? 'ACADEMY' : 'AGENCY';

  // Deduplicate by email or phone
  const cleanPhone = (phone || msg.from).replace(/\D/g, '').slice(-10);
  const flowSearchConditions: any[] = [];
  if (email) flowSearchConditions.push({ email });
  if (cleanPhone) flowSearchConditions.push({ phone: { contains: cleanPhone } });

  let existingLead: any = null;
  if (flowSearchConditions.length > 0) {
    existingLead = await app.prisma.lead.findFirst({
      where: { OR: flowSearchConditions }
    });
  }

  let lead;
  if (existingLead) {
    lead = await app.prisma.lead.update({
      where: { id: existingLead.id },
      data: {
        name: name.includes('WhatsApp Lead') ? existingLead.name : name,
        company: company || existingLead.company,
        courseInterest: courseInterest || existingLead.courseInterest,
        projectType: projectType || existingLead.projectType,
        notes: `${existingLead.notes || ''}\n[${new Date().toISOString()}] Meta WhatsApp Flow response: ${notes}`,
      }
    });
    app.log.info(`Updated existing CRM lead from WhatsApp Flow: ${lead.id}`);
  } else {
    lead = await app.prisma.lead.create({
      data: {
        name,
        email: email || undefined,
        phone: phone || undefined,
        company: company || undefined,
        source: 'WHATSAPP',
        status: 'NEW',
        businessUnit,
        courseInterest: courseInterest || undefined,
        projectType: projectType || undefined,
        notes: `Meta WhatsApp Flow Submission (${nfmReply.name}): ${JSON.stringify(flowData)}`,
      }
    });
    app.log.info(`Created new CRM lead from WhatsApp Flow: ${lead.id}`);
  }

  // Real-time broadcast to connected CRM UI clients
  if (typeof (app as any).broadcast === 'function') {
    (app as any).broadcast('LEAD_CREATED', { lead, source: 'WHATSAPP_FLOW' });
  }
}

