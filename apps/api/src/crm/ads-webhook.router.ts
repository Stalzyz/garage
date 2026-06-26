import { FastifyInstance } from 'fastify';
import { EventBus, SystemEvents } from '../automations/event-bus';

// Simple scoring calculation helper
function calculateScore(budget?: number, source?: string, projectType?: string, businessUnit?: string): number {
  let score = 0;
  if (businessUnit === 'ACADEMY') {
    const highValueSources = ['REFERRAL', 'ACADEMY_ALUMNI'];
    if (source && highValueSources.includes(source)) score += 40;
    else if (source) score += 20;
    score += 40; // baseline
    return Math.min(score, 100);
  }
  if (budget) {
    if (budget >= 500000) score += 40;
    else if (budget >= 100000) score += 30;
    else if (budget >= 50000) score += 20;
    else score += 10;
  }
  const highValueSources = ['REFERRAL', 'ALUMNI', 'EVENT', 'ACADEMY_ALUMNI'];
  if (source && highValueSources.includes(source)) score += 30;
  else if (source) score += 15;
  if (projectType) score += 30;
  return Math.min(score, 100);
}

export default async function adsWebhookRouter(app: FastifyInstance) {

  // ─── META / FACEBOOK LEAD ADS WEBHOOK ──────────────────────────────────────

  // GET: Webhook verification (verification token check)
  app.get('/facebook', async (req, reply) => {
    const query = req.query as {
      'hub.mode'?: string;
      'hub.challenge'?: string;
      'hub.verify_token'?: string;
    };

    const verifyToken = process.env.FACEBOOK_VERIFY_TOKEN || 'grekam_verify_token';

    if (query['hub.mode'] === 'subscribe' && query['hub.verify_token'] === verifyToken) {
      console.log('[Webhook] Meta Ads webhook verified successfully.');
      return reply.code(200).send(query['hub.challenge']);
    } else {
      console.warn('[Webhook] Meta Ads webhook verification failed.');
      return reply.code(403).send('Forbidden');
    }
  });

  // POST: Webhook Lead ingestion
  app.post('/facebook', async (req, reply) => {
    const body = req.body as any;
    console.log('[Webhook] Meta Ads webhook received payload:', JSON.stringify(body));

    try {
      const entries = body.entry || [];
      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          if (change.field === 'leadgen') {
            const leadgenId = change.value.leadgen_id;
            const formId = change.value.form_id;
            const campaignId = change.value.campaign_id;

            // In production, we'd query Graph API: https://graph.facebook.com/v18.0/${leadgenId}?access_token=...
            // For now, we mock fetching the lead details using fallbacks or creating a placeholder lead.
            // If the webhook includes mocked values directly (e.g. from Facebook developer tool), we parse them.
            const leadName = change.value.name || `Meta Lead (${leadgenId.substring(0, 6)})`;
            const leadEmail = change.value.email || `meta_${leadgenId}@example.com`;
            const leadPhone = change.value.phone || '+91 99999 99999';
            
            // Deduce business unit (can check campaign name or query parameter)
            const businessUnit = (req.query as any).businessUnit === 'ACADEMY' ? 'ACADEMY' : 'AGENCY';

            const score = calculateScore(undefined, 'OTHER', undefined, businessUnit);

            const lead = await app.prisma.lead.create({
              data: {
                name: leadName,
                email: leadEmail,
                phone: leadPhone,
                source: 'OTHER', // or add a new enum value if needed
                businessUnit,
                score,
                notes: `Automatically ingested from Meta Lead Form (ID: ${formId}, Campaign: ${campaignId || 'N/A'}, LeadGen: ${leadgenId})`,
                courseInterest: businessUnit === 'ACADEMY' ? 'UI/UX Masterclass' : undefined
              }
            });

            console.log(`[Webhook] Ingested Meta lead: ${lead.name} (${lead.email}) [BU: ${businessUnit}]`);

            // Emit Autopilot event
            if (businessUnit === 'ACADEMY') {
              EventBus.emit(SystemEvents.ACADEMY_ENQUIRY_RECEIVED, lead);
            } else {
              EventBus.emit(SystemEvents.LEAD_CREATED, lead);
            }
          }
        }
      }

      return { success: true };
    } catch (err) {
      console.error('[Webhook] Meta Ads webhook processing failed:', err);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });


  // ─── GOOGLE ADS LEAD FORM WEBHOOK ──────────────────────────────────────────

  // POST: Lead form webhook ingestion
  app.post('/google', async (req, reply) => {
    const body = req.body as any;
    console.log('[Webhook] Google Ads webhook received payload:', JSON.stringify(body));

    const googleKey = process.env.GOOGLE_ADS_VERIFY_TOKEN || 'grekam_google_key';

    // Verify key
    if (body.google_key !== googleKey) {
      console.warn('[Webhook] Google Ads verification key mismatch.');
      return reply.code(403).send('Forbidden');
    }

    try {
      const userColumnData = body.user_column_data || [];
      
      let name = '';
      let email = '';
      let phone = '';
      
      // Parse fields sent by Google Ads
      for (const col of userColumnData) {
        if (col.column_id === 'FULL_NAME') name = col.string_value;
        if (col.column_id === 'EMAIL') email = col.string_value;
        if (col.column_id === 'PHONE_NUMBER') phone = col.string_value;
      }

      const leadId = body.lead_id || `google_${Date.now()}`;
      const campaignId = body.campaign_id || 'N/A';
      
      if (!name) name = `Google Lead (${leadId.substring(0, 6)})`;
      if (!email) email = `google_${leadId}@example.com`;

      // Determine business unit from campaign name or query parameter
      const businessUnit = (req.query as any).businessUnit === 'ACADEMY' ? 'ACADEMY' : 'AGENCY';
      const score = calculateScore(undefined, 'WEBSITE', undefined, businessUnit);

      const lead = await app.prisma.lead.create({
        data: {
          name,
          email,
          phone: phone || undefined,
          source: 'WEBSITE',
          businessUnit,
          score,
          notes: `Ingested from Google Ads Lead Form (Lead ID: ${leadId}, Campaign ID: ${campaignId})`,
          courseInterest: businessUnit === 'ACADEMY' ? 'Motion Design Bootcamp' : undefined
        }
      });

      console.log(`[Webhook] Ingested Google lead: ${lead.name} (${lead.email}) [BU: ${businessUnit}]`);

      // Emit Autopilot event
      if (businessUnit === 'ACADEMY') {
        EventBus.emit(SystemEvents.ACADEMY_ENQUIRY_RECEIVED, lead);
      } else {
        EventBus.emit(SystemEvents.LEAD_CREATED, lead);
      }

      return { success: true };
    } catch (err) {
      console.error('[Webhook] Google Ads webhook processing failed:', err);
      return reply.code(500).send({ error: 'Internal Server Error' });
    }
  });
}
