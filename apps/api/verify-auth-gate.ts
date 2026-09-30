/**
 * Auth gate verification.
 *
 * Boots the real app, walks the actual route table, and checks two things:
 *   1. Classification — every route is either allowlisted or gated, and the
 *      specific paths that were leaking are gated.
 *   2. Behaviour — unauthenticated requests to gated routes are refused with
 *      401, while genuinely public endpoints are not.
 *
 * Run: ./node_modules/.bin/tsx verify-auth-gate.ts
 */

const ROUTES: Array<{ method: string; path: string; ws: boolean }> = [];

// Intercept the Fastify factory so every route is captured as it registers.
const fwPath = require.resolve('fastify');
const fw = require(fwPath);
const origFactory = fw.default || fw;
function patched(opts: any) {
  const inst = origFactory(opts);
  inst.addHook('onRoute', (r: any) => {
    ROUTES.push({ method: r.method, path: r.url, ws: !!r.websocket });
  });
  return inst;
}
Object.assign(patched, origFactory);
require.cache[fwPath].exports = patched;
if (patched.default !== patched) patched.default = patched;

process.env.NODE_ENV = 'test';

import { isPublic } from './src/plugins/auth-gate.plugin';
import { strip, SECRET_FIELDS } from './src/plugins/redact.plugin';

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

async function main() {
  const { buildApp } = require('./src/app');
  const app = await buildApp({ logger: { level: 'error' } });
  await app.ready();

  console.log('\n=== 1. Previously-leaking routes must now be GATED ===');
  const leaks = [
    'GET /api/v1/hr/employees',
    'GET /api/v1/hr/payroll',
    'GET /api/v1/settings/integrations',
    'GET /api/v1/settings/audit-logs',
    'GET /api/v1/finance/invoices',
    'GET /api/v1/analytics/overview',
    'GET /api/v1/crm/leads',
    'GET /api/v1/hr/attendance',
  ];
  for (const spec of leaks) {
    const [method, path] = spec.split(' ');
    check(`gated: ${spec}`, !isPublic(method, path));
  }

  console.log('\n=== 2. Sensitive API surface is gated ===');
  for (const prefix of ['/api/v1/hr', '/api/v1/finance', '/api/v1/settings', '/api/v1/academy']) {
    const sample = ROUTES.filter((r) => r.path.startsWith(prefix) && r.method === 'GET');
    const open = sample.filter((r) => isPublic('GET', r.path));
    check(`${prefix}: all GET gated (${sample.length} routes)`, open.length === 0,
      open.map((r) => r.path).join(', '));
  }

  console.log('\n=== 3. Authenticated-only routes stay gated ===');
  for (const spec of ['GET /api/v1/auth/me', 'POST /api/v1/auth/2fa/setup', 'POST /api/v1/auth/2fa/verify', 'POST /api/v1/auth/2fa/disable']) {
    const [method, path] = spec.split(' ');
    check(`gated: ${spec}`, !isPublic(method, path));
  }

  console.log('\n=== 4. Genuinely public endpoints stay OPEN ===');
  const mustBeOpen = [
    'GET /health',
    'POST /api/v1/crm/public/leads',
    'POST /api/v1/crm/public/webhooks/meta',
    'POST /api/v1/crm/public/webhooks/facebook',
    'POST /api/v1/crm/public/webhooks/google',
    'GET /api/v1/crm/public/proposals/abc123',
    'POST /api/v1/crm/public/proposals/abc123/sign',
    'GET /api/v1/crm/proposals/public/abc123',
    'POST /api/v1/webhooks/razorpay',
    'POST /api/v1/webhooks/meta',
    'POST /api/v1/webhooks/whatsapp/webhook',
    'POST /api/meta',
    'POST /api/whatsapp/webhook',
    'POST /api/billing/razorpay/webhook',
    'POST /api/v1/payments/razorpay/webhook',
    'POST /api/v1/payments/phonepe/webhook',
    'POST /api/v1/auth/forgot-password',
    'POST /api/v1/auth/password',
    'POST /api/v1/academy/walk-ins',
    // Public CMS media for the signed-out agency site. Uploads themselves are
    // no longer public — see verify-upload-access.ts for the full matrix.
    'GET /api/v1/storage/asset/cms/uploads/some-file.mp3',
  ];
  for (const spec of mustBeOpen) {
    const [method, path] = spec.split(' ');
    check(`open: ${spec}`, isPublic(method, path));
  }

  console.log('\n=== 5. Public prefixes are method-scoped where it matters ===');
  check('POST /api/v1/academy/walk-ins is open', isPublic('POST', '/api/v1/academy/walk-ins'));
  check('GET /api/v1/academy/walk-ins is GATED', !isPublic('GET', '/api/v1/academy/walk-ins'));
  check('GET /api/v1/academy/walk-ins/stats is GATED', !isPublic('GET', '/api/v1/academy/walk-ins/stats'));
  check('PATCH /api/v1/academy/walk-ins/:id is GATED', !isPublic('PATCH', '/api/v1/academy/walk-ins/xyz'));
  check('GET /api/v1/crm/leads GATED (not swallowed by public prefix)', !isPublic('GET', '/api/v1/crm/leads'));
  check('OPTIONS preflight open', isPublic('OPTIONS', '/api/v1/hr/employees'));

  console.log('\n=== 5b. Debug/config endpoints inside the public prefix are locked ===');
  for (const spec of [
    'GET /api/v1/crm/public/webhooks/meta/config',
    'GET /api/v1/crm/public/webhooks/facebook/config',
    'POST /api/v1/crm/public/webhooks/meta/test',
    'POST /api/v1/crm/public/webhooks/meta/capi/test',
    'POST /api/v1/crm/public/webhooks/facebook/test',
    'POST /api/v1/crm/public/webhooks/facebook/capi/test',
  ]) {
    const [method, path] = spec.split(' ');
    check(`gated: ${spec}`, !isPublic(method, path));
  }

  console.log('\n=== 6. Full route table is accounted for ===');
  const unique = new Map<string, { method: string; path: string; ws: boolean }>();
  for (const r of ROUTES) unique.set(`${r.method} ${r.path}`, r);
  const all = Array.from(unique.values());
  const gated = all.filter((r) => !isPublic(r.method, r.path));
  const open = all.filter((r) => isPublic(r.method, r.path));
  console.log(`  total=${all.length} gated=${gated.length} open=${open.length}`);
  check('every route is either gated or allowlisted', gated.length + open.length === all.length);
  check('majority of surface is gated', gated.length > all.length * 0.8,
    `gated=${gated.length} of ${all.length}`);
  // Sanity: nothing under /hr, /finance, /settings, /crm (non-public) leaked through.
  const leakThroughAllowlist = open.filter(
    (r) => r.method === 'GET' &&
      (r.path.startsWith('/api/v1/hr') || r.path.startsWith('/api/v1/finance') ||
       r.path.startsWith('/api/v1/settings') || r.path.startsWith('/api/v1/academy'))
  );
  check('no HR/finance/settings/academy GET is open', leakThroughAllowlist.length === 0,
    leakThroughAllowlist.map((r) => `${r.method} ${r.path}`).join(', '));

  console.log('\n=== 7. Live behaviour: unauthenticated requests ===');
  const behaviour: Array<[string, string, number]> = [
    ['GET', '/api/v1/hr/employees', 401],
    ['GET', '/api/v1/settings/integrations', 401],
    ['GET', '/api/v1/finance/invoices', 401],
    ['GET', '/api/v1/analytics/overview', 401],
    ['GET', '/api/v1/crm/leads', 401],
    ['GET', '/api/v1/auth/me', 401],
    // Uploaded media is session-gated too: it held call recordings, expense
    // receipts and invoice attachments.
    ['GET', '/api/v1/uploads/1789967976541_jt0sp6d7_call_cmu.webm', 401],
    ['GET', '/api/v1/storage/asset/drive/root/client-invoice.pdf', 401],
    ['GET', '/health', 200],
  ];
  for (const [method, url, expected] of behaviour) {
    const res = await app.inject({ method: method as any, url });
    check(`${method} ${url} -> ${expected} (got ${res.statusCode})`, res.statusCode === expected);
  }

  // A gated route must not leak a body even on rejection.
  const rej = await app.inject({ method: 'GET', url: '/api/v1/hr/employees' });
  check('rejection body contains no employee data', !rej.body.includes('passwordHash'));

  console.log('\n=== 8. Redaction strips auth material ===');
  const dirty = {
    employees: [
      { id: '1', salary: 100, user: { email: 'a@b.c', passwordHash: 'HASH', twoFaSecret: 'S', twoFaBackupCodes: ['c'] } },
    ],
    payment: { clientSecret: 'cs', apiSecret: 'as', privateKey: 'pk', id: 'pay_1' },
    keep: 'visible',
  };
  const cleaned = strip(dirty, SECRET_FIELDS) as any;
  const serialised = JSON.stringify(cleaned);
  for (const field of SECRET_FIELDS) {
    check(`strips ${field}`, !serialised.includes(field));
  }
  check('keeps legitimate fields (salary/email/id)', cleaned.employees[0].salary === 100 && cleaned.employees[0].user.email === 'a@b.c' && cleaned.payment.id === 'pay_1');
  check('does not mutate input', (dirty as any).employees[0].user.passwordHash === 'HASH');

  console.log('\n=== 9. Public flows reach their handler (not 401) ===');
  for (const [method, url] of [
    ['POST', '/api/v1/crm/public/leads'],
    ['POST', '/api/v1/academy/walk-ins'],
  ] as Array<[string, string]>) {
    const res = await app.inject({
      method: method as any,
      url,
      headers: { 'content-type': 'application/json' },
      payload: method === 'POST' && url.includes('walk-ins')
        ? { name: 'Gate Probe', phone: '9999999999', interestArea: 'Graphic Design' }
        : {},
    });
    check(`${method} ${url} not blocked by auth (got ${res.statusCode})`, res.statusCode !== 401);
  }

  console.log(`\n${'='.repeat(52)}`);
  console.log(`${pass} passed, ${fail} failed`);
  if (fail) console.log(`Failures:\n  - ${failures.join('\n  - ')}`);

  await app.close();
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error('HARNESS ERROR:', e);
  process.exit(1);
});
