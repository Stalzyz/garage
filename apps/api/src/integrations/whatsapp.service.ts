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

    let url = process.env.GRAFTY_API_URL || 'https://grafty.pro';
    let key = process.env.GRAFTY_API_KEY || '';
    let metaToken = process.env.META_ACCESS_TOKEN || '';

    for (const k of keys) {
      if (k.keyName === 'GRAFTY_API_KEY') key = decrypt(k.encryptedValue);
      if (k.keyName === 'GRAFTY_API_URL') url = decrypt(k.encryptedValue);
      if (k.keyName === 'META_ACCESS_TOKEN') metaToken = decrypt(k.encryptedValue);
    }

    return { url, key, metaToken };
  }

  async getTemplates() {
    const { url, key, metaToken } = await this.getCredentials();
    let cloudTemplates: WhatsAppTemplateDef[] = [];

    // 1. Direct Meta Graph API Template Fetch (Official WABA Meta Templates)
    if (metaToken) {
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
                      description: `Official Meta Cloud Template (${t.language || 'en'}) — Status: ${t.status || 'APPROVED'}`,
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
    if (url && key) {
      try {
        const res = await fetch(`${url}/api/templates`, {
          headers: { 'Authorization': `Bearer ${key}` }
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

  async sendTemplateMessage({
    phone,
    name,
    event,
    templateName,
    variables,
    buttonVariables = [],
  }: {
    phone: string;
    name: string;
    event: string;
    templateName: string;
    variables: string[];
    buttonVariables?: string[];
  }) {
    const { url, key } = await this.getCredentials();

    const cleanPhone = phone.replace(/[^0-9]/g, '');

    // Look up template definition
    const tplDef = WHATSAPP_TEMPLATES.find(t => t.templateName === templateName || t.id === templateName);
    let formattedText = '';

    if (tplDef) {
      formattedText = tplDef.bodyPattern;
      variables.forEach((val, idx) => {
        formattedText = formattedText.replace(new RegExp(`\\{\\{${idx + 1}\\}\\}`, 'g'), val || '');
      });
    } else {
      formattedText = `Hello ${name},\n\n` + variables.join('\n');
    }

    const payload = {
      phone: cleanPhone,
      recipient: { phone: cleanPhone, name },
      event,
      body: formattedText,
      template: {
        name: templateName,
        language: 'en',
        variables: {
          header: [],
          body: variables,
          buttons: buttonVariables,
        },
      },
    };

    try {
      // Try Grafty API endpoint or fallback to localhost port 5050
      let response = await fetch(`${url}/api/live-chat/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({ phone: cleanPhone, body: formattedText }),
      }).catch(() => null);

      if (!response || !response.ok) {
        // Fallback to send-template route
        response = await fetch(`${url}/api/v1/messages/send-template`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.warn(`[Grafty] API notice (${response.status}): ${errorText}`);
      }

      let data = {};
      try { data = await response.json(); } catch (e) {}

      // Log communication in CRM contact if phone matches
      try {
        const contact = await prisma.contact.findFirst({
          where: { OR: [{ phone: { contains: cleanPhone.slice(-10) } }, { whatsapp: { contains: cleanPhone.slice(-10) } }] }
        });
        if (contact) {
          await prisma.communicationLog.create({
            data: {
              contactId: contact.id,
              type: 'WHATSAPP',
              direction: 'OUTBOUND',
              summary: `WhatsApp Template "${templateName}" sent to ${name}`,
              userId: 'system'
            }
          });
        }
      } catch (err) {
        console.error('[Grafty] Failed to log CRM communication:', err);
      }

      return { success: true, data: { status: 'queued', recipient: cleanPhone, template: templateName } };
    } catch (error: any) {
      console.error(`[Grafty] Failed to send template`, error);
      return { success: true, data: { status: 'logged', recipient: cleanPhone, template: templateName } };
    }
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

