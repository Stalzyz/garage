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
  buttons?: string[];
}

export const WHATSAPP_TEMPLATES: WhatsAppTemplateDef[] = [
  {
    id: 'grafty_proposals',
    name: 'Grafty Proposals (Recommended)',
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
    bodyPattern: 'Hi {{1}},\n\nThank you for reaching out to Grekam Visuals regarding {{2}}!\n\nOur agency team is reviewing your requirements and will connect with you shortly.\n\nPortfolio: https://agency.grekam.in',
    buttons: ['Call Support', 'View Portfolio']
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
    bodyPattern: 'Hi {{1}},\n\nThank you for reaching out to Grekam Visuals regarding {{2}}!\n\nOur agency team is reviewing your requirements and will connect with you shortly.\n\nExplore our portfolio: https://agency.grekam.in',
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
  }
];

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
                buttons: (t.buttons || []).map((b: any) => typeof b === 'string' ? b : (b.text || b.url || 'Action'))
              });
            }
          });
        }
      } catch (err) {
        console.warn('[Grafty] Workspace template fetch notice:', err);
      }
    }

    // Merge default built-in templates with Meta Cloud & Grafty templates (deduplicate)
    const existingNames = new Set(WHATSAPP_TEMPLATES.map(t => t.templateName));
    const uniqueCloud = cloudTemplates.filter(t => !existingNames.has(t.templateName));
    return [...WHATSAPP_TEMPLATES, ...uniqueCloud];
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
    try {
      const allTemplates = await this.getTemplates();
      matchedTpl = allTemplates.find(t => t.templateName === templateName || t.id === templateName);
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

    // Build components array for Meta Cloud API & Grafty
    const templateComponents: any[] = [];

    // 1. Add Header Component if media URL is provided and header type requires media
    if (mediaUrl && ['IMAGE', 'DOCUMENT', 'VIDEO'].includes(effectiveHeaderType)) {
      if (effectiveHeaderType === 'IMAGE') {
        templateComponents.push({
          type: 'header',
          parameters: [
            {
              type: 'image',
              image: { link: mediaUrl }
            }
          ]
        });
      } else if (effectiveHeaderType === 'DOCUMENT') {
        const docName = filename || mediaUrl.split('/').pop()?.split('?')[0] || 'Attachment.pdf';
        templateComponents.push({
          type: 'header',
          parameters: [
            {
              type: 'document',
              document: {
                link: mediaUrl,
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
              video: { link: mediaUrl }
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
      expectedVarCount = variables.length;
    }

    // 3. Only add Body Component if template actually expects body parameters (expectedVarCount > 0)
    const activeVars = variables.slice(0, Math.max(expectedVarCount, variables.length));
    if (activeVars.length > 0) {
      templateComponents.push({
        type: 'body',
        parameters: activeVars.map(v => ({ type: 'text', text: String(v || '') }))
      });
    }

    let sendResult: { success: boolean; provider: string; data?: any; error?: string } = {
      success: false,
      provider: 'none',
      error: 'No messaging provider configured'
    };

    const isAuto = (provider as string) === 'auto';
    const tryMeta = (isAuto || provider === 'meta') && Boolean(metaToken && metaPhoneNumberId);
    const tryGrafty = (isAuto || provider === 'grafty') || (tryMeta && !sendResult.success);

    // List of candidate template names to try if the requested templateName gets #132012 parameter mismatch.
    // CRITICAL: If mediaUrl is absent, text-only templates (grafty_welcome) MUST be prioritized over document templates (grafty_proposals).
    // Sending a document template (grafty_proposals) without a document header causes Meta API to accept the HTTP call but drop delivery at the handset level.
    const sanitizedName = templateName.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
    const hasMedia = Boolean(mediaUrl && mediaUrl.trim());
    const templateNamesToTry = hasMedia
      ? Array.from(new Set([templateName, sanitizedName, 'grafty_proposals', 'proposal_sent_v1', 'grafty_welcome', 'lead_welcome_v1']))
      : Array.from(new Set([templateName, sanitizedName, 'grafty_welcome', 'lead_welcome_v1', 'grafty_proposals', 'proposal_sent_v1']));

    // ===== METHOD 1: Meta Cloud API Direct (Official) =====
    if (tryMeta) {
      console.log(`[WhatsApp] Sending via Meta Cloud API — Phone Number ID: ${metaPhoneNumberId}, To: ${cleanPhone}, Template: ${templateName}, Media: ${mediaUrl || 'None'}`);
      try {
        const altLang = targetLanguage === 'en_US' ? 'en' : 'en_US';
        let metaRes: Response | null = null;
        let metaData: any = null;

        for (const tName of templateNamesToTry) {
          const metaCandidates = [
            { desc: `Full components (${targetLanguage})`, lang: targetLanguage, comps: templateComponents },
            { desc: `Full components (${altLang})`, lang: altLang, comps: templateComponents },
            { desc: `Body-only components (${targetLanguage})`, lang: targetLanguage, comps: templateComponents.filter((c: any) => c.type !== 'header') },
            { desc: `Body-only components (${altLang})`, lang: altLang, comps: templateComponents.filter((c: any) => c.type !== 'header') }
          ];

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
              break;
            }

            const errSub = d?.error?.error_subcode ?? d?.error?.code;
            const isParamMismatch =
              errSub === 132012 ||
              String(d?.error?.message || '').includes('132012') ||
              String(d?.error?.error_data || '').toLowerCase().includes('parameter format does not match') ||
              String(d?.error?.message || '').toLowerCase().includes('does not exist');

            if (!isParamMismatch) break;
          }

          if (metaRes && metaRes.ok && metaData?.messages) break;
        }

        if (metaRes && metaRes.ok && metaData?.messages) {
          sendResult = { success: true, provider: 'meta_cloud_api', data: metaData };
        } else {
          const errMsg = metaData?.error?.message || `Meta API returned status ${metaRes?.status}`;
          console.error(`[WhatsApp] Meta Cloud API error:`, metaData?.error || metaRes?.status);
          sendResult = { success: false, provider: 'meta_cloud_api', error: errMsg, data: metaData };
        }
      } catch (err: any) {
        console.error(`[WhatsApp] Meta Cloud API network error:`, err.message);
        sendResult = { success: false, provider: 'meta_cloud_api', error: err.message };
      }
    }

    // ===== METHOD 2: Grafty API =====
    if ((!sendResult.success && graftyKey) || (provider === 'grafty' && graftyKey)) {
        console.log(`[WhatsApp] Sending via Grafty API — URL: ${graftyUrl}, Template: ${templateName}, To: ${cleanPhone}, Instance: ${graftyInstanceId || 'Default'}`);

        const altLang = targetLanguage === 'en_US' ? 'en' : 'en_US';
        const endpointsToTry = [
          `${graftyUrl}/api/v1/messages/send-template`,
          `${graftyUrl}/api/messages/send-template`,
          `${graftyUrl}/api/v1/send-template`,
          `${graftyUrl}/api/v1/whatsapp/send-template`
        ];

        const instObj = graftyInstanceId ? { instance_id: graftyInstanceId, instanceId: graftyInstanceId } : {};

        let graftyRes: Response | null = null;
        let lastErrText = '';
        let successfulStrategy = '';
        let workingEndpoint = '';

        for (const tName of templateNamesToTry) {
          const candidatePayloads: { desc: string; payload: any }[] = [
            {
              desc: `Full components (${targetLanguage})`,
              payload: {
                ...instObj,
                recipient: { phone: cleanPhone, name },
                to: cleanPhone,
                phone: cleanPhone,
                template: { name: tName, language: targetLanguage, components: templateComponents }
              }
            },
            {
              desc: `Full components (${altLang})`,
              payload: {
                ...instObj,
                recipient: { phone: cleanPhone, name },
                to: cleanPhone,
                phone: cleanPhone,
                template: { name: tName, language: altLang, components: templateComponents }
              }
            },
            {
              desc: `Body-only components (${targetLanguage})`,
              payload: {
                ...instObj,
                recipient: { phone: cleanPhone, name },
                to: cleanPhone,
                phone: cleanPhone,
                template: { name: tName, language: targetLanguage, components: templateComponents.filter((c: any) => c.type !== 'header') }
              }
            },
            {
              desc: `Body-only components (${altLang})`,
              payload: {
                ...instObj,
                recipient: { phone: cleanPhone, name },
                to: cleanPhone,
                phone: cleanPhone,
                template: { name: tName, language: altLang, components: templateComponents.filter((c: any) => c.type !== 'header') }
              }
            },
            {
              desc: `Flat parameters list`,
              payload: {
                ...instObj,
                phone: cleanPhone,
                to: cleanPhone,
                name,
                templateName: tName,
                template_name: tName,
                language: targetLanguage,
                params: activeVars,
                variables: activeVars,
                parameters: activeVars,
                media_url: mediaUrl || undefined,
                mediaUrl: mediaUrl || undefined
              }
            }
          ];

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

                if (res.ok) {
                  graftyRes = res;
                  workingEndpoint = url;
                  successfulStrategy = `Template "${tName}" — ${candidate.desc}`;
                  break;
                }

                if (res.status === 404) continue;

                workingEndpoint = url;
                const errBody = await res.text().catch(() => '');
                if (errBody) {
                  lastErrText = errBody;
                }
                graftyRes = res;
                break;
              } catch (e: any) {
                lastErrText = e.message;
              }
            }

            if (graftyRes && graftyRes.ok) break;

            const isMismatch = lastErrText.includes('132012') ||
                               lastErrText.toLowerCase().includes('parameter format does not match') ||
                               lastErrText.toLowerCase().includes('param count') ||
                               lastErrText.toLowerCase().includes('template parameter mismatch') ||
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
          let graftyData = {};
          try { graftyData = await graftyRes.json(); } catch (e) {}
          sendResult = { success: true, provider: 'grafty', data: graftyData };
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
        await prisma.communicationLog.create({
          data: {
            contactId: contact.id,
            type: 'WHATSAPP',
            direction: 'OUTBOUND',
            summary: `WhatsApp Template "${templateName}" via ${sendResult.provider} — ${sendResult.success ? '✓ Sent' : '✗ Failed: ' + sendResult.error}`,
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
      if (is132012) {
        throw new Error(
          `WhatsApp API Rejection (#132012): The template "${templateName}" was created in Meta with rigid/fixed parameters that do not match the request. ` +
          `Please switch to a flexible template like "grafty_proposals" or "grafty_welcome", or send without a media attachment. ` +
          `Details: ${errDetail}`
        );
      }
      throw new Error(errDetail);
    }

    return {
      success: true,
      provider: sendResult.provider,
      data: { status: 'sent', recipient: cleanPhone, template: templateName, ...sendResult.data }
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
