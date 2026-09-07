import { FastifyInstance } from 'fastify';
import { EventBus, SystemEvents } from '../automations/event-bus';
import { getMetaAccessToken } from '../utils/meta-enrichment';
import { sendMetaCapiEvent, initMetaCapiEventListeners, autoSeedMetaCredentials } from '../services/meta-capi.service';

// Simple scoring calculation helper
function calculateScore(budget?: number, source?: string, projectType?: string, businessUnit?: string): number {
  let score = 0;
  if (businessUnit === 'ACADEMY') {
    const highValueSources = ['REFERRAL', 'ACADEMY_ALUMNI', 'META_ADS'];
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
  const highValueSources = ['REFERRAL', 'ALUMNI', 'EVENT', 'ACADEMY_ALUMNI', 'META_ADS'];
  if (source && highValueSources.includes(source)) score += 30;
  else if (source) score += 15;
  if (projectType) score += 30;
  return Math.min(score, 100);
}

/**
 * Queries Meta Graph API to fetch full lead form field responses for a given leadgen_id.
 */
async function fetchMetaLeadgenDetails(app: FastifyInstance, leadgenId: string) {
  const token = await getMetaAccessToken(app);
  if (!token) {
    app.log.warn(`[Meta Webhook] No Meta Access Token configured in database or environment. Cannot query Graph API for leadgen_id: ${leadgenId}`);
    return null;
  }

  try {
    const graphUrl = `https://graph.facebook.com/v21.0/${leadgenId}?access_token=${encodeURIComponent(token)}`;
    const res = await fetch(graphUrl);
    if (!res.ok) {
      const errText = await res.text();
      app.log.error(`[Meta Webhook] Graph API query for leadgen_id ${leadgenId} failed (${res.status}): ${errText}`);
      return null;
    }
    const data = await res.json() as any;
    app.log.info(`[Meta Webhook] Fetched Graph API details for leadgen_id ${leadgenId}: ${JSON.stringify(data)}`);
    return data;
  } catch (err: any) {
    app.log.error(`[Meta Webhook] Exception querying Graph API for leadgen_id ${leadgenId}: ${err.message}`);
    return null;
  }
}

/**
 * Extracts normalized field values (name, email, phone, company, course) from Meta field_data array.
 */
function parseMetaFieldData(fieldData: Array<{ name: string; values: string[] }>) {
  let name = '';
  let firstName = '';
  let lastName = '';
  let email = '';
  let phone = '';
  let company = '';
  let courseInterest = '';
  const customAnswers: string[] = [];

  for (const field of fieldData || []) {
    const fieldName = (field.name || '').toLowerCase();
    const val = (field.values && field.values[0]) ? field.values[0].trim() : '';
    if (!val) continue;

    if (fieldName === 'full_name' || fieldName === 'name' || fieldName === 'user_name') {
      name = val;
    } else if (fieldName === 'first_name') {
      firstName = val;
    } else if (fieldName === 'last_name') {
      lastName = val;
    } else if (fieldName.includes('email')) {
      email = val;
    } else if (fieldName.includes('phone') || fieldName.includes('mobile')) {
      phone = val;
    } else if (fieldName.includes('company') || fieldName.includes('business') || fieldName.includes('organization')) {
      company = val;
    } else if (fieldName.includes('course') || fieldName.includes('interest') || fieldName.includes('program')) {
      courseInterest = val;
    } else {
      customAnswers.push(`${field.name}: ${val}`);
    }
  }

  if (!name && (firstName || lastName)) {
    name = `${firstName} ${lastName}`.trim();
  }

  return { name, email, phone, company, courseInterest, customAnswers };
}

export default async function adsWebhookRouter(app: FastifyInstance) {
  // Initialize Meta CAPI automated event listeners & auto-seed credentials
  initMetaCapiEventListeners(app);

  // ─── META / FACEBOOK LEAD ADS WEBHOOK ──────────────────────────────────────

  // Webhook Verification Endpoint handler
  const handleMetaVerification = async (req: any, reply: any) => {
    const query = req.query as {
      'hub.mode'?: string;
      'hub.challenge'?: string;
      'hub.verify_token'?: string;
    };

    const verifyToken = process.env.META_VERIFY_TOKEN || process.env.FACEBOOK_VERIFY_TOKEN || 'grekam_verify_token';

    if (query['hub.mode'] === 'subscribe' && query['hub.verify_token'] === verifyToken) {
      console.log('[Webhook] Meta Ads webhook verified successfully.');
      return reply.code(200).send(query['hub.challenge']);
    } else {
      console.warn(`[Webhook] Meta Ads webhook verification failed. Expected '${verifyToken}', got '${query['hub.verify_token']}'`);
      return reply.code(403).send('Forbidden');
    }
  };

  app.get('/facebook', handleMetaVerification);
  app.get('/meta', handleMetaVerification);

  // Webhook Status / Config Check
  const handleMetaConfig = async () => {
    const verifyToken = process.env.META_VERIFY_TOKEN || process.env.FACEBOOK_VERIFY_TOKEN || 'grekam_verify_token';
    const hasAccessToken = Boolean(await getMetaAccessToken(app));
    return {
      status: 'active',
      verifyToken,
      hasAccessToken,
      metaGuideUrl: 'https://eventsmanager.facebook.com/events_manager2/crm_implementation_guide/1353282856878911?business_id=600210996378269',
      callbackEndpoint: '/api/v1/crm/public/webhooks/facebook',
      testingToolUrl: 'https://developers.facebook.com/tools/lead-ads-testing/',
    };
  };

  app.get('/facebook/config', handleMetaConfig);
  app.get('/meta/config', handleMetaConfig);

  // POST: Webhook Lead ingestion handler
  const handleMetaLeadIngestion = async (req: any, reply: any) => {
    const body = req.body as any;
    console.log('[Webhook] Meta Ads webhook received payload:', JSON.stringify(body));

    try {
      const entries = body.entry || [];
      const ingestedLeads: any[] = [];

      for (const entry of entries) {
        const changes = entry.changes || [];
        for (const change of changes) {
          if (change.field === 'leadgen') {
            const leadgenId = change.value?.leadgen_id;
            const formId = change.value?.form_id;
            const pageId = change.value?.page_id;
            const campaignId = change.value?.campaign_id;

            let leadName = change.value?.name;
            let leadEmail = change.value?.email;
            let leadPhone = change.value?.phone;
            let company = change.value?.company;
            let courseInterest = change.value?.courseInterest;
            let customNotes = '';

            // Query Meta Graph API if leadgen_id exists
            if (leadgenId) {
              const graphData = await fetchMetaLeadgenDetails(app, leadgenId);
              if (graphData && graphData.field_data) {
                const parsed = parseMetaFieldData(graphData.field_data);
                if (parsed.name) leadName = parsed.name;
                if (parsed.email) leadEmail = parsed.email;
                if (parsed.phone) leadPhone = parsed.phone;
                if (parsed.company) company = parsed.company;
                if (parsed.courseInterest) courseInterest = parsed.courseInterest;
                if (parsed.customAnswers.length > 0) {
                  customNotes = `Custom Form Answers:\n${parsed.customAnswers.join('\n')}`;
                }
              }
            }

            // Fallback default values for test payloads or initial test leads
            if (!leadName) leadName = `Meta Lead (${leadgenId ? leadgenId.substring(0, 6) : Date.now().toString().slice(-4)})`;
            if (!leadEmail) leadEmail = `meta_${leadgenId || Date.now()}@lead.grekam.in`;

            // Deduce business unit (can check campaign name or query parameter)
            const businessUnit = (req.query as any)?.businessUnit === 'ACADEMY' ? 'ACADEMY' : 'AGENCY';
            const score = calculateScore(undefined, 'META_ADS', undefined, businessUnit);

            const notesContent = [
              `Ingested from Meta Lead Ads (LeadGen ID: ${leadgenId || 'N/A'}, Form ID: ${formId || 'N/A'}, Page ID: ${pageId || 'N/A'})`,
              customNotes
            ].filter(Boolean).join('\n\n');

            const lead = await app.prisma.lead.create({
              data: {
                name: leadName,
                email: leadEmail,
                phone: leadPhone || undefined,
                company: company || undefined,
                source: 'META_ADS',
                businessUnit,
                score,
                notes: notesContent,
                courseInterest: courseInterest || (businessUnit === 'ACADEMY' ? 'UI/UX Masterclass' : undefined)
              }
            });

            console.log(`[Webhook] Successfully ingested Meta Lead: ${lead.name} (${lead.email}) [ID: ${lead.id}]`);
            ingestedLeads.push(lead);

            // Emit Autopilot event
            if (businessUnit === 'ACADEMY') {
              EventBus.emit(SystemEvents.ACADEMY_ENQUIRY_RECEIVED, lead);
            } else {
              EventBus.emit(SystemEvents.LEAD_CREATED, lead);
            }
          }
        }
      }

      return { success: true, count: ingestedLeads.length, leads: ingestedLeads };
    } catch (err: any) {
      console.error('[Webhook] Meta Ads webhook processing failed:', err);
      return reply.code(500).send({ error: 'Internal Server Error', message: err.message });
    }
  };

  app.post('/facebook', handleMetaLeadIngestion);
  app.post('/meta', handleMetaLeadIngestion);

  // POST: 1-Click Test Simulation Endpoint for Meta Leads
  const handleTestMetaLead = async (req: any, reply: any) => {
    const body = req.body || {};
    const testLeadGenId = body.leadgen_id || `test_meta_${Date.now()}`;
    
    const mockPayload = {
      entry: [
        {
          id: body.page_id || '600210996378269',
          time: Math.floor(Date.now() / 1000),
          changes: [
            {
              field: 'leadgen',
              value: {
                leadgen_id: testLeadGenId,
                form_id: body.form_id || '1353282856878911',
                page_id: body.page_id || '600210996378269',
                name: body.name || 'Meta Test Lead',
                email: body.email || `meta_test_${Date.now()}@example.com`,
                phone: body.phone || '+91 98765 43210',
                company: body.company || 'Meta Lead Gen Partner',
                courseInterest: body.courseInterest || 'Custom Web App Development'
              }
            }
          ]
        }
      ]
    };

    req.body = mockPayload;
    return handleMetaLeadIngestion(req, reply);
  };

  app.post('/facebook/test', handleTestMetaLead);
  app.post('/meta/test', handleTestMetaLead);

  // POST: Direct Test Meta Conversions API (CAPI) Event Dispatch
  const handleTestMetaCapi = async (req: any, reply: any) => {
    const body = req.body || {};
    const result = await sendMetaCapiEvent(app, {
      eventName: body.eventName || 'Lead',
      leadId: body.leadId || `test_${Date.now()}`,
      email: body.email || 'test_capi_lead@grekam.in',
      phone: body.phone || '+91 98765 43210',
      name: body.name || 'Test CAPI Lead',
      value: body.value || 1000,
      businessUnit: body.businessUnit || 'AGENCY',
      customData: body.customData || { test: true }
    });
    return result;
  };

  app.post('/facebook/capi/test', handleTestMetaCapi);
  app.post('/meta/capi/test', handleTestMetaCapi);



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
