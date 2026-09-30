import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { canViewCompensation } from '../utils/permissions';

/**
 * Response redaction.
 *
 * SAFETY NET for authentication material. Auth now protects these routes, but
 * password hashes and 2FA secrets should never be serialised to a client at
 * all — a single `include: { user: true }` in a Prisma query leaks them, which
 * is exactly how /hr/employees exposed every staff bcrypt hash, 2FA backup
 * codes, bank details and government IDs.
 *
 * This strips them from any JSON response regardless of which query produced
 * them, so the next careless `include` cannot reopen the hole.
 */

/** Never sent to a client, to anyone. */
const SECRET_FIELDS = [
  'passwordHash',
  'password',
  'tempPassword',
  'plainPassword',
  'currentPassword',
  'newPassword',
  'twoFaSecret',
  'twoFaBackupCodes',
  'clientSecret',
  'apiSecret',
  'privateKey',
  // Stashed unencrypted on the organization row. Handled explicitly by
  // GET /settings/organization, listed here so no other route that happens to
  // select the org row can serialise them.
  //
  // Note this is response-only (onSend) and matches whole keys, so the
  // `openAiKeyConfigured` / `resendApiKeyConfigured` booleans the router returns
  // instead of the values are unaffected.
  'openAiKey',
  'resendApiKey',
];

/**
 * Compensation and sensitive personnel data.
 *
 * Only rendered for callers holding `HR & Payroll` + `VIEW` — which in this
 * deployment means the HR and Management roles. Everyone else still gets the
 * rest of the employee record, they just don't receive salaries, bank details
 * or government ID numbers.
 */
const COMPENSATION_FIELDS = [
  'salary',
  'currency',
  'bankDetails',
  'governmentId',
  'bloodGroup',
  'emergencyContact',
  'basicSalary',
  'hra',
  'allowances',
  'grossSalary',
  'pfDeduction',
  'esiDeduction',
  'tdsDeduction',
  'otherDeductions',
  'netSalary',
];

const SECRET_NEEDLES = SECRET_FIELDS.map((f) => `"${f}"`);
const COMP_NEEDLES = COMPENSATION_FIELDS.map((f) => `"${f}"`);

function strip(value: any, fields: string[]): any {
  if (Array.isArray(value)) return value.map((v) => strip(v, fields));
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      if (fields.includes(k)) continue;
      out[k] = strip(v, fields);
    }
    return out;
  }
  return value;
}

function safeStringify(value: any): string {
  try {
    return JSON.stringify(value) || '';
  } catch {
    return '';
  }
}

const redactPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onSend', async (request, reply, payload) => {
    if (payload === null || payload === undefined) return payload;

    const isString = typeof payload === 'string';
    const haystack = isString ? (payload as string) : safeStringify(payload);
    if (!haystack) return payload;

    const hasSecret = SECRET_NEEDLES.some((n) => haystack.includes(n));
    const hasComp = COMP_NEEDLES.some((n) => haystack.includes(n));

    // Fast path: nothing sensitive in this payload at all.
    if (!hasSecret && !hasComp) return payload;

    // Only pay for the permission lookup when compensation data is present.
    let allowed = false;
    if (hasComp) {
      try {
        allowed = await canViewCompensation(fastify as any, request);
      } catch {
        allowed = false; // fail closed
      }
    }

    const fields = allowed ? SECRET_FIELDS : [...SECRET_FIELDS, ...COMPENSATION_FIELDS];
    if (!fields.some((f) => haystack.includes(`"${f}"`))) return payload;

    try {
      const parsed = isString ? JSON.parse(payload as string) : payload;
      const cleaned = strip(parsed, fields);
      return isString ? JSON.stringify(cleaned) : cleaned;
    } catch {
      // Unparseable body — leave it alone rather than corrupt the response.
      return payload;
    }
  });
};

export default fp(redactPlugin);
export { SECRET_FIELDS, COMPENSATION_FIELDS, strip };
