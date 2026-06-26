import { prisma } from '../db';
import { decrypt } from '../settings/integrations.router';

export class WhatsAppService {
  async getCredentials() {
    const keys = await prisma.integrationKey.findMany({
      where: { service: 'WHATSAPP', isActive: true }
    });

    let url = process.env.GRAFTY_API_URL || 'https://api.grafty.io';
    let key = process.env.GRAFTY_API_KEY || '';

    for (const k of keys) {
      if (k.keyName === 'GRAFTY_API_KEY') key = decrypt(k.encryptedValue);
      // If we decide to allow configuring URL in DB later, we could add GRAFTY_API_URL
    }

    return { url, key };
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

    if (!url || !key) {
      console.warn(`[Grafty] Skipping message to ${phone} - Credentials missing`);
      return { success: false, reason: 'Missing credentials' };
    }

    const payload = {
      recipient: { phone, name },
      event,
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
      const response = await fetch(`${url}/api/v1/messages/send-template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Grafty API rejected request: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error: any) {
      console.error(`[Grafty] Failed to send template`, error);
      return { success: false, error: error.message };
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
