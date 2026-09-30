/**
 * Settings consolidation + org-settings key-leak verification.
 *
 * Covers the removal of the duplicate "Organization & Branding" page:
 *   1. GET /settings/organization no longer returns openAiKey / resendApiKey.
 *   2. The fields that page uniquely owned survive somewhere else.
 *   3. The global redaction hook independently strips both keys, so the fix does
 *      not rest on a single router remembering to destructure.
 *   4. `openAiKeyConfigured` / `resendApiKeyConfigured` survive redaction.
 *
 * Run: ./node_modules/.bin/tsx verify-org-settings.ts
 */

process.env.NODE_ENV = 'test';

import Fastify from 'fastify';
import { SECRET_FIELDS, strip } from './src/plugins/redact.plugin';
import organizationRouter from './src/settings/organization.router';

let pass = 0;
let fail = 0;
const failures: string[] = [];

function check(name: string, condition: boolean, detail = '') {
  if (condition) {
    pass++;
    console.log(`  PASS  ${name}`);
  } else {
    fail++;
    failures.push(name);
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

/** A populated org row, secrets included, as Prisma would return it. */
function orgRow() {
  return {
    id: 'org_1',
    name: 'Garage',
    companyName: 'Grekam Visuals and Technologies Pvt Ltd',
    panNumber: 'AAJCG1234F',
    gstNumber: '33AABCG1234F1Z5',
    logoUrl: '/visuals-logo.png',
    faviconUrl: '/favicon.ico',
    academyLogoUrl: '/academy-logo.png',
    academyFaviconUrl: '/favicon.ico',
    primaryColor: '#2DA16D',
    secondaryColor: '#7c3aed',
    accentColor: '#10b981',
    darkModeDefault: true,
    supportEmail: 'contact@grekam.in',
    billingAddress: 'Coimbatore, Tamil Nadu, India',
    website: 'https://grekam.in',
    phone: '+919840012345',
    instagramUrl: 'https://instagram.com/grekamvisuals',
    youtubeUrl: 'https://youtube.com/@grekamvisuals',
    linkedinUrl: 'https://linkedin.com/company/grekam',
    twitterUrl: null,
    facebookUrl: null,
    whatsappNumber: '+919840012345',
    bankName: 'HDFC Bank',
    accountName: 'Grekam Visuals and Technologies Pvt Ltd',
    accountNumber: '50200012345678',
    ifscCode: 'HDFC0001234',
    swiftCode: 'HDFCINBBXXX',
    bankBranch: 'Anna Salai',
    openAiKey: 'sk-live-REALSECRET0123456789',
    resendApiKey: 're_live_REALSECRET0123456789',
  };
}

/** Boot the real router against a stub prisma. */
async function boot() {
  const app = Fastify({ logger: false });
  const stored = orgRow();
  (app as any).decorate('prisma', {
    organization: {
      findFirst: async () => stored,
      create: async () => stored,
      update: async ({ data }: any) => ({ ...stored, ...data }),
    },
  });
  await app.register(organizationRouter as any, { prefix: '/api/v1/settings' });
  await app.ready();
  return { app, stored };
}

async function main() {
  console.log('\n=== 1. GET /settings/organization does not leak the keys ===');
  const { app } = await boot();
  const res = await app.inject({ method: 'GET', url: '/api/v1/settings/organization' });
  const body = res.json();
  const raw = res.body;

  check('responds 200', res.statusCode === 200, `got ${res.statusCode}`);
  check('openAiKey is not the value', body.openAiKey === undefined, `openAiKey=${body.openAiKey}`);
  check('resendApiKey is not the value', body.resendApiKey === undefined, `resendApiKey=${body.resendApiKey}`);
  check('raw body contains no sk- key', !raw.includes('sk-live-REALSECRET'), 'leaked OpenAI secret');
  check('raw body contains no re_ key', !raw.includes('re_live_REALSECRET'), 'leaked Resend secret');
  check('no key appears under any spelling',
    !/sk-[A-Za-z0-9]/.test(raw) && !/re_[A-Za-z0-9]{4}/.test(raw));

  console.log('\n=== 2. Configured flags replace the values ===');
  check('openAiKeyConfigured is true', body.openAiKeyConfigured === true);
  check('resendApiKeyConfigured is true', body.resendApiKeyConfigured === true);

  console.log('\n=== 3. The removed page\'s unique fields all survive ===');
  // Legal/tax identity — previously duplicated by the removed page.
  for (const f of ['companyName', 'panNumber', 'gstNumber']) {
    check(`${f} still returned`, Boolean(body[f]), `${f}=${body[f]}`);
  }
  // Brand palette — drives --org-primary via OrganizationContext.
  for (const f of ['primaryColor', 'secondaryColor', 'accentColor']) {
    check(`${f} still returned`, Boolean(body[f]), `${f}=${body[f]}`);
  }
  // Public channels.
  for (const f of ['instagramUrl', 'youtubeUrl', 'linkedinUrl', 'whatsappNumber']) {
    check(`${f} still returned`, Boolean(body[f]), `${f}=${body[f]}`);
  }
  // Bank settlement — the only place these were editable before the merge.
  for (const f of ['bankName', 'accountName', 'accountNumber', 'ifscCode', 'swiftCode', 'bankBranch']) {
    check(`${f} still returned`, Boolean(body[f]), `${f}=${body[f]}`);
  }
  // Logos/favicons, which the in-page Branding tab already covered.
  for (const f of ['logoUrl', 'faviconUrl', 'academyLogoUrl', 'academyFaviconUrl']) {
    check(`${f} still returned`, Boolean(body[f]), `${f}=${body[f]}`);
  }

  console.log('\n=== 4. The global hook strips them independently ===');
  // Even without the router's destructure, the response hook must remove them.
  check('openAiKey is in SECRET_FIELDS', SECRET_FIELDS.includes('openAiKey'));
  check('resendApiKey is in SECRET_FIELDS', SECRET_FIELDS.includes('resendApiKey'));
  const stripped = strip(orgRow(), SECRET_FIELDS);
  check('strip() removes openAiKey', stripped.openAiKey === undefined);
  check('strip() removes resendApiKey', stripped.resendApiKey === undefined);
  check('strip() keeps everything else', stripped.gstNumber === '33AABCG1234F1Z5');

  console.log('\n=== 5. The configured flags are not collateral damage ===');
  // Needle matching includes the closing quote, so the *Configured booleans
  // must not be treated as the secret fields.
  const flagged = strip(
    { openAiKeyConfigured: true, resendApiKeyConfigured: false, gstNumber: 'X' },
    SECRET_FIELDS
  );
  check('openAiKeyConfigured survives', flagged.openAiKeyConfigured === true);
  check('resendApiKeyConfigured survives', flagged.resendApiKeyConfigured === false);
  check('whole-key match, not substring',
    !SECRET_FIELDS.some((f) => '"openAiKeyConfigured"'.includes(`"${f}"`)));

  console.log('\n=== 6. Nesting is handled ===');
  const nested = strip({ org: orgRow(), list: [orgRow()] }, SECRET_FIELDS);
  check('nested object stripped', nested.org.openAiKey === undefined);
  check('array element stripped', nested.list[0].resendApiKey === undefined);
  check('nested siblings intact', nested.org.gstNumber === '33AABCG1234F1Z5');

  await app.close();

  console.log(`\n${'='.repeat(48)}`);
  console.log(`${pass} passed, ${fail} failed`);
  if (fail) console.log(`Failures:\n  - ${failures.join('\n  - ')}`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error('HARNESS ERROR:', e);
  process.exit(1);
});
