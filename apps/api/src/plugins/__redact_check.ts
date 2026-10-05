/**
 * Unit check for redact-secrets.plugin.
 * Run with: pnpm exec tsx src/plugins/__redact_check.ts
 */
import Fastify from 'fastify'
import redactSecretsPlugin from './redact-secrets.plugin'

async function main() {
  const app = Fastify()
  await app.register(redactSecretsPlugin)

  app.get('/leak', async () => ({
    employees: [
      {
        id: 'emp_1',
        name: 'Asha',
        user: {
          id: 'u1',
          email: 'asha@example.com',
          role: 'STAFF',
          passwordHash: '$2b$10$SUPERSECRET',
          twoFaSecret: 'JBSWY3DPEHPK3PXP',
          twoFaBackupCodes: '["a","b"]',
        },
      },
    ],
    nested: { deeper: { user: { id: 'u2', passwordHash: 'NESTED_HASH_SENTINEL', twoFaSecret: 'NESTED_TOTP_SENTINEL' } } },
    keepMe: 'untouched',
  }))

  const res = await app.inject({ method: 'GET', url: '/leak' })
  const body = JSON.parse(res.body)
  const raw = JSON.stringify(body)

  const checks: [string, boolean][] = [
    ['passwordHash key stripped', !raw.includes('passwordHash')],
    ['twoFaSecret key stripped', !raw.includes('twoFaSecret')],
    ['twoFaBackupCodes key stripped', !raw.includes('twoFaBackupCodes')],
    ['hash value absent from wire', !raw.includes('SUPERSECRET')],
    ['TOTP seed absent from wire', !raw.includes('JBSWY3DPEHPK3PXP')],
    ['nested relation hash stripped', !raw.includes('NESTED_HASH_SENTINEL')],
    ['nested relation TOTP stripped', !raw.includes('NESTED_TOTP_SENTINEL')],
    ['nested non-sensitive id retained', body.nested.deeper.user.id === 'u2'],
    ['non-sensitive id kept', body.employees[0].user.id === 'u1'],
    ['non-sensitive email kept', body.employees[0].user.email === 'asha@example.com'],
    ['non-sensitive role kept', body.employees[0].user.role === 'STAFF'],
    ['unrelated fields kept', body.keepMe === 'untouched'],
    ['array length preserved', body.employees.length === 1],
  ]

  let failed = 0
  for (const [name, ok] of checks) {
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`)
    if (!ok) failed++
  }

  // Cycle safety: a self-referential object must not hang or throw.
  // A second instance, because inject() boots the first one.
  const app2 = Fastify()
  await app2.register(redactSecretsPlugin)
  app2.get('/cycle', async () => {
    const a: Record<string, unknown> = { id: 'a' }
    a.self = a
    a.user = { passwordHash: 'nope' }
    return a
  })
  const cyc = await app2.inject({ method: 'GET', url: '/cycle' })
  const cycOk = cyc.statusCode === 200 && !cyc.body.includes('nope')
  console.log(`${cycOk ? 'PASS' : 'FAIL'}  self-referential payload handled`)
  if (!cycOk) failed++

  console.log(failed === 0 ? '\nALL REDACTION CHECKS PASSED' : `\n${failed} CHECK(S) FAILED`)
  process.exit(failed === 0 ? 0 : 1)
}

main()