/**
 * Verification harness for inspectProviderBody() — the guard that stops
 * "HTTP 200 but Meta rejected it" from being reported as delivered.
 *
 * Run: npx tsx verify-whatsapp-verdict.ts
 */
import { inspectProviderBody } from './src/integrations/whatsapp.service';

let pass = 0;
let fail = 0;

function check(name: string, body: any, expect: { ok: boolean; confirmed?: boolean }) {
  const v = inspectProviderBody(body);
  const okMatch = v.ok === expect.ok;
  const confirmedMatch = expect.confirmed === undefined || v.confirmed === expect.confirmed;
  if (okMatch && confirmedMatch) {
    pass++;
    console.log(`  PASS  ${name}  -> ok=${v.ok} confirmed=${v.confirmed}`);
  } else {
    fail++;
    console.log(
      `  FAIL  ${name}  -> got ok=${v.ok} confirmed=${v.confirmed}, expected ok=${expect.ok}` +
        (expect.confirmed !== undefined ? ` confirmed=${expect.confirmed}` : '') +
        (v.error ? `  (error: ${v.error})` : '')
    );
  }
}

console.log('\n=== 1. Real production payload: Grafty HTTP 400 with Meta #132001 ===');
// From /root/.pm2/logs/grekam-os-api-error.log
check(
  'grafty 400 body',
  { error: 'WhatsApp API Rejection', details: '(#132001) Template name does not exist in the translation' },
  { ok: false }
);

console.log('\n=== 2. MUST be failures (the "lying 200" cases) ===');
check('200 + success:false', { success: false, error: 'template not approved' }, { ok: false });
check('200 + status:failed', { status: 'failed', details: 'undeliverable' }, { ok: false });
check('200 + status:rejected', { status: 'rejected', error: 'policy block' }, { ok: false });
check('200 + error object', { error: { code: 131026, message: 'Message undeliverable' } }, { ok: false });
check('200 + nested data.success=false', { data: { success: false, error: 'meta rejected' } }, { ok: false });
check('200 + errors array', { errors: [{ message: 'Template does not exist' }] }, { ok: false });
check('200 + failure wording in message', { message: 'WhatsApp API Rejection' }, { ok: false });
check('200 + error_code 132001', { error_code: 132001, message: 'Template name does not exist' }, { ok: false });

console.log('\n=== 3. MUST be real successes ===');
check('success:true + id', { success: true, messageId: 'wamid.XYZ' }, { ok: true, confirmed: true });
check('status:sent', { status: 'sent', message_id: 'wamid.ABC' }, { ok: true, confirmed: true });
check('nested data.success:true', { data: { success: true, wamid: 'wamid.DEF' } }, { ok: true, confirmed: true });
check('success:true at top, id nested', { success: true, data: { id: 'wamid.GHI' } }, { ok: true, confirmed: true });

console.log('\n=== 4. Inconclusive -> allowed through but NOT claimed as delivered ===');
check('empty object', {}, { ok: true, confirmed: false });
check('friendly message, no marker', { message: 'Message queued for delivery' }, { ok: true, confirmed: false });
check('unparseable / null', null, { ok: true, confirmed: false });
check('unrecognised status', { status: 'processing' }, { ok: true, confirmed: false });

console.log(`\n=== RESULT: ${pass} passed, ${fail} failed ===\n`);
process.exit(fail > 0 ? 1 : 0);
