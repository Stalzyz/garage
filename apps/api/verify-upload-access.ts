/**
 * Upload / CMS-media access verification.
 *
 * Covers the second half of the exposure fix:
 *   - /api/v1/uploads/* is no longer public (call recordings, receipts, invoices)
 *   - /api/v1/storage/asset/cms/ stays public so agency.grekam.in still renders
 *   - /api/v1/storage/asset/<other> requires a session
 *   - uploaded HTML/SVG is never served as active content (stored XSS)
 *
 * Run: ./node_modules/.bin/tsx verify-upload-access.ts
 */

process.env.NODE_ENV = 'test';

import { isPublic } from './src/plugins/auth-gate.plugin';
import { isInlineSafeUpload, isActiveContentType } from './src/utils/upload-content-type';

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

const ANY = 'ANY';
function pub(method: string, path: string) {
  return isPublic(method, path.split('?')[0]);
}

async function main() {
  console.log('\n=== 1. /api/v1/uploads/* is now private ===');
  // The real call recording that was fetchable anonymously on production.
  check(
    'call recording webm is NOT public',
    !pub('GET', '/api/v1/uploads/1789967976541_jt0sp6d7_call_cmuasoerl0001sah9a9gl08mo_1789967976385.webm')
  );
  check('uploads png is NOT public', !pub('GET', '/api/v1/uploads/1790061295642_86eam3j5_ChatGPTImage.png'));
  check('uploads jpeg receipt is NOT public', !pub('GET', '/api/v1/uploads/1790682449149_ewtl7o3n_WhatsAppImage.jpeg'));
  check('uploads prefix bare is NOT public', !pub('GET', '/api/v1/uploads/'));
  check('uploads HEAD is NOT public', !pub('HEAD', '/api/v1/uploads/anything.webm'));
  // Static routes only answer GET/HEAD; a method escape would be a bypass.
  check('uploads DELETE is NOT public', !pub('DELETE', '/api/v1/uploads/anything.webm'));
  check('uploads with query string is NOT public', !pub('GET', '/api/v1/uploads/a.webm?x=1'));

  console.log('\n=== 2. Agency site keeps working (public CMS media) ===');
  check('cms png is public', pub('GET', '/api/v1/storage/asset/cms/uploads/abc-123_portfolio.png'));
  check('cms nested key is public', pub('GET', '/api/v1/storage/asset/cms/uploads/deep/abc_image.jpg'));
  check('cms webp is public', pub('GET', '/api/v1/storage/asset/cms/x.webp'));

  console.log('\n=== 3. R2 bucket is not published wholesale ===');
  // The bucket also holds client documents; only the cms/ prefix is public.
  check('non-cms asset is NOT public', !pub('GET', '/api/v1/storage/asset/drive/root/client-invoice.pdf'));
  check('invoices asset is NOT public', !pub('GET', '/api/v1/storage/asset/invoices/secret.pdf'));
  check('bare asset root is NOT public', !pub('GET', '/api/v1/storage/asset/'));
  // Prefix confusion must not slip through.
  check('cmsevil/ is NOT public', !pub('GET', '/api/v1/storage/asset/cmsevil/x.png'));
  check('cms-evil/ is NOT public', !pub('GET', '/api/v1/storage/asset/cms-evil/x.png'));
  check('traversal-ish key is NOT public', !pub('GET', '/api/v1/storage/asset/../drive/root/x.pdf'));

  console.log('\n=== 4. Genuinely public endpoints still public ===');
  check('health still public', pub('GET', '/health'));
  check('crm public still public', pub('POST', '/api/v1/crm/public/leads'));
  check('webhooks still public', pub('POST', '/api/v1/webhooks/meta'));
  check('razorpay webhook still public', pub('POST', '/api/v1/payments/razorpay/webhook'));
  check('walk-in POST still public', pub('POST', '/api/v1/academy/walk-ins'));
  check('walk-in GET still private', !pub('GET', '/api/v1/academy/walk-ins'));
  check('crm public /config still private', !pub('GET', '/api/v1/crm/public/config'));
  check('capi test still private', !pub('POST', '/api/v1/crm/public/capi/test'));
  check('OPTIONS preflight still public', pub('OPTIONS', '/api/v1/uploads/a.webm'));
  check('ws deferred', pub('GET', '/api/v1/ws'));

  console.log('\n=== 5. Uploaded active content is served as a download ===');
  for (const f of ['logo.svg', 'invoice.html', 'page.htm', 'x.xhtml', 'evil.js', 'x.xml', 'a.php', 'noext']) {
    check(`${f} is NOT inline-safe`, !isInlineSafeUpload(`/uploads/${f}`), 'would render as active content');
  }
  for (const f of ['a.png', 'a.jpg', 'a.jpeg', 'a.webp', 'a.gif', 'rec.webm', 'v.mp4', 'x.pdf', 'a.m4a', 'a.mp3']) {
    check(`${f} IS inline-safe`, isInlineSafeUpload(`/uploads/${f}`));
  }
  // Case and trailing-dot tricks must not flip the decision.
  check('A.HTML blocked', !isInlineSafeUpload('/uploads/A.HTML'));
  check('a.png.php blocked (double extension)', !isInlineSafeUpload('/uploads/a.png.php'));
  // The last extension wins, which is what the browser's own sniffing uses.
  check('a.pdf.png is safe (last ext is png)', isInlineSafeUpload('/uploads/a.pdf.png'));
  // Pathological names have no usable extension, so default-deny rejects them.
  check('a.pdf. blocked (no usable ext)', !isInlineSafeUpload('/uploads/a.pdf.'));
  check('trailing slash path blocked', !isInlineSafeUpload('/uploads/dir/'));

  console.log('\n=== 6. Content-type classifier ===');
  check('text/html active', isActiveContentType('text/html'));
  check('image/svg+xml active', isActiveContentType('image/svg+xml'));
  check('application/javascript active', isActiveContentType('application/javascript'));
  check('text/xml active', isActiveContentType('text/xml; charset=utf-8'));
  check('image/png not active', !isActiveContentType('image/png'));
  check('video/webm not active', !isActiveContentType('video/webm'));
  check('application/pdf not active', !isActiveContentType('application/pdf'));
  check('undefined not active', !isActiveContentType(undefined));

  console.log('\n=== 7. Real @fastify/static instance applies the headers ===');
  // Proves the option names are real and the headers reach the response,
  // rather than trusting that `setHeaders` is spelled correctly.
  const Fastify = require('fastify');
  const fastifyStatic = require('@fastify/static').default;
  const fs = require('fs');
  const os = require('os');
  const path = require('path');

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'upl-'));
  fs.writeFileSync(path.join(dir, 'xss.html'), '<script>alert(1)</script>');
  fs.writeFileSync(path.join(dir, 'logo.svg'), '<svg onload="alert(1)"></svg>');
  fs.writeFileSync(path.join(dir, 'ok.png'), 'not-really-a-png');
  fs.writeFileSync(path.join(dir, 'rec.webm'), 'not-really-a-webm');

  const sapp = Fastify({ logger: false });
  await sapp.register(fastifyStatic, {
    root: dir,
    prefix: '/static/',
    list: false,
    index: false,
    dotfiles: 'deny',
    setHeaders(res: any, filePath: string) {
      res.header('X-Content-Type-Options', 'nosniff');
      if (!isInlineSafeUpload(filePath)) {
        res.header('Content-Type', 'application/octet-stream');
        res.header('Content-Disposition', 'attachment');
      }
    },
  });

  const fetchStatic = async (name: string) => {
    const r = await sapp.inject({ method: 'GET', url: `/static/${name}` });
    return { status: r.statusCode, ct: r.headers['content-type'] as string, cd: r.headers['content-disposition'] as string, nosniff: r.headers['x-content-type-options'] as string };
  };

  const html = await fetchStatic('xss.html');
  check('html served 200', html.status === 200, String(html.status));
  check('html forced to octet-stream', (html.ct || '').includes('application/octet-stream'), html.ct);
  check('html forced to attachment', (html.cd || '').includes('attachment'), html.cd);
  check('html carries nosniff', html.nosniff === 'nosniff', String(html.nosniff));

  const svg = await fetchStatic('logo.svg');
  check('svg forced to attachment (no inline script)', (svg.cd || '').includes('attachment'), `${svg.ct} / ${svg.cd}`);
  check('svg not served as image/svg+xml', !(svg.ct || '').includes('svg'), svg.ct);

  const png = await fetchStatic('ok.png');
  check('png keeps its own content type', (png.ct || '').includes('image/png'), png.ct);
  check('png not forced to download', !(png.cd || '').includes('attachment'), png.cd);
  check('png still carries nosniff', png.nosniff === 'nosniff');

  const webm = await fetchStatic('rec.webm');
  check('call recording .webm still streams inline', (webm.ct || '').includes('video/webm'), webm.ct);

  const dirList = await sapp.inject({ method: 'GET', url: '/static/' });
  // @fastify/static answers a directory request with 403 when `list: false`
  // (404 on some versions). The property that matters is that no listing and
  // no filename comes back — assert that, not the exact code.
  check('directory listing is refused', dirList.statusCode !== 200, String(dirList.statusCode));
  check('directory body leaks no filenames', !dirList.body.includes('xss.html') && !dirList.body.includes('ok.png'), dirList.body.slice(0, 80));

  await sapp.close();
  fs.rmSync(dir, { recursive: true, force: true });

  console.log(`\n${'='.repeat(48)}`);
  console.log(`${pass} passed, ${fail} failed`);
  if (fail) console.log(`Failures:\n  - ${failures.join('\n  - ')}`);
  process.exit(fail ? 1 : 0);
}

main().catch((e) => {
  console.error('HARNESS ERROR:', e);
  process.exit(1);
});
