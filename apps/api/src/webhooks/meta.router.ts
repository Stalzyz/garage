import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

interface MetaLeadgenEvent {
  entry: Array<{
    id: string;
    time: number;
    changes: Array<{
      value: {
        form_id: string;
        leadgen_id: string;
        created_time: number;
        page_id: string;
      };
      field: string;
    }>;
  }>;
}

export default async function metaRouter(app: FastifyInstance) {
  // GET endpoint for Meta Webhook Verification
  app.get('/meta', async (req: FastifyRequest, reply: FastifyReply) => {
    const query = req.query as any;
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;

    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        // Must send back just the challenge string
        reply.type('text/plain').send(challenge);
      } else {
        reply.code(403).send('Forbidden');
      }
    } else {
      reply.code(400).send('Bad Request');
    }
  });

  // POST endpoint for receiving Lead events
  app.post('/meta', async (req: FastifyRequest, reply: FastifyReply) => {
    const body = req.body as MetaLeadgenEvent;

    // Acknowledge receipt immediately to avoid Meta retries
    reply.send({ received: true });

    if (body.entry) {
      for (const entry of body.entry) {
        if (!entry.changes) continue;
        for (const change of entry.changes) {
          if (change.field === 'leadgen') {
            const leadgenId = change.value.leadgen_id;
            const formId = change.value.form_id;
            const pageId = change.value.page_id;

            app.log.info(`Received Meta lead: ${leadgenId} from form ${formId} (page ${pageId})`);

            try {
              // Fetch lead details in the background
              await fetchAndProcessLead(app, leadgenId, formId, pageId);
            } catch (error: any) {
              app.log.error({ err: error }, `Failed to process lead ${leadgenId}`);
            }
          }
        }
      }
    }
  });
}

async function fetchAndProcessLead(app: FastifyInstance, leadgenId: string, formId: string, pageId: string) {
  const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
  if (!ACCESS_TOKEN) {
    app.log.error('META_ACCESS_TOKEN is not configured');
    return;
  }

  // Fetch lead data from Graph API
  const response = await fetch(`https://graph.facebook.com/v19.0/${leadgenId}?access_token=${ACCESS_TOKEN}`);
  const data = await response.json();

  if (data.error) {
    throw new Error(`Graph API Error: ${data.error.message}`);
  }

  // Field mapping
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
  // Using env variables for config, fallback to AGENCY
  const academyFormIds = (process.env.META_ACADEMY_FORM_IDS || '').split(',');
  const academyPageIds = (process.env.META_ACADEMY_PAGE_IDS || '').split(',');

  let businessUnit = 'AGENCY';
  if (academyFormIds.includes(formId) || academyPageIds.includes(pageId)) {
    businessUnit = 'ACADEMY';
  }

  // Save to Database
  const newLead = await app.prisma.lead.create({
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
