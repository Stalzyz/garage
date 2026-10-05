import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { authenticateRequest } from './auth.plugin';

/**
 * Deny-by-default authentication gate.
 *
 * WHY: the API previously relied on each module remembering to apply
 * `requireAuth`. 17 of 23 modules never did, so /hr/employees,
 * /settings/integrations and /finance/* served staff PII, integration
 * ciphertext and payroll totals to unauthenticated callers. Per-module opt-in
 * cannot stay safe as the surface grows, so the default is now "closed" and
 * anything genuinely public is listed explicitly below.
 *
 * Everything not matched here requires a valid session. When adding a new
 * public endpoint (webhook, public form, tokenised view) add it to
 * PUBLIC_PREFIXES / PUBLIC_EXACT deliberately — that is the point.
 */

/** Any HTTP method, path starts with this prefix. */
const PUBLIC_PREFIXES: string[] = [
  // Public lead capture, token-scoped proposal views, ad-platform webhooks.
  '/api/v1/crm/public/',
  // Tokenised proposal view + e-sign (public/:token).
  '/api/v1/crm/proposals/public/',
  // Razorpay / Meta / WhatsApp callbacks.
  '/api/v1/webhooks/',

  // Public CMS media ONLY, for portfolio/section images on unauthenticated
  // marketing pages. NOTE: apps/web/app/agency does not exist in this repo, so
  // re-check this allowance against the real pages once that route is built.
  //
  // Scoped to the `cms/` prefix deliberately: /storage/asset/* is a wildcard
  // over the whole R2 bucket, which also holds client documents and invoices.
  // Widening this to the full route would publish those to the internet.
  // Every other /asset/ key, and all of /uploads/, now requires a session.
  '/api/v1/storage/asset/cms/',
  // Audio call recordings for in-browser playback in CRM
  '/api/v1/uploads/recordings/',
];

const ANY = 'ANY';

/** method ('ANY' for all) + exact path. */
const PUBLIC_EXACT: Array<{ method: string; path: string }> = [
  // Liveness probe.
  { method: ANY, path: '/health' },

  // Organization public branding & identity (safe, sanitized non-sensitive fields)
  { method: 'GET', path: '/api/v1/settings/organization' },

  // Meta + WhatsApp callbacks are mounted on /api as well as /api/v1/webhooks.
  { method: ANY, path: '/api/meta' },
  { method: ANY, path: '/api/whatsapp/webhook' },

  // Payment gateway callbacks.
  { method: 'POST', path: '/api/billing/razorpay/webhook' },
  { method: 'POST', path: '/api/v1/payments/razorpay/webhook' },
  { method: 'POST', path: '/api/v1/payments/phonepe/webhook' },

  // Password recovery runs while the user is signed out.
  { method: 'POST', path: '/api/v1/auth/forgot-password' },
  { method: 'POST', path: '/api/v1/auth/password' },

  // Public kiosk on academy.grekam.in submits a walk-in.
  // NOTE: only POST. GET/PATCH on this path list and edit captured walk-ins.
  { method: 'POST', path: '/api/v1/academy/walk-ins' },
];

/**
 * Paths inside a public prefix that are NOT actually public.
 *
 * These sit under /api/v1/crm/public/ but are operator/debug affordances:
 *   - `/config`    returns the Meta webhook verify token and whether an access
 *                   token is configured.
 *   - `/test`      triggers real Conversions API events, so leaving them open
 *                   lets anyone burn Meta quota or inject fake events.
 */
const PUBLIC_PREFIX_EXCLUDE_SUFFIXES = ['/config', '/test', '/capi/test'];

/** Handled separately (WebSocket handshake cannot use a normal reply), so it is
 * skipped here to avoid stalling the upgrade; see app.ts. */
const DEFERRED_PATHS = new Set(['/api/v1/ws']);

/** CORS preflight is answered by @fastify/cors before this hook runs. */
function isPublic(method: string, pathname: string): boolean {
  const upper = String(method || 'GET').toUpperCase();
  if (upper === 'OPTIONS') return true;
  if (DEFERRED_PATHS.has(pathname)) return true;

  const matchedPrefix = PUBLIC_PREFIXES.find((p) => pathname.startsWith(p));
  if (matchedPrefix) {
    const excluded = PUBLIC_PREFIX_EXCLUDE_SUFFIXES.some(
      (s) => pathname === `${matchedPrefix}${s.replace(/^\//, '')}` || pathname.endsWith(s)
    );
    if (!excluded) return true;
  }

  return PUBLIC_EXACT.some((r) => r.path === pathname && (r.method === ANY || r.method === upper));
}

const authGatePlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook('onRequest', async (request, reply) => {
    const pathname = request.url.split('?')[0];
    if (isPublic(request.method, pathname)) return;

    const result = await authenticateRequest(request);
    if (!result.ok) {
      return reply
        .code(result.statusCode)
        .header('WWW-Authenticate', 'Session')
        .send({ error: 'Unauthorized', message: result.message });
    }
    request.user = result.user;
  });
};

export default fp(authGatePlugin);
export { isPublic, PUBLIC_PREFIXES, PUBLIC_EXACT, PUBLIC_PREFIX_EXCLUDE_SUFFIXES };
