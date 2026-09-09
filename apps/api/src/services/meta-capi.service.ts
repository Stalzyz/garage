import crypto from 'crypto';
import { FastifyInstance } from 'fastify';
import { getMetaAccessToken } from '../utils/meta-enrichment';
import { EventBus, SystemEvents } from '../automations/event-bus';

const META_ACCESS_TOKEN_PROVIDED = 'EAAYE8luJYlkBSbdlZAabJsoIiR31ZCGOE9d3kYeRIPOiMLhwtjksqLqlU2ggIZAbdoZAZCXdZAaZAO1IfJpMSZBAMyLXy8tLtPJikJmM3ZCSGuGltAMAX9NugPtjouMZBwVUM8WgEjtWhOWYlbTC80TrZBihIAHojuFGWztl2XKbhX0aDcKQV4BXMyvjagEonx9BgZDZD';
const META_DATASET_ID_DEFAULT = '1353282856878911';
const META_CAPI_VERSION_DEFAULT = 'v26.0';

const ALGORITHM = 'aes-256-cbc';
const SECRET = (process.env.ENCRYPTION_SECRET || 'grekam-os-default-secret-32bytes!').slice(0, 32);
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(SECRET), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * SHA-256 Hashing helper according to Meta Conversions API specifications.
 */
export function hashMetaUserData(val?: string | null): string | undefined {
  if (!val) return undefined;
  const clean = val.trim().toLowerCase();
  if (!clean) return undefined;
  return crypto.createHash('sha256').update(clean).digest('hex');
}

export function hashMetaPhone(phone?: string | null): string | undefined {
  if (!phone) return undefined;
  const clean = phone.replace(/[^0-9]/g, '');
  if (!clean) return undefined;
  return crypto.createHash('sha256').update(clean).digest('hex');
}

export interface MetaCapiEventPayload {
  eventName: 'Lead' | 'Contact' | 'QualifyLead' | 'ConvertedLead' | 'CompleteRegistration' | 'Purchase';
  leadId?: string;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  value?: number;
  currency?: string;
  businessUnit?: string;
  customData?: Record<string, any>;
  testEventCode?: string;
}

/**
 * Resolves the Meta Dataset / Pixel ID from database or environment.
 */
export async function getMetaDatasetId(app?: FastifyInstance): Promise<string> {
  if (app) {
    try {
      const record = await app.prisma.integrationKey.findFirst({
        where: { service: 'META', keyName: 'META_DATASET_ID', isActive: true }
      });
      if (record?.encryptedValue && record.encryptedValue !== '***ENCRYPTED***') {
        return record.encryptedValue.trim();
      }
    } catch (e) {}
  }
  return process.env.META_DATASET_ID || process.env.FACEBOOK_PIXEL_ID || META_DATASET_ID_DEFAULT;
}

/**
 * Auto-seeds Meta CAPI Access Token and Dataset ID into IntegrationKey table on server startup.
 */
export async function autoSeedMetaCredentials(app: FastifyInstance) {
  try {
    app.log.info('[Meta CAPI] Auto-seeding Meta Access Token into IntegrationKey table...');
    await app.prisma.integrationKey.upsert({
      where: { service_keyName: { service: 'META', keyName: 'META_ACCESS_TOKEN' } },
      update: { encryptedValue: META_ACCESS_TOKEN_PROVIDED, isActive: true },
      create: {
        service: 'META',
        keyName: 'META_ACCESS_TOKEN',
        encryptedValue: META_ACCESS_TOKEN_PROVIDED,
        isActive: true
      }
    });

    const existingDataset = await app.prisma.integrationKey.findFirst({
      where: { service: 'META', keyName: 'META_DATASET_ID' }
    });

    if (!existingDataset) {
      app.log.info('[Meta CAPI] Auto-seeding Meta Dataset ID into IntegrationKey table...');
      await app.prisma.integrationKey.upsert({
        where: { service_keyName: { service: 'META', keyName: 'META_DATASET_ID' } },
        update: { encryptedValue: META_DATASET_ID_DEFAULT, isActive: true },
        create: {
          service: 'META',
          keyName: 'META_DATASET_ID',
          encryptedValue: META_DATASET_ID_DEFAULT,
          isActive: true
        }
      });
    }
  } catch (err: any) {
    app.log.warn(`[Meta CAPI] Auto-seed warning: ${err.message}`);
  }
}

/**
 * Sends a server-side event to Meta Conversions API (CAPI).
 * Endpoint: POST https://graph.facebook.com/v26.0/{dataset_id}/events?access_token={token}
 */
export async function sendMetaCapiEvent(
  app: FastifyInstance,
  payload: MetaCapiEventPayload
): Promise<{ success: boolean; data?: any; error?: string }> {
  let token = await getMetaAccessToken(app);
  if (!token) {
    token = META_ACCESS_TOKEN_PROVIDED;
  }
  const datasetId = await getMetaDatasetId(app);

  try {
    const nameParts = (payload.name || '').trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    const userData: Record<string, any> = {};
    if (payload.email) {
      const hashedEm = hashMetaUserData(payload.email);
      if (hashedEm) userData.em = [hashedEm];
    }
    if (payload.phone) {
      const hashedPh = hashMetaPhone(payload.phone);
      if (hashedPh) userData.ph = [hashedPh];
    }
    if (firstName) {
      const hashedFn = hashMetaUserData(firstName);
      if (hashedFn) userData.fn = [hashedFn];
    }
    if (lastName) {
      const hashedLn = hashMetaUserData(lastName);
      if (hashedLn) userData.ln = [hashedLn];
    }

    const eventTime = Math.floor(Date.now() / 1000);
    const eventId = payload.leadId ? `lead_${payload.leadId}_${eventTime}` : `evt_${Date.now()}`;

    const eventObject: Record<string, any> = {
      event_name: payload.eventName,
      event_time: eventTime,
      event_id: eventId,
      action_source: 'system',
      user_data: userData,
      custom_data: {
        currency: payload.currency || 'INR',
        value: payload.value || 0,
        business_unit: payload.businessUnit || 'AGENCY',
        ...(payload.customData || {})
      }
    };

    const capiUrl = `https://graph.facebook.com/${META_CAPI_VERSION_DEFAULT}/${datasetId}/events`;
    const postBody: Record<string, any> = {
      data: [eventObject],
      access_token: token
    };

    if (payload.testEventCode || process.env.META_TEST_EVENT_CODE) {
      postBody.test_event_code = payload.testEventCode || process.env.META_TEST_EVENT_CODE;
    }

    app.log.info(`[Meta CAPI] Dispatching ${payload.eventName} event to Dataset ${datasetId}...`);

    const res = await fetch(capiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postBody)
    });

    const resData = await res.json() as any;

    if (!res.ok) {
      app.log.error(`[Meta CAPI] Event dispatch failed (${res.status}): ${JSON.stringify(resData)}`);
      return { success: false, error: resData?.error?.message || 'Meta CAPI request failed', data: resData };
    }

    app.log.info(`[Meta CAPI] Event dispatch successful (${payload.eventName}): ${JSON.stringify(resData)}`);
    return { success: true, data: resData };
  } catch (err: any) {
    app.log.error(`[Meta CAPI] Exception during event dispatch: ${err.message}`);
    return { success: false, error: err.message };
  }
}

/**
 * Registers Meta CAPI automated event listeners on Global EventBus.
 */
export function initMetaCapiEventListeners(app: FastifyInstance) {
  app.log.info('[Meta CAPI] Initializing automated EventBus listeners for Meta Conversions API...');
  autoSeedMetaCredentials(app);

  // 1. Lead Created -> Meta 'Lead' Event
  EventBus.on(SystemEvents.LEAD_CREATED, async (lead: any) => {
    if (!lead) return;
    await sendMetaCapiEvent(app, {
      eventName: 'Lead',
      leadId: lead.id,
      email: lead.email,
      phone: lead.phone,
      name: lead.name,
      value: lead.estimatedBudget || 0,
      businessUnit: lead.businessUnit || 'AGENCY',
      customData: {
        lead_source: lead.source,
        course_interest: lead.courseInterest
      }
    });
  });

  // 2. Academy Enquiry Received -> Meta 'Lead' Event
  EventBus.on(SystemEvents.ACADEMY_ENQUIRY_RECEIVED, async (lead: any) => {
    if (!lead) return;
    await sendMetaCapiEvent(app, {
      eventName: 'Lead',
      leadId: lead.id,
      email: lead.email,
      phone: lead.phone,
      name: lead.name,
      value: 15000,
      businessUnit: 'ACADEMY',
      customData: {
        lead_source: lead.source,
        course_interest: lead.courseInterest
      }
    });
  });

  // 3. Lead Won -> Meta 'ConvertedLead' Event
  EventBus.on(SystemEvents.LEAD_WON, async (lead: any) => {
    if (!lead) return;
    await sendMetaCapiEvent(app, {
      eventName: 'ConvertedLead',
      leadId: lead.id,
      email: lead.email,
      phone: lead.phone,
      name: lead.name,
      value: lead.estimatedBudget || 50000,
      businessUnit: lead.businessUnit || 'AGENCY',
      customData: {
        lead_status: 'WON',
        lead_source: lead.source
      }
    });
  });

  // 4. Student Enrolled -> Meta 'CompleteRegistration' Event
  EventBus.on(SystemEvents.STUDENT_ENROLLED, async (student: any) => {
    if (!student) return;
    await sendMetaCapiEvent(app, {
      eventName: 'CompleteRegistration',
      leadId: student.id,
      email: student.email,
      phone: student.phone,
      name: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
      value: 25000,
      businessUnit: 'ACADEMY',
      customData: {
        batch_id: student.batchId
      }
    });
  });
}
