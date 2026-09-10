import { prisma } from '../db';
import { decrypt } from '../settings/integrations.router';

export interface WhatsAppTemplateDef {
  id: string;
  name: string;
  templateName: string;
  category: 'FINANCE' | 'CRM' | 'ACADEMY' | 'GENERAL';
  event: string;
  description: string;
  variables: { name: string; label: string; placeholder: string }[];
  bodyPattern: string;
  headerType?: 'DOCUMENT' | 'IMAGE' | 'NONE';
  buttons?: string[];
}

export const WHATSAPP_TEMPLATES: WhatsAppTemplateDef[] = [
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
      const res = await fetch(`${graftyUrl}/api/templates`, {
        headers: { 'Authorization': `Bearer ${graftyKey}` }
      }).catch(() => null);

      if (!res) return { connected: false, error: 'Cannot reach Grafty API at ' + graftyUrl };
      if (res.status === 401) return { connected: false, error: 'Invalid GRAFTY_API_KEY — check Settings → WHATSAPP' };
      if (res.ok) {
        const data = await res.json();
        return { connected: true, templates: Array.isArray(data) ? data.length : (data.data?.length || 0), url: graftyUrl };
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
        const res = await fetch(`${graftyUrl}/api/templates`, {
          headers: { 'Authorization': `Bearer ${graftyKey}` }
        }).catch(() => null);

        if (res && res.ok) {
          const raw = await res.json();
          const items = Array.isArray(raw) ? raw : (raw.data || []);
          items.forEach((t: any) => {
            cloudTemplates.push({
              id: t.id || t.name,
              name: t.name ? t.name.replace(/_/g, ' ').toUpperCase() : 'Grafty Workspace Template',
              templateName: t.name || t.id,
              category: (t.category || 'CRM') as any,
              event: t.event || 'GRAFTY_TEMPLATE',
              description: t.description || `Grafty Meta Cloud Template (${t.language || 'en'})`,
              variables: (t.variables || []).map((v: any, idx: number) => ({
                name: typeof v === 'string' ? v : (v.name || `param_${idx + 1}`),
                label: typeof v === 'string' ? v : (v.label || `Parameter ${idx + 1}`),
                placeholder: typeof v === 'string' ? v : (v.placeholder || `Value ${idx + 1}`)
              })),
              bodyPattern: t.body || t.bodyPattern || '{{1}}',
              headerType: t.headerType || 'NONE',
              buttons: t.buttons || []
            });
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
  }: {
    phone: string;
    name: string;
    event: string;
    templateName: string;
    variables: string[];
    buttonVariables?: string[];
    language?: string;
  }) {
    const { graftyUrl, graftyKey, metaToken, metaPhoneNumberId } = await this.getCredentials();
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    let sendResult: { success: boolean; provider: string; data?: any; error?: string } = {
      success: false,
      provider: 'none',
      error: 'No messaging provider configured'
    };

    // ===== METHOD 1: Meta Cloud API Direct (Official) =====
    if (metaToken && metaPhoneNumberId) {
      console.log(`[WhatsApp] Sending via Meta Cloud API — Phone Number ID: ${metaPhoneNumberId}, To: ${cleanPhone}, Template: ${templateName}`);
      try {
        const metaPayload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: cleanPhone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: language },
            components: variables.length > 0 ? [
              {
                type: 'body',
                parameters: variables.map(v => ({ type: 'text', text: v || '' }))
              }
            ] : []
          }
        };

        const metaRes = await fetch(
          `https://graph.facebook.com/v19.0/${metaPhoneNumberId}/messages`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${metaToken}`,
            },
            body: JSON.stringify(metaPayload),
          }
        );

        const metaData = await metaRes.json();
        console.log(`[WhatsApp] Meta Cloud API response (${metaRes.status}):`, JSON.stringify(metaData));

        if (metaRes.ok && metaData.messages) {
          sendResult = { success: true, provider: 'meta_cloud_api', data: metaData };
        } else {
          const errMsg = metaData.error?.message || `Meta API returned status ${metaRes.status}`;
          console.error(`[WhatsApp] Meta Cloud API error:`, metaData.error || metaRes.status);
          sendResult = { success: false, provider: 'meta_cloud_api', error: errMsg, data: metaData };
          // Fall through to Grafty if Meta fails
        }
      } catch (err: any) {
        console.error(`[WhatsApp] Meta Cloud API network error:`, err.message);
        sendResult = { success: false, provider: 'meta_cloud_api', error: err.message };
      }
    }

    // ===== METHOD 2: Grafty API (fallback or primary if no Meta direct) =====
    if (!sendResult.success && graftyKey) {
      console.log(`[WhatsApp] Sending via Grafty API — URL: ${graftyUrl}, Template: ${templateName}, To: ${cleanPhone}`);

      const graftyPayload = {
        phone: cleanPhone,
        to: cleanPhone,
        recipient: { phone: cleanPhone, name },
        event,
        templateName,
        template: {
          name: templateName,
          language: language,
          variables: {
            header: [],
            body: variables,
            buttons: buttonVariables,
          },
        },
      };

      try {
        // Try Grafty send-template endpoint
        let graftyRes = await fetch(`${graftyUrl}/api/v1/messages/send-template`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${graftyKey}`,
          },
          body: JSON.stringify(graftyPayload),
        }).catch(() => null);

        if (!graftyRes || !graftyRes.ok) {
          // Fallback to live-chat/send
          const tplDef = WHATSAPP_TEMPLATES.find(t => t.templateName === templateName || t.id === templateName);
          let formattedText = tplDef?.bodyPattern || '';
          variables.forEach((val, idx) => {
            formattedText = formattedText.replace(new RegExp(`\\{\\{${idx + 1}\\}\\}`, 'g'), val || '');
          });

          graftyRes = await fetch(`${graftyUrl}/api/live-chat/send`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${graftyKey}`,
            },
            body: JSON.stringify({ phone: cleanPhone, body: formattedText || `Hello ${name}` }),
          }).catch(() => null);
        }

        if (graftyRes && graftyRes.ok) {
          let graftyData = {};
          try { graftyData = await graftyRes.json(); } catch (e) {}
          sendResult = { success: true, provider: 'grafty', data: graftyData };
        } else {
          const statusCode = graftyRes?.status || 'unreachable';
          let errorBody = '';
          try { errorBody = await graftyRes?.text() || ''; } catch(e) {}
          console.error(`[WhatsApp] Grafty send failed (${statusCode}):`, errorBody);
          sendResult = { success: false, provider: 'grafty', error: `Grafty returned ${statusCode}: ${errorBody}` };
        }
      } catch (err: any) {
        console.error(`[WhatsApp] Grafty network error:`, err.message);
        sendResult = { success: false, provider: 'grafty', error: err.message };
      }
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
      // Surface the actual error to the caller
      throw new Error(sendResult.error || 'WhatsApp message delivery failed. Check META_PHONE_NUMBER_ID + META_ACCESS_TOKEN in Settings → Integrations → META, or GRAFTY_API_KEY in Settings → Integrations → WHATSAPP.');
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
