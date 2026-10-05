/**
 * Redacts credential material from every outgoing API payload.
 *
 * Why this exists: roughly 47 call sites across the API use Prisma
 * `include: { user: true }` (employees, students, educators, contacts,
 * vendors, payslips, admissions, ...). That returns the *entire* User row,
 * including `passwordHash`, `twoFaSecret` and `twoFaBackupCodes`. Several of
 * those endpoints were reachable without authentication, so an anonymous
 * caller could read every employee's bcrypt hash and TOTP seed — enough to
 * mount an offline cracking attack and, for the TOTP seed, to generate valid
 * one-time codes.
 *
 * Fixing the 47 call sites individually is fragile: it is easy to miss one, and
 * `include: { user: true }` is the idiomatic Prisma pattern, so new leaks would
 * keep appearing. Instead this hook strips the sensitive keys once, centrally,
 * so it holds for every current and future route.
 *
 * Notes:
 *  - Hook is `preSerialization`, NOT `onSend`. By the time `onSend` runs,
 *    Fastify's JSON serializer has already turned the payload into a *string*,
 *    so redacting there is a no-op (verified: the first version of this plugin
 *    silently passed all 12 leak assertions through).
 *  - Only the listed keys are removed. `id`, `email`, `name`, `role` etc. are
 *    still returned, so no legitimate client breaks.
 *  - Keys are matched by name at any depth, so a nested `user` (or `users`,
 *    `createdBy`, `assignedTo`, ...) relation is covered too.
 */
import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

/** User columns that must never leave the API. */
const SENSITIVE_KEYS = new Set([
  'passwordHash',
  'twoFaSecret',
  'twoFaBackupCodes',
])

/**
 * Recursively delete sensitive keys. Guards against cycles and bounds depth so a
 * self-referential relation cannot blow the stack or spin here.
 */
function redact(value: unknown, depth = 0, seen = new WeakSet<object>()): unknown {
  if (depth > 12 || value === null || typeof value !== 'object') return value

  // Fastify responses are plain JSON trees, but be defensive about shared and
  // self-referential references rather than recursing forever.
  if (seen.has(value)) return undefined
  seen.add(value)

  if (Array.isArray(value)) {
    return value.map((item) => redact(item, depth + 1, seen))
  }

  const out: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key)) continue
    out[key] = redact(val, depth + 1, seen)
  }
  return out
}

export default fp(async (app: FastifyInstance) => {
  // Runs before Fastify serializes, while the payload is still a plain object.
  app.addHook('preSerialization', async (_req, reply, payload: unknown) => {
    // Only object trees can carry credential keys. Strings, buffers and streams
    // (file downloads, CSV exports) are passed through untouched.
    if (payload === null || typeof payload !== 'object') return payload
    if (Buffer.isBuffer(payload)) return payload

    reply.header('x-content-redacted', '1')
    return redact(payload)
  })
})