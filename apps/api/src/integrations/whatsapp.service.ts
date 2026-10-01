import { prisma } from '../db';
import { decrypt } from '../settings/integrations.router';

export interface WhatsAppTemplateDef {
  id: string;
  name: string;
  templateName: string;
  category: 'FINANCE' | 'CRM' | 'ACADEMY' | 'GENERAL';
  event: string;
  description: string;
  language?: string;
  variables: { name: string; label: string; placeholder: string }[];
  bodyPattern: string;
  headerType?: 'DOCUMENT' | 'IMAGE' | 'NONE';
  defaultMediaUrl?: string;
  buttons?: string[];
}

export const WHATSAPP_TEMPLATES: WhatsAppTemplateDef[] = [
  {
    id: 'grafty_welcome',
    name: 'Grafty Welcome & Inquiry Response',
    templateName: 'grafty_welcome',
    category: 'CRM',
    event: 'LEAD_CREATED',
    description: 'Welcome & introduction template without header attachment',
    headerType: 'NONE',
    variables: [
      { name: 'leadName', label: 'Lead / Client Name', placeholder: 'Stalin Kumar' },
      { name: 'serviceInterest', label: 'Service Interested', placeholder: 'Shopify / Web Development' }
    ],
    bodyPattern: 'Hi {{1}},\n\nThank you for reaching out to Grekam Visuals regarding {{2}}!\n\nOur agency team is reviewing your requirements and will connect with you shortly.\n\nPortfolio: https://dashboard.grekam.in',
    buttons: ['Call Support', 'View Portfolio']
  },
  {
    id: 'grafty_proposals',
    name: 'Grafty Proposals & Scope Breakdown',
    templateName: 'grafty_proposals',
    category: 'CRM',
    event: 'PROPOSAL_SHARED',
    description: 'Official Grafty Proposal & Quote template with PDF document header attachment',
    headerType: 'DOCUMENT',
    variables: [
      { name: 'clientName', label: 'Client / Lead Name', placeholder: 'Stalin Kumar' },
      { name: 'projectName', label: 'Project Name', placeholder: 'Custom E-Commerce Platform' },
      { name: 'amount', label: 'Proposal Value', placeholder: '₹75,000.00' }
    ],
    bodyPattern: 'Hi {{1}},\n\nWe have prepared the proposal for your project *{{2}}* valued at {{3}}.\n\nPlease review the proposal document attached above and let us know your thoughts!',
    buttons: ['Review Proposal']
  },
  {
    id: 'invoice_generated_v1',
    name: 'Tax Invoice Notification',
    templateName: 'invoice_generated_v1',
    category: 'FINANCE',
    event: 'INVOICE_GENERATED',
    description: 'Send tax invoice notification to client with invoice number & total amount',
    headerType: 'DOCUMENT',
    variables: [
      { name: 'clientName', label: 'Client Name', placeholder: 'Stalin Kumar' },
      { name: 'invoiceNumber', label: 'Invoice Number', placeholder: 'INV-839210' },
      { name: 'totalAmount', label: 'Total Amount', placeholder: '₹25,000.00' }
    ],
    bodyPattern: 'Hello {{1}},\n\nYour tax invoice #{{2}} for {{3}} has been generated and is ready for payment.\n\nThank you for choosing Grekam Visuals!',
    buttons: ['View Invoice', 'Pay Online']
  },
  {
    id: 'lead_welcome_v1',
    name: 'New Lead Welcome & Introduction',
    templateName: 'lead_welcome_v1',
    category: 'CRM',
    event: 'LEAD_CREATED',
    description: 'Welcome new lead inquiry and share company portfolio link',
    headerType: 'NONE',
    variables: [
      { name: 'leadName', label: 'Lead Name', placeholder: 'Stalin Kumar' },
      { name: 'serviceInterest', label: 'Service / Requirement', placeholder: 'Next.js App & AI Bot' }
    ],
    bodyPattern: 'Hi {{1}},\n\nThank you for reaching out to Grekam Visuals regarding {{2}}!\n\nOur agency team is reviewing your requirements and will connect with you shortly.\n\nExplore our portfolio: https://dashboard.grekam.in',
    buttons: ['Call Support', 'View Portfolio']
  },
  {
    id: 'proposal_sent_v1',
    name: 'Project Proposal & Quote Shared',
    templateName: 'proposal_sent_v1',
    category: 'CRM',
    event: 'PROPOSAL_SHARED',
    description: 'Notify lead about new project proposal and scope breakdown',
    headerType: 'DOCUMENT',
    variables: [
      { name: 'clientName', label: 'Client / Lead Name', placeholder: 'Stalin Kumar' },
      { name: 'projectName', label: 'Project Name', placeholder: 'Custom E-Commerce Platform' },
      { name: 'amount', label: 'Proposal Value', placeholder: '₹75,000.00' }
    ],
    bodyPattern: 'Hi {{1}},\n\nWe have prepared the proposal for your project *{{2}}* valued at {{3}}.\n\nPlease review it at your convenience and let us know your feedback!',
    buttons: ['Review Proposal']
  },
  {
    id: 'payment_reminder_v1',
    name: 'Payment Due Reminder',
    templateName: 'payment_reminder_v1',
    category: 'FINANCE',
    event: 'PAYMENT_REMINDER',
    description: 'Send payment reminder for pending invoices before due date',
    headerType: 'NONE',
    variables: [
      { name: 'clientName', label: 'Client Name', placeholder: 'Stalin Kumar' },
      { name: 'invoiceNumber', label: 'Invoice Number', placeholder: 'INV-839210' },
      { name: 'amount', label: 'Due Amount', placeholder: '₹25,000.00' },
      { name: 'dueDate', label: 'Due Date', placeholder: '25 Sep 2026' }
    ],
    bodyPattern: 'Hi {{1}},\n\nThis is a friendly reminder that invoice #{{2}} for {{3}} is due on {{4}}.\n\nPlease click below to complete the payment seamlessly.',
    buttons: ['Pay Invoice']
  },
  {
    id: 'walkin_welcome_v1',
    name: 'Academy Walk-In Welcome',
    templateName: 'walkin_welcome_v1',
    category: 'ACADEMY',
    event: 'WALKIN_REGISTERED',
    description: 'Greet new walk-in student visiting Grekam Academy',
    headerType: 'NONE',
    variables: [
      { name: 'studentName', label: 'Student Name', placeholder: 'Alex Martin' },
      { name: 'courseName', label: 'Course Interest', placeholder: 'Fullstack & AI Bootcamp' }
    ],
    bodyPattern: 'Welcome {{1}} to Grekam Academy!\n\nThank you for visiting our campus today to inquire about {{2}}.\n\nOur counselor will guide you through the syllabus & lab facilities.',
    buttons: ['Contact Counselor']
  },
  {
    id: 'partner_grafty_call_followup',
    name: 'Partner Grafty Call Follow-Up',
    templateName: 'partner_grafty_call_followup',
    category: 'CRM',
    event: 'CRM_LEAD_FOLLOWUP',
    description: 'Post-call follow-up message to prospect after telecaller phone contact',
    headerType: 'NONE',
    variables: [
      { name: 'leadName', label: 'Lead / Client Name', placeholder: 'Stalin Kumar' },
      { name: 'callbackTime', label: 'Follow-Up / Next Step', placeholder: 'Tomorrow at 10 AM' }
    ],
    bodyPattern: 'Hi {{1}},\n\nThank you for taking our call today!\n\nAs discussed, our team will follow up with you regarding {{2}}.\n\nWebsite: https://agency.grekam.in',
    buttons: []
  }
];

/**
 * Words that mark a BSP/Grafty payload as a delivery failure rather than a success blurb.
 * Used so a friendly "message queued" string is never mistaken for an error.
 */
const GRAFTY_FAILURE_WORDS =
  /(reject|fail|error|invalid|not\s+exist|unsupport|expire|block|authoriz|forbidden|quota|exceed|not\s+found|undeliver|unreach|denied)/i;

const GRAFTY_SUCCESS_STATES = ['success', 'sent', 'accepted', 'queued', 'delivered', 'ok', 'submitted'];
const GRAFTY_FAILURE_STATES = ['failed', 'failure', 'error', 'rejected', 'undeliverable', 'invalid', 'denied', 'blocked'];

/** Pull a human-readable failure reason out of a loosely-shaped BSP payload. */
function extractProviderError(obj: any): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;

  const hard = obj.error ?? obj.errors ?? obj.details;
  if (hard !== undefined && hard !== null && hard !== '') {
    if (typeof hard === 'string') return hard;
    if (Array.isArray(hard)) {
      const parts = hard
        .map((e: any) => (typeof e === 'string' ? e : e?.message || e?.details || JSON.stringify(e)))
        .filter(Boolean);
      if (parts.length) return parts.join('; ');
    } else if (typeof hard === 'object') {
      return hard.message || hard.details || hard.reason || JSON.stringify(hard);
    } else {
      return String(hard);
    }
  }

  // `message`/`reason` are ambiguous (a BSP may say "Message sent"), so only trust them
  // when they actually contain failure wording.
  const soft = obj.message ?? obj.reason;
  if (typeof soft === 'string' && GRAFTY_FAILURE_WORDS.test(soft)) return soft;

  return undefined;
}

function extractMessageId(obj: any): string | undefined {
  if (!obj || typeof obj !== 'object') return undefined;
  const id =
    obj.messageId ?? obj.message_id ?? obj.wamid ?? obj.wamidId ?? obj.wa_message_id ??
    obj.id ?? obj.messageID ?? obj.data?.id ?? obj.data?.messageId;
  return typeof id === 'string' && id.length > 0 ? id : undefined;
}

export interface ProviderVerdict {
  ok: boolean;
  /** True only when the payload carried an explicit positive signal. */
  confirmed: boolean;
  error?: string;
  messageId?: string;
}

/**
 * Inspect a provider response body to decide whether the message was really accepted.
 *
 * WHY THIS EXISTS: Grafty is a BSP/aggregator that relays to the Meta Cloud API. A HTTP 200
 * from Grafty does NOT mean Meta accepted the message — Grafty can return 200 with a body that
 * reports a Meta rejection (e.g. #132001 "template name does not exist"). Previously we trusted
 * `res.ok` alone, which reported those as delivered.
 *
 * Policy:
 *  - explicit negative signal  -> failure (never claim "sent")
 *  - explicit positive signal  -> success, `confirmed: true`
 *  - nothing conclusive either way -> allowed through, but `confirmed: false` so the UI can
 *    say "submitted, awaiting confirmation" instead of asserting delivery.
 */
export function inspectProviderBody(body: any): ProviderVerdict {
  if (!body || typeof body !== 'object') {
    // Unparseable/empty body: no proof of failure, but also no proof of delivery.
    return { ok: true, confirmed: false };
  }

  const scopes = [body, body.data, body.result, body.response, body.message].filter(
    (v: any) => v && typeof v === 'object'
  );

  // 1. Explicit `success` boolean wins over everything else.
  for (const scope of scopes) {
    if (typeof scope.success === 'boolean') {
      if (!scope.success) {
        return {
          ok: false,
          confirmed: false,
          error: extractProviderError(scope) || extractProviderError(body) || 'Provider reported success=false',
        };
      }
      return { ok: true, confirmed: true, messageId: extractMessageId(scope) || extractMessageId(body) };
    }
  }

  // 2. Explicit status/state string.
  for (const scope of [body, ...scopes]) {
    const state = scope.status ?? scope.state;
    if (typeof state === 'string') {
      const low = state.toLowerCase();
      if (GRAFTY_FAILURE_STATES.includes(low)) {
        return {
          ok: false,
          confirmed: false,
          error: extractProviderError(scope) || extractProviderError(body) || `Provider status "${state}"`,
        };
      }
      if (GRAFTY_SUCCESS_STATES.includes(low)) {
        return { ok: true, confirmed: true, messageId: extractMessageId(scope) || extractMessageId(body) };
      }
    }
  }

  // 3. An error-shaped payload with no success marker is a failure.
  const err = extractProviderError(body) || (scopes.length ? extractProviderError(scopes[0]) : undefined);
  if (err) return { ok: false, confirmed: false, error: err };

  // 4. Inconclusive — pass through but flag as unconfirmed.
  return { ok: true, confirmed: false, messageId: extractMessageId(body) };
}

export class WhatsAppService {
  async getCredentials() {
    const keys = await prisma.integrationKey.findMany({
      where: { service: { in: ['WHATSAPP', 'META'] }, isActive: true }
    });

    // Grafty credentials
    let graftyUrl = process.env.GRAFTY_API_URL || 'https://grafty.pro';
    let graftyKey = process.env.GRAFTY_API_KEY || '';
    let graftyInstanceId = process.env.GRAFTY_INSTANCE_ID || '';

    // Meta Direct Cloud API credentials
    let metaToken = process.env.META_ACCESS_TOKEN || '';
    let metaPhoneNumberId = process.env.META_PHONE_NUMBER_ID || '';
    let metaWabaId = process.env.META_WABA_ID || '';

    for (const k of keys) {
      if (k.keyName === 'GRAFTY_API_KEY') graftyKey = decrypt(k.encryptedValue);
      if (k.keyName === 'GRAFTY_API_URL') graftyUrl = decrypt(k.encryptedValue);
      if (k.keyName === 'GRAFTY_INSTANCE_ID') graftyInstanceId = decrypt(k.encryptedValue);
      if (k.keyName === 'META_ACCESS_TOKEN') metaToken = decrypt(k.encryptedValue);
      if (k.keyName === 'META_PHONE_NUMBER_ID') metaPhoneNumberId = decrypt(k.encryptedValue);
      if (k.keyName === 'META_WABA_ID') metaWabaId = decrypt(k.encryptedValue);
    }

    return { graftyUrl, graftyKey, graftyInstanceId, metaToken, metaPhoneNumberId, metaWabaId };
  }

  /**
   * Test Meta Cloud API connection — returns WABA info if valid token
   */
  async testMetaConnection() {
    const { metaToken, metaPhoneNumberId, metaWabaId } = await this.getCredentials();

    if (!metaToken) {
      return { connected: false, error: 'META_ACCESS_TOKEN not configured in Settings → Integrations → META' };
    }

    try {
      // Test token validity by fetching user info
      const meRes = await fetch(
        `https://graph.facebook.com/v19.0/me?access_token=${metaToken}`
      );
      const meData = await meRes.json();

      if (meData.error) {
        return {
          connected: false,
          error: `Meta API token error: ${meData.error.message} (Code: ${meData.error.code})`,
          details: meData.error
        };
      }

      // Try to get WABA info if phone number ID is set
      let wabaInfo: any = null;
      if (metaPhoneNumberId) {
        const phoneRes = await fetch(
          `https://graph.facebook.com/v19.0/${metaPhoneNumberId}?fields=display_phone_number,verified_name,quality_rating,platform_type&access_token=${metaToken}`
        );
        const phoneData = await phoneRes.json();
        if (!phoneData.error) wabaInfo = phoneData;
      }

      return {
        connected: true,
        account: meData,
        phoneInfo: wabaInfo,
        phoneNumberId: metaPhoneNumberId || 'Not configured (add META_PHONE_NUMBER_ID)',
        wabaId: metaWabaId || 'Not configured (add META_WABA_ID)'
      };
    } catch (err: any) {
      return { connected: false, error: `Network error: ${err.message}` };
    }
  }

  /**
   * Test Grafty API connection
   */
  async testGraftyConnection() {
    const { graftyUrl, graftyKey } = await this.getCredentials();

    if (!graftyKey) {
      return { connected: false, error: 'GRAFTY_API_KEY not configured in Settings → Integrations → WHATSAPP' };
    }

    try {
      const endpoints = [`${graftyUrl}/api/v1/templates`, `${graftyUrl}/api/templates`];
      let res: Response | null = null;
      for (const ep of endpoints) {
        try {
          res = await fetch(ep, {
            headers: { 'Authorization': `Bearer ${graftyKey}`, 'x-api-key': graftyKey }
          });
          if (res.ok) break;
        } catch (e) {
          res = null;
        }
      }

      if (!res) return { connected: false, error: 'Cannot reach Grafty API at ' + graftyUrl };
      if (res.status === 401) return { connected: false, error: 'Invalid GRAFTY_API_KEY — check Settings → WHATSAPP' };
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.data || []);
        return { connected: true, templates: items.length, url: graftyUrl };
      }
      return { connected: false, error: `Grafty responded with status ${res.status}` };
    } catch (err: any) {
      return { connected: false, error: `Network error: ${err.message}` };
    }
  }

  /**
   * Fetch templates — from Meta Cloud API first, then Grafty fallback, then built-in defaults
   */
  async getTemplates() {
    const { graftyUrl, graftyKey, metaToken, metaWabaId } = await this.getCredentials();
    let cloudTemplates: WhatsAppTemplateDef[] = [];

    // 1. Direct Meta Graph API Template Fetch (Official WABA Meta Templates)
    if (metaToken && metaWabaId) {
      try {
        // Direct WABA template fetch using WABA ID
        const res = await fetch(
          `https://graph.facebook.com/v19.0/${metaWabaId}/message_templates?fields=id,name,status,category,language,components&limit=100&access_token=${metaToken}`
        ).catch(() => null);

        if (res && res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.data)) {
            for (const t of data.data) {
              if (t.status === 'APPROVED') {
                const bodyComp = (t.components || []).find((c: any) => c.type === 'BODY');
                const headerComp = (t.components || []).find((c: any) => c.type === 'HEADER');
                const defaultMedia = headerComp?.example?.header_handle?.[0] || '';
                const bodyText = bodyComp?.text || '';
                const varMatches = bodyText.match(/\{\{\d+\}\}/g) || [];
                const vars = varMatches.map((_: string, idx: number) => ({
                  name: `param_${idx + 1}`,
                  label: `Parameter ${idx + 1}`,
                  placeholder: `Value ${idx + 1}`
                }));
                cloudTemplates.push({
                  id: t.id || t.name,
                  name: t.name ? t.name.replace(/_/g, ' ').toUpperCase() : 'Meta Template',
                  templateName: t.name,
                  category: (t.category || 'GENERAL') as any,
                  event: 'META_CLOUD_TEMPLATE',
                  description: `Meta Cloud Template (${t.language || 'en'}) — ${t.status}`,
                  variables: vars,
                  bodyPattern: bodyText,
                  headerType: headerComp?.format === 'TEXT' ? 'NONE' : (headerComp?.format || 'NONE'),
                  defaultMediaUrl: defaultMedia,
                  buttons: []
                });
              }
            }
          }
        }
      } catch (err) {
        console.warn('[Meta Graph API] Template fetch error:', err);
      }
    } else if (metaToken && !metaWabaId) {
      // Fallback: fetch via /me if no WABA ID set
      try {
        const res = await fetch(
          `https://graph.facebook.com/v19.0/me/whatsapp_business_accounts?fields=id,name,message_templates{id,name,status,category,language,components}&access_token=${metaToken}`
        ).catch(() => null);

        if (res && res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.data)) {
            for (const waba of data.data) {
              if (waba.message_templates?.data) {
                for (const t of waba.message_templates.data) {
                  if (t.status === 'APPROVED' || !t.status) {
                    const bodyComp = (t.components || []).find((c: any) => c.type === 'BODY');
                    const headerComp = (t.components || []).find((c: any) => c.type === 'HEADER');
                    const defaultMedia = headerComp?.example?.header_handle?.[0] || '';
                    const bodyText = bodyComp?.text || '{{1}}';
                    const varMatches = bodyText.match(/\{\{\d+\}\}/g) || [];
                    const vars = varMatches.map((_: string, idx: number) => ({
                      name: `param_${idx + 1}`,
                      label: `Parameter ${idx + 1}`,
                      placeholder: `Value ${idx + 1}`
                    }));
                    cloudTemplates.push({
                      id: t.id || t.name,
                      name: t.name ? t.name.replace(/_/g, ' ').toUpperCase() : 'Meta Cloud Template',
                      templateName: t.name,
                      category: (t.category || 'CRM') as any,
                      event: 'META_CLOUD_TEMPLATE',
                      description: `Meta Cloud Template (${t.language || 'en'}) — ${t.status || 'APPROVED'}`,
                      variables: vars,
                      bodyPattern: bodyText,
                      headerType: headerComp?.format || 'NONE',
                      defaultMediaUrl: defaultMedia,
                      buttons: []
                    });
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.warn('[Meta Graph API] Message templates fetch notice:', err);
      }
    }

    // 2. Grafty Engine Template Fetch (Grafty Workspace Templates)
    if (graftyUrl && graftyKey) {
      try {
        const endpoints = [`${graftyUrl}/api/v1/templates`, `${graftyUrl}/api/templates`];
        let res: Response | null = null;
        for (const ep of endpoints) {
          try {
            res = await fetch(ep, {
              headers: { 'Authorization': `Bearer ${graftyKey}`, 'x-api-key': graftyKey }
            });
            if (res.ok) break;
          } catch (e) {
            res = null;
          }
        }

        if (res && res.ok) {
          const raw = await res.json();
          const items = Array.isArray(raw) ? raw : (raw.data || []);
          items.forEach((t: any) => {
            if (t.status === 'APPROVED' || !t.status) {
              const bodyComp = (t.components || []).find((c: any) => c.type === 'BODY');
              const headerComp = (t.components || []).find((c: any) => c.type === 'HEADER');
              const defaultMedia = headerComp?.example?.header_handle?.[0] || headerComp?.media_url || t.mediaUrl || t.media_url || '';
              const bodyText = bodyComp?.text || t.body || t.bodyPattern || '';
              const varMatches = bodyText.match(/\{\{\d+\}\}/g) || [];
              const vars = (t.variables && t.variables.length > 0)
                ? t.variables.map((v: any, idx: number) => ({
                    name: typeof v === 'string' ? v : (v.name || `param_${idx + 1}`),
                    label: typeof v === 'string' ? v : (v.label || `Parameter ${idx + 1}`),
                    placeholder: typeof v === 'string' ? v : (v.placeholder || `Value ${idx + 1}`)
                  }))
                : varMatches.map((_: string, idx: number) => ({
                    name: `param_${idx + 1}`,
                    label: `Parameter ${idx + 1}`,
                    placeholder: `Value ${idx + 1}`
                  }));

              cloudTemplates.push({
                id: t.id || t.name,
                name: t.name ? t.name.replace(/_/g, ' ').toUpperCase() : 'Grafty Workspace Template',
                templateName: t.name || t.id,
                category: (t.category || 'CRM') as any,
                event: t.event || 'GRAFTY_TEMPLATE',
                language: t.language || 'en_US',
                description: t.description || `Grafty Meta Cloud Template (${t.language || 'en_US'}) — ${t.status || 'APPROVED'}`,
                variables: vars,
                bodyPattern: bodyText,
                headerType: headerComp?.format || t.headerType || 'NONE',
                defaultMediaUrl: defaultMedia,
                buttons: (t.buttons || []).map((b: any) => typeof b === 'string' ? b : (b.text || b.url || 'Action'))
              });
            }
          });
        }
      } catch (err) {
        console.warn('[Grafty] Workspace template fetch notice:', err);
      }
    }

    // Merge: cloud templates WIN over local built-ins (cloud has actual Meta-approved param count).
    // Local built-ins only fill in for templates not found on the cloud.
    const cloudNames = new Set(cloudTemplates.map(t => t.templateName));
    const localOnlyTemplates = WHATSAPP_TEMPLATES.filter(t => !cloudNames.has(t.templateName));
    return [...cloudTemplates, ...localOnlyTemplates];
  }

  /**
   * Send a WhatsApp template message.
   * 
   * Priority:
   * 1. Meta Cloud API directly (if META_ACCESS_TOKEN + META_PHONE_NUMBER_ID configured)
   * 2. Grafty API (if GRAFTY_API_KEY configured)
   * 3. Log as CRM entry + return graceful response
   */
  async sendTemplateMessage({
    phone,
    name,
    event,
    templateName,
    variables,
    buttonVariables = [],
    language = 'en',
    headerType,
    mediaUrl,
    filename,
    provider = 'auto',
  }: {
    phone: string;
    name: string;
    event: string;
    templateName: string;
    variables: string[];
    buttonVariables?: string[];
    language?: string;
    headerType?: 'IMAGE' | 'DOCUMENT' | 'VIDEO' | 'LOCATION' | 'NONE' | string;
    mediaUrl?: string;
    filename?: string;
    provider?: 'auto' | 'grafty' | 'meta';
  }) {
    const { graftyUrl, graftyKey, graftyInstanceId, metaToken, metaPhoneNumberId } = await this.getCredentials();
    let cleanPhone = phone.replace(/[^0-9]/g, '');
    // Standardize 10-digit numbers to E.164 (defaulting to India country code +91)
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone;
    }

    // Auto-detect matching template language and schema from synced template list
    let targetLanguage = language || 'en_US';
    let matchedTpl: WhatsAppTemplateDef | undefined = undefined;
    const norm = (s?: string) => (s || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    try {
      const allTemplates = await this.getTemplates();
      matchedTpl = allTemplates.find(t => norm(t.templateName) === norm(templateName) || norm(t.id) === norm(templateName));
      if (matchedTpl && matchedTpl.language) {
        targetLanguage = matchedTpl.language;
      } else if (matchedTpl && matchedTpl.description) {
        const langMatch = matchedTpl.description.match(/\b(en_US|en_GB|en|hi|ta|te|kn|ml|es|pt)\b/i);
        if (langMatch) targetLanguage = langMatch[1];
      }
    } catch (e) {}

    // Resolve strict header type from matched template definition.
    // Guard: headerType may be undefined from either matchedTpl or caller, so coerce safely.
    const rawHeaderType = matchedTpl?.headerType ?? headerType ?? 'NONE';
    let effectiveHeaderType = (typeof rawHeaderType === 'string' ? rawHeaderType : 'NONE').toUpperCase();

    // Auto-detect header type from mediaUrl if matched template didn't specify
    if (mediaUrl && effectiveHeaderType === 'NONE') {
      const lower = mediaUrl.toLowerCase();
      if (/\.(jpg|jpeg|png|webp|gif)($|\?)/.test(lower)) effectiveHeaderType = 'IMAGE';
      else if (/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|zip)($|\?)/.test(lower)) effectiveHeaderType = 'DOCUMENT';
      else if (/\.(mp4|mov|avi|mkv)($|\?)/.test(lower)) effectiveHeaderType = 'VIDEO';
    }

const KNOWN_TEMPLATE_MEDIA: Record<string, string> = {
  shopify_to_ecommerce: 'https://dashboard.grekam.in/og-image.png',
  grafty_common_template_all_industries: 'https://dashboard.grekam.in/og-image.png',
  grafty_for_shopify: 'https://dashboard.grekam.in/og-image.png',
  ecommerce_webdevelopment: 'https://dashboard.grekam.in/og-image.png',
  grafty_partnership_intro: 'https://dashboard.grekam.in/og-image.png',
  ecommerce_start: 'https://dashboard.grekam.in/og-image.png'
};

    // Build components array for Meta Cloud API & Grafty
    const templateComponents: any[] = [];

    const sanitizedName = templateName.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');

    // Resolve effective media URL:
    // If the caller provided a mediaUrl, use it (rewriting any internal localhost:4000 to public https://agency.grekam.in domain).
    // If the template requires an IMAGE, DOCUMENT, or VIDEO header and no mediaUrl was supplied,
    // automatically fall back to the template's approved defaultMediaUrl (e.g. Meta sample image header_handle)!
    let resolvedMediaUrl = mediaUrl ? mediaUrl.trim() : '';
    if (resolvedMediaUrl.includes('localhost:4000') || resolvedMediaUrl.includes('127.0.0.1:4000')) {
      resolvedMediaUrl = resolvedMediaUrl.replace(/https?:\/\/(localhost|127\.0\.0\.1):4000/g, 'https://dashboard.grekam.in');
    }

    const knownMedia = KNOWN_TEMPLATE_MEDIA[templateName] || KNOWN_TEMPLATE_MEDIA[sanitizedName] || '';
    const activeMediaUrl = (resolvedMediaUrl)
      ? resolvedMediaUrl
      : (['IMAGE', 'DOCUMENT', 'VIDEO'].includes(effectiveHeaderType) ? (matchedTpl?.defaultMediaUrl || knownMedia || '') : '');

    // 1. Add Header Component if media URL is provided and header type requires media
    if (activeMediaUrl && ['IMAGE', 'DOCUMENT', 'VIDEO'].includes(effectiveHeaderType)) {
      if (effectiveHeaderType === 'IMAGE') {
        templateComponents.push({
          type: 'header',
          parameters: [
            {
              type: 'image',
              image: { link: activeMediaUrl }
            }
          ]
        });
      } else if (effectiveHeaderType === 'DOCUMENT') {
        const docName = filename || activeMediaUrl.split('/').pop()?.split('?')[0] || 'Attachment.pdf';
        templateComponents.push({
          type: 'header',
          parameters: [
            {
              type: 'document',
              document: {
                link: activeMediaUrl,
                filename: docName
              }
            }
          ]
        });
      } else if (effectiveHeaderType === 'VIDEO') {
        templateComponents.push({
          type: 'header',
          parameters: [
            {
              type: 'video',
              video: { link: activeMediaUrl }
            }
          ]
        });
      }
    }

    // 2. Count expected body variables for this template
    let expectedVarCount = 0;
    if (matchedTpl) {
      if (matchedTpl.variables && matchedTpl.variables.length > 0) {
        expectedVarCount = matchedTpl.variables.length;
      } else if (matchedTpl.bodyPattern) {
        const matches = matchedTpl.bodyPattern.match(/\{\{\d+\}\}/g);
        expectedVarCount = matches ? matches.length : 0;
      }
    } else {
      expectedVarCount = variables ? variables.length : 0;
    }

    // 3. Prepare activeVars and auto-pad if caller provided fewer parameters than expected
    let activeVars = variables ? [...variables] : [];
    // Always enforce the exact parameter count if a template definition was found, even if it's 0.
    if (matchedTpl !== undefined || expectedVarCount > 0) {
      while (activeVars.length < expectedVarCount) {
        activeVars.push(activeVars.length === 0 ? (name || 'Client') : 'Details');
      }
      activeVars = activeVars.slice(0, expectedVarCount);
    }

    // 4. Add Body Component using the padded activeVars (do NOT re-declare — already computed above)
    if (activeVars.length > 0) {
      templateComponents.push({
        type: 'body',
        parameters: activeVars.map(v => ({ type: 'text', text: String(v || '') }))
      });
    }

    let sendResult: {
      success: boolean;
      provider: string;
      data?: any;
      error?: string;
      /** True only when the provider payload explicitly confirmed acceptance. */
      confirmed?: boolean;
      messageId?: string;
    } = {
      success: false,
      provider: 'none',
      error: 'No messaging provider configured'
    };

    // Which template was ACTUALLY accepted, and whether we had to substitute a fallback.
    // Without these the audit trail would claim the requested template was delivered.
    let deliveredTemplate: string | undefined;
    let usedFallback = false;

    const isAuto = (provider as string) === 'auto';
    const tryMeta = (isAuto || provider === 'meta') && Boolean(metaToken && metaPhoneNumberId);
    // tryGrafty is evaluated after Meta runs — re-checked at the Grafty block.
    // Declared here for the case where Meta is not configured at all.
    const canTryGrafty = (isAuto || provider === 'grafty') && !!graftyKey;
    let metaFailedWith132001 = false; // template doesn't exist in Meta WABA

    // List of candidate template names to try.
    // If the requested template name gets #132001 (template/translation missing), #132000 (param count mismatch),
    // or #132012 (parameter format mismatch), we fall back to an approved verified template
    // (grafty_proposals if media is attached, or grafty_welcome for text).
    //
    // The fallback is NO LONGER SILENT: when it is used we report the template that was actually
    // delivered, flag `usedFallback`, and the UI surfaces the substitution. Set
    // WHATSAPP_TEMPLATE_FALLBACK=false to disable substitution entirely and have the original
    // #132001/#132012 error surface to the operator untouched.
    const verifiedFallback = (activeMediaUrl || effectiveHeaderType === 'DOCUMENT' || effectiveHeaderType === 'IMAGE')
      ? 'grafty_proposals'
      : 'grafty_welcome';

    const fallbackEnabled =
      String(process.env.WHATSAPP_TEMPLATE_FALLBACK ?? 'true').toLowerCase() !== 'false';

    const templateNamesToTry = fallbackEnabled
      ? Array.from(new Set([templateName, sanitizedName, verifiedFallback]))
      : Array.from(new Set([templateName, sanitizedName]));

    // ===== METHOD 1: Meta Cloud API Direct (Official) =====
    if (tryMeta) {
      console.log(`[WhatsApp] Sending via Meta Cloud API — Phone Number ID: ${metaPhoneNumberId}, To: ${cleanPhone}, Template: ${templateName}, Media: ${mediaUrl || 'None'}`);
      try {
        let metaRes: Response | null = null;
        let metaData: any = null;

        for (const tName of templateNamesToTry) {
          const isFallback = (tName === 'grafty_welcome' || tName === 'grafty_proposals') && tName !== templateName;
          let tLang = targetLanguage;
          let tComps = templateComponents;

          if (isFallback) {
            tLang = 'en_US';
            if (tName === 'grafty_welcome') {
              tComps = [{
                type: 'body',
                parameters: [
                  { type: 'text', text: String(activeVars[0] || name || 'Client') },
                  { type: 'text', text: String(activeVars[1] || 'Inquiry') }
                ]
              }];
            } else if (tName === 'grafty_proposals') {
              tComps = [
                {
                  type: 'header',
                  parameters: [{
                    type: 'document',
                    document: {
                      link: activeMediaUrl || 'https://dashboard.grekam.in/sample.pdf',
                      filename: filename || 'Proposal.pdf'
                    }
                  }]
                },
                {
                  type: 'body',
                  parameters: [
                    { type: 'text', text: String(activeVars[0] || name || 'Client') },
                    { type: 'text', text: String(activeVars[1] || 'Project Proposal') },
                    { type: 'text', text: String(activeVars[2] || 'Details') }
                  ]
                }
              ];
            }
          }

          const altLang = tLang === 'en_US' ? 'en' : 'en_US';
          const metaCandidates: { desc: string; lang: string; comps: any[] }[] = [
            { desc: `Full components (${tLang})`, lang: tLang, comps: tComps },
            { desc: `Full components (${altLang})`, lang: altLang, comps: tComps },
          ];
          
          if (!isFallback) {
            metaCandidates.push(
              { desc: `Body-only components (${tLang})`, lang: tLang, comps: tComps.filter((c: any) => c.type !== 'header') },
              { desc: `Body-only components (${altLang})`, lang: altLang, comps: tComps.filter((c: any) => c.type !== 'header') }
            );
          }

          for (const cand of metaCandidates) {
            const payload = {
              messaging_product: 'whatsapp',
              recipient_type: 'individual',
              to: cleanPhone,
              type: 'template',
              template: {
                name: tName,
                language: { code: cand.lang },
                components: cand.comps
              }
            };

            const r = await fetch(
              `https://graph.facebook.com/v19.0/${metaPhoneNumberId}/messages`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${metaToken}` },
                body: JSON.stringify(payload),
              }
            );
            const d = await r.json();
            metaRes = r;
            metaData = d;

            if (r.ok && d.messages) {
              console.log(`[WhatsApp] Meta Cloud API template send succeeded using template "${tName}" and candidate: ${cand.desc}`);
              deliveredTemplate = tName;
              usedFallback = isFallback;
              metaFailedWith132001 = false;
              break;
            }

            const errSub = d?.error?.error_subcode ?? d?.error?.code;
            const errCode = d?.error?.code;
            const errMsg = d?.error?.message || '';

            const errMsg132001 =
              errSub === 132001 ||
              errCode === 132001 ||
              String(errMsg).includes('132001') ||
              String(errMsg).toLowerCase().includes('does not exist in the translation') ||
              String(errMsg).toLowerCase().includes('template name does not exist');

            if (errMsg132001) {
              metaFailedWith132001 = true;
              console.warn(`[WhatsApp] Meta: template "${tName}" not found in WABA (#132001) — trying next candidate.`);
              break;
            }

            const isRetryableError =
              errSub === 132012 ||
              errSub === 132000 ||
              errCode === 132012 ||
              errCode === 132000 ||
              String(errMsg).includes('132012') ||
              String(errMsg).includes('132000') ||
              String(d?.error?.error_data || '').toLowerCase().includes('parameter format does not match');

            if (!isRetryableError) break;
          }

          if (metaRes && metaRes.ok && metaData?.messages) break;
        }

        if (metaRes && metaRes.ok && metaData?.messages) {
          // A wamid only means Meta ACCEPTED the message for delivery. It is not a delivery
          // receipt — flag it as accepted so callers never assert "delivered" from this alone.
          sendResult = {
            success: true,
            provider: 'meta_cloud_api',
            data: metaData,
            confirmed: false,
            messageId: metaData?.messages?.[0]?.id,
          };
        } else {
          const errObj = metaData?.error || {};
          const code = errObj.code || metaRes?.status;
          const subcode = errObj.error_subcode;
          const rawMsg = errObj.message || `Meta API returned status ${metaRes?.status}`;

          let diagnosticMsg = rawMsg;
          if (code === 190) {
            diagnosticMsg = `Meta Access Token Expired (Code 190): Your META_ACCESS_TOKEN has expired. In Meta Business Suite → System Users, generate a permanent System User Token with 'whatsapp_business_messaging' and 'whatsapp_business_management' permissions, then update Settings → Integrations → META.`;
          } else if (code === 131030 || subcode === 131030 || rawMsg.includes('131030') || rawMsg.toLowerCase().includes('not in allowed list')) {
            diagnosticMsg = `Meta Development Mode Restriction (#131030): Your Meta App is in Development mode, which restricts outbound messages to pre-approved test numbers only. Switch your Meta App to 'Live' mode in developers.facebook.com, or add recipient ${cleanPhone} to WhatsApp → API Setup → Manage phone number list.`;
          } else if (code === 131047 || subcode === 131047 || rawMsg.includes('131047') || rawMsg.toLowerCase().includes('24 hours') || rawMsg.toLowerCase().includes('re-engagement')) {
            diagnosticMsg = `24-Hour Customer Window Expired (#131047): More than 24 hours have passed since the client last messaged. You must send an approved template with matching variables.`;
          } else if (code === 100 && (rawMsg.includes('recipient_type') || rawMsg.includes('Invalid parameter'))) {
            diagnosticMsg = `Meta Parameter Mismatch (Code 100): Invalid parameter or Phone Number ID. Check Settings → Integrations → META to verify that META_PHONE_NUMBER_ID contains the 15-digit Phone Number ID (from WhatsApp → API Setup), NOT the WABA ID or App ID.`;
          } else if (rawMsg.toLowerCase().includes('payment') || rawMsg.toLowerCase().includes('billing')) {
            diagnosticMsg = `Meta Billing Required: Outbound WhatsApp conversation failed due to payment method requirements. Please ensure an active payment card is linked to your WhatsApp Business Account in Meta Business Manager → Billing & Payments.`;
          }

          console.error(`[WhatsApp] Meta Cloud API error [Code ${code}/${subcode}]:`, diagnosticMsg);
          sendResult = { success: false, provider: 'meta_cloud_api', error: diagnosticMsg, data: metaData };
        }
      } catch (err: any) {
        console.error(`[WhatsApp] Meta Cloud API network error:`, err.message);
        sendResult = { success: false, provider: 'meta_cloud_api', error: err.message };
      }
    }

    // ===== METHOD 2: Grafty API =====
    if ((!sendResult.success && graftyKey) || (provider === 'grafty' && graftyKey)) {
        console.log(`[WhatsApp] Sending via Grafty API — URL: ${graftyUrl}, Template: ${templateName}, To: ${cleanPhone}, Instance: ${graftyInstanceId || 'Default'}`);

        const endpointsToTry = [
          `${graftyUrl}/api/v1/messages/send-template`,
          `${graftyUrl}/api/messages/send-template`,
          `${graftyUrl}/api/v1/send-template`,
          `${graftyUrl}/api/v1/whatsapp/send-template`
        ];

        const instObj = graftyInstanceId ? { instance_id: graftyInstanceId, instanceId: graftyInstanceId } : {};

        let graftyRes: Response | null = null;
        let graftyBody: any = null;
        let graftyMessageId: string | undefined;
        let graftyConfirmed = false;
        let lastErrText = '';
        let successfulStrategy = '';
        let workingEndpoint = '';

        for (const tName of templateNamesToTry) {
          const isFallback = (tName === 'grafty_welcome' || tName === 'grafty_proposals') && tName !== templateName;
          let tLang = targetLanguage;
          let tComps = templateComponents;

          if (isFallback) {
            tLang = 'en_US';
            if (tName === 'grafty_welcome') {
              tComps = [{
                type: 'body',
                parameters: [
                  { type: 'text', text: String(activeVars[0] || name || 'Client') },
                  { type: 'text', text: String(activeVars[1] || 'Inquiry') }
                ]
              }];
            } else if (tName === 'grafty_proposals') {
              tComps = [
                {
                  type: 'header',
                  parameters: [{
                    type: 'document',
                    document: {
                      link: activeMediaUrl || 'https://dashboard.grekam.in/sample.pdf',
                      filename: filename || 'Proposal.pdf'
                    }
                  }]
                },
                {
                  type: 'body',
                  parameters: [
                    { type: 'text', text: String(activeVars[0] || name || 'Client') },
                    { type: 'text', text: String(activeVars[1] || 'Project Proposal') },
                    { type: 'text', text: String(activeVars[2] || 'Details') }
                  ]
                }
              ];
            }
          }

          const altLang = tLang === 'en_US' ? 'en' : 'en_US';
          const candidatePayloads: { desc: string; payload: any }[] = [
            {
              desc: `Full components (${tLang})`,
              payload: {
                ...instObj,
                recipient: { phone: cleanPhone, name },
                to: cleanPhone,
                phone: cleanPhone,
                template: { name: tName, language: tLang, components: tComps },
                templateName: tName,
                template_name: tName,
                media_url: activeMediaUrl || undefined,
                mediaUrl: activeMediaUrl || undefined,
                params: activeVars,
                variables: activeVars,
                parameters: activeVars
              }
            },
            {
              desc: `Full components (${altLang})`,
              payload: {
                ...instObj,
                recipient: { phone: cleanPhone, name },
                to: cleanPhone,
                phone: cleanPhone,
                template: { name: tName, language: altLang, components: tComps },
                templateName: tName,
                template_name: tName,
                media_url: activeMediaUrl || undefined,
                mediaUrl: activeMediaUrl || undefined,
                params: activeVars,
                variables: activeVars,
                parameters: activeVars
              }
            }
          ];

          if (effectiveHeaderType === 'NONE' && !isFallback) {
            candidatePayloads.push(
              {
                desc: `Body-only components (${tLang})`,
                payload: {
                  ...instObj,
                  recipient: { phone: cleanPhone, name },
                  to: cleanPhone,
                  phone: cleanPhone,
                  template: { name: tName, language: tLang, components: tComps.filter((c: any) => c.type !== 'header') },
                  templateName: tName,
                  template_name: tName,
                  media_url: activeMediaUrl || undefined,
                  mediaUrl: activeMediaUrl || undefined,
                  params: activeVars,
                  variables: activeVars,
                  parameters: activeVars
                }
              },
              {
                desc: `Body-only components (${altLang})`,
                payload: {
                  ...instObj,
                  recipient: { phone: cleanPhone, name },
                  to: cleanPhone,
                  phone: cleanPhone,
                  template: { name: tName, language: altLang, components: tComps.filter((c: any) => c.type !== 'header') },
                  templateName: tName,
                  template_name: tName,
                  media_url: activeMediaUrl || undefined,
                  mediaUrl: activeMediaUrl || undefined,
                  params: activeVars,
                  variables: activeVars,
                  parameters: activeVars
                }
              }
            );
          }

          for (const candidate of candidatePayloads) {
            const urlsToTry = workingEndpoint ? [workingEndpoint] : endpointsToTry;

            for (const url of urlsToTry) {
              try {
                const res = await fetch(url, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${graftyKey}`,
                    'x-api-key': graftyKey,
                  },
                  body: JSON.stringify(candidate.payload),
                });

                // Read the body once — Grafty can return 200 with a Meta rejection inside it,
                // so `res.ok` alone is NOT proof of delivery.
                const rawText = await res.text().catch(() => '');

                if (res.ok) {
                  let parsedBody: any = null;
                  try { parsedBody = rawText ? JSON.parse(rawText) : null; } catch { parsedBody = null; }

                  const verdict = inspectProviderBody(parsedBody);

                  if (verdict.ok) {
                    graftyRes = res;
                    graftyBody = parsedBody;
                    graftyMessageId = verdict.messageId;
                    graftyConfirmed = verdict.confirmed;
                    workingEndpoint = url;
                    successfulStrategy = `Template "${tName}" — ${candidate.desc}`;
                    deliveredTemplate = tName;
                    usedFallback = isFallback;
                    break;
                  }

                  // HTTP 200 but the body reports a real delivery failure. Do NOT treat as sent —
                  // record the reason and let the fallback chain decide what to do.
                  lastErrText = rawText || JSON.stringify({ error: verdict.error || 'Provider returned 200 with a failure payload' });
                  console.warn(`[WhatsApp] Grafty returned HTTP ${res.status} with a failure body: ${lastErrText.slice(0, 300)}`);
                  graftyRes = null;
                  continue;
                }

                if (res.status === 404) continue;

                workingEndpoint = url;
                if (rawText) {
                  lastErrText = rawText;
                }
                graftyRes = res;
                break;
              } catch (e: any) {
                lastErrText = e.message;
              }
            }

            if (graftyRes && graftyRes.ok) break;

            const isMismatch = lastErrText.includes('132012') ||
                               lastErrText.includes('132000') ||
                               lastErrText.includes('132001') ||
                               lastErrText.includes('131008') ||
                               lastErrText.toLowerCase().includes('parameter format does not match') ||
                               lastErrText.toLowerCase().includes('param count') ||
                               lastErrText.toLowerCase().includes('template parameter mismatch') ||
                               lastErrText.toLowerCase().includes('number of parameters does not match') ||
                               lastErrText.toLowerCase().includes('missing recipient') ||
                               lastErrText.toLowerCase().includes('missing template') ||
                               lastErrText.toLowerCase().includes('whatsapp api rejection') ||
                               lastErrText.toLowerCase().includes('does not exist');
            if (!isMismatch) break;
          }

          if (graftyRes && graftyRes.ok) {
            console.log(`[WhatsApp] Grafty template send succeeded using: ${successfulStrategy}`);
            break;
          }
        }

        if (graftyRes && graftyRes.ok) {
          // graftyRes is only ever set once inspectProviderBody() approved the payload.
          if (graftyMessageId && graftyBody && typeof graftyBody === 'object') {
            (graftyBody as any).messageId = (graftyBody as any).messageId || graftyMessageId;
          }
          sendResult = {
            success: true,
            provider: 'grafty',
            data: graftyBody ?? {},
            confirmed: graftyConfirmed,
            messageId: graftyMessageId,
          };
          if (usedFallback) {
            console.warn(
              `[WhatsApp] FALLBACK SUBSTITUTION: requested template "${templateName}" was rejected — ` +
              `delivered "${deliveredTemplate}" instead. This is reported to the operator, not hidden.`
            );
          }
        } else if (!sendResult.success) {
          const statusCode = graftyRes?.status || 'unreachable';
          console.error(`[WhatsApp] Grafty send failed (${statusCode}):`, lastErrText);
          let parsedError = lastErrText;
          try {
            const errBody = JSON.parse(lastErrText);
            parsedError = errBody?.details || errBody?.message || errBody?.error || lastErrText;
          } catch (e) {}
          sendResult = { success: false, provider: 'grafty', error: parsedError || 'Grafty endpoint unreachable' };
        }
      }

    // If grafty was explicitly requested but no key is configured, surface an actionable error now
    if (provider === 'grafty' && !graftyKey && !sendResult.success) {
      throw new Error('GRAFTY_API_KEY is not configured. Go to Settings -> Integrations -> WHATSAPP to add it.');
    }

    // ===== Log CRM communication regardless of send success =====
    try {
      const contact = await prisma.contact.findFirst({
        where: {
          OR: [
            { phone: { contains: cleanPhone.slice(-10) } },
            { whatsapp: { contains: cleanPhone.slice(-10) } }
          ]
        }
      });
      if (contact) {
        // Record the template that was ACTUALLY accepted, not the one that was requested.
        // Previously this always logged the requested name, so a rejected template that had
        // silently fallen back to grafty_welcome was written to the CRM as "✓ Sent".
        const outcome = !sendResult.success
          ? `✗ Failed: ${sendResult.error}`
          : usedFallback
            ? `⚠ Sent via FALLBACK — requested "${templateName}" was rejected, delivered "${deliveredTemplate}"`
            : sendResult.confirmed === false
              ? `✓ Accepted (delivery unconfirmed) — "${deliveredTemplate || templateName}"`
              : `✓ Sent — "${deliveredTemplate || templateName}"`;

        await prisma.communicationLog.create({
          data: {
            contactId: contact.id,
            type: 'WHATSAPP',
            direction: 'OUTBOUND',
            summary: `WhatsApp Template via ${sendResult.provider} — ${outcome}` +
              (sendResult.messageId ? ` [msg ${sendResult.messageId}]` : ''),
            userId: 'system'
          }
        });
      }
    } catch (err) {
      console.error('[WhatsApp] Failed to log CRM communication:', err);
    }

    if (!sendResult.success) {
      // Surface the actual error — include raw details so the router & frontend can present actionable info
      const errDetail = sendResult.error || 'WhatsApp message delivery failed.';
      const is132012 = errDetail.includes('132012') || errDetail.toLowerCase().includes('parameter format does not match');

      // 132001: Template doesn't exist in Meta WABA. Only show this error if Grafty ALSO wasn't configured.
      // If Grafty was tried and also failed, the error from Grafty is already in sendResult.error.
      if (metaFailedWith132001 && !graftyKey) {
        throw new Error(
          `WhatsApp Template Not Found: The template "${templateName}" does not exist in your Meta WABA. ` +
          `Please create & approve this template in Meta Business Manager first, ` +
          `OR configure a GRAFTY_API_KEY under Settings → Integrations → WHATSAPP to use Grafty as a fallback sender. ` +
          `Details: (#132001) Template name does not exist in the translation`
        );
      }
      if (is132012) {
        throw new Error(
          `WhatsApp API Rejection (#132012): The template "${templateName}" was created in Meta with rigid/fixed parameters that do not match the request. ` +
          `Please switch to a verified template like "grafty_welcome", or check the required media attachment format. ` +
          `Details: ${errDetail}`
        );
      }
      throw new Error(errDetail);
    }

    return {
      success: true,
      provider: sendResult.provider,
      // Spread the provider payload first, then our authoritative fields, so a provider
      // `status`/`template` in the body can never overwrite the truth.
      data: {
        ...sendResult.data,
        // 'accepted' means the provider took the message; 'sent' is only claimed when the
        // provider explicitly confirmed it. Never assert delivery from a 200 alone.
        status: sendResult.confirmed === false ? 'accepted_unconfirmed' : 'sent',
        recipient: cleanPhone,
        template: deliveredTemplate || templateName,
        requestedTemplate: templateName,
        usedFallback,
        messageId: sendResult.messageId || (sendResult.data as any)?.messageId,
      }
    };
  }

  // Common notification methods
  async sendInvoiceNotification(phone: string, name: string, invoiceId: string, amount: number) {
    return this.sendTemplateMessage({
      phone,
      name,
      event: 'INVOICE_GENERATED',
      templateName: 'invoice_generated_v1',
      variables: [name, invoiceId, `₹${amount.toLocaleString('en-IN')}`],
    });
  }

  async sendProjectUpdate(phone: string, name: string, projectName: string, status: string) {
    return this.sendTemplateMessage({
      phone,
      name,
      event: 'PROJECT_UPDATED',
      templateName: 'project_status_update',
      variables: [name, projectName, status],
    });
  }
}

export const whatsappService = new WhatsAppService();
