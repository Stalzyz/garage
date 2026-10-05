/**
 * End-to-end check of the password recovery flow against a disposable database.
 * Calls the REAL Next route handlers directly (no HTTP server) so the actual
 * Prisma queries, hashing, token claiming and session revocation all run.
 *
 * This file deliberately lives OUTSIDE apps/api/src: the API tsconfig sets
 * rootDir to src, and importing the web route handlers across the app boundary
 * would break `pnpm --filter @grekam/api build`.
 *
 * Run it from apps/web so the `@/` alias resolves, against a throwaway database:
 *
 *   cd apps/web
 *   DATABASE_URL="postgresql://<user>:<pass>@localhost:5432/<throwaway>?schema=public" \
 *     ../api/node_modules/.bin/tsx ../../tests/security/reset-flow.check.ts
 */
import { createHash, randomBytes } from 'crypto'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '../../packages/db/src/index'

// Own client instance for the probe; the route handlers create their own.
const prisma = new PrismaClient()

const MIN_PASSWORD_LENGTH = 12

let passed = 0
let failed = 0

function check(name: string, ok: boolean, extra = '') {
  if (ok) {
    passed++
    console.log(`PASS  ${name}`)
  } else {
    failed++
    console.log(`FAIL  ${name}${extra ? ` — ${extra}` : ''}`)
  }
}

function jsonRequest(body: unknown): Request {
  return new Request('http://localhost/api/auth/test', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

async function main() {
  const email = `reset-probe-${Date.now()}@example.com`
  const oldPassword = 'OriginalPassw0rd!'

  const user = await prisma.user.create({
    data: {
      email,
      firstName: 'Reset',
      lastName: 'Probe',
      passwordHash: await bcrypt.hash(oldPassword, 12),
      status: 'ACTIVE',
      role: 'STAFF',
    },
  })
  await prisma.session.create({
    data: { userId: user.id, token: randomBytes(24).toString("hex"), expiresAt: new Date(Date.now() + 86400000) },
  })

  // Import the handlers only after DATABASE_URL is set by the caller.
  const resetRoute = await import('../../apps/web/app/api/auth/reset-password/route.ts')
  const forgotRoute = await import('../../apps/web/app/api/auth/forgot-password/route.ts')

  // ---------------------------------------------------------------- forgot
  const unknown = await forgotRoute.POST(jsonRequest({ email: 'does-not-exist@example.com' }))
  const unknownBody = await unknown.json()
  check('forgot: unknown email returns 200 (no enumeration)', unknown.status === 200, `got ${unknown.status}`)
  check('forgot: unknown email leaks no token', !JSON.stringify(unknownBody).includes('token'))

  const known = await forgotRoute.POST(jsonRequest({ email }))
  const knownBody = await known.json()
  check('forgot: known email returns 200', known.status === 200, `got ${known.status}`)
  check(
    'forgot: identical generic body for known vs unknown',
    JSON.stringify(knownBody) === JSON.stringify(unknownBody),
    `${JSON.stringify(knownBody)} vs ${JSON.stringify(unknownBody)}`
  )

  const rows = await prisma.passwordResetToken.findMany({ where: { userId: user.id } })
  check('forgot: exactly one token row created', rows.length === 1, `got ${rows.length}`)
  check('forgot: only the hash is stored, not the raw token', !!rows[0]?.tokenHash)
  check(
    'forgot: expiresAt is ~15 min out',
    rows[0] ? Math.abs(rows[0].expiresAt.getTime() - (Date.now() + 15 * 60 * 1000)) < 60000 : false
  )

  // Requesting again must invalidate the previous token (newest link wins).
  await forgotRoute.POST(jsonRequest({ email }))
  const afterSecond = await prisma.passwordResetToken.findMany({ where: { userId: user.id } })
  const usedCount = afterSecond.filter((r) => r.usedAt !== null).length
  check('forgot: re-request burns the earlier token', usedCount === 1, `used=${usedCount}`)

  // ---------------------------------------------------------------- reset
  // The raw token only ever exists in the email, so mint one directly to
  // exercise the verification logic that the emailed link relies on.
  const rawToken = randomBytes(32).toString('base64url')
  const tokenHash = createHash('sha256').update(rawToken).digest('hex')
  const record = await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
  })

  const noToken = await resetRoute.POST(jsonRequest({ newPassword: 'BrandNewPassw0rd!' }))
  check('reset: missing token rejected', noToken.status === 400, `got ${noToken.status}`)

  const tooShort = await resetRoute.POST(jsonRequest({ token: rawToken, newPassword: 'short' }))
  check('reset: short password rejected', tooShort.status === 400, `got ${tooShort.status}`)
  check('reset: enforces 12-char minimum', String((await tooShort.json()).error).includes('12'))

  const wrongToken = await resetRoute.POST(jsonRequest({ token: 'not-the-token', newPassword: 'BrandNewPassw0rd!' }))
  check('reset: wrong token rejected', wrongToken.status === 400, `got ${wrongToken.status}`)

  const stillOld = await prisma.user.findUnique({ where: { id: user.id } })
  check(
    'reset: password untouched by failed attempts',
    (await bcrypt.compare(oldPassword, stillOld!.passwordHash)) === true
  )

  const newPassword = 'BrandNewPassw0rd!2026'
  const ok = await resetRoute.POST(jsonRequest({ token: rawToken, newPassword }))
  const okBody = await ok.json()
  check('reset: valid token accepted', ok.status === 200, `${ok.status} ${JSON.stringify(okBody)}`)

  const after = await prisma.user.findUnique({ where: { id: user.id } })
  check('reset: new password verifies', (await bcrypt.compare(newPassword, after!.passwordHash)) === true)
  check('reset: old password no longer works', (await bcrypt.compare(oldPassword, after!.passwordHash)) === false)

  const consumed = await prisma.passwordResetToken.findUnique({ where: { id: record.id } })
  check('reset: token marked used', consumed?.usedAt !== null)

  const sessions = await prisma.session.count({ where: { userId: user.id } })
  check('reset: all sessions revoked', sessions === 0, `sessions=${sessions}`)

  const replay = await resetRoute.POST(jsonRequest({ token: rawToken, newPassword: 'AnotherPassw0rd!2026' }))
  check('reset: replay of consumed token rejected', replay.status === 400, `got ${replay.status}`)

  // Expired token.
  const expiredRaw = randomBytes(32).toString('base64url')
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: createHash('sha256').update(expiredRaw).digest('hex'),
      expiresAt: new Date(Date.now() - 1000),
    },
  })
  const expired = await resetRoute.POST(jsonRequest({ token: expiredRaw, newPassword: 'AnotherPassw0rd!2026' }))
  check('reset: expired token rejected', expired.status === 400, `got ${expired.status}`)

  // Suspended account must not be recoverable.
  const suspRaw = randomBytes(32).toString('base64url')
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: createHash('sha256').update(suspRaw).digest('hex'),
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    },
  })
  await prisma.user.update({ where: { id: user.id }, data: { status: 'SUSPENDED' } })
  const susp = await resetRoute.POST(jsonRequest({ token: suspRaw, newPassword: 'AnotherPassw0rd!2026' }))
  check('reset: suspended account refused', susp.status === 403, `got ${susp.status}`)

  await prisma.user.delete({ where: { id: user.id } })

  console.log(`\n${passed} passed, ${failed} failed`)
  process.exit(failed === 0 ? 0 : 1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})