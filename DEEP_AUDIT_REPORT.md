# grekam-os — Deep Audit Report

**Date:** 2026-10-05
**Scope:** `apps/web`, `apps/academy-web`, `apps/api`, `apps/mobile`, `packages/*`
**Method:** static analysis (`tsc`, `eslint`, `next build`, `turbo`), route/link enumeration, authenticated + anonymous live HTTP probing against the running API (`:4000`) and web (`:8888`), and Playwright-driven browser E2E.
**Environment restored:** throwaway `garage_saas` DB dropped; `grekam_os` verified unmodified (12 users). No tracked file was changed.

---

## Verdict

**Login is 100% broken in the running web app, and the API is effectively unauthenticated.**

These are not style issues. Two independent Critical findings mean the product as committed cannot authenticate a single user and exposes the entire data model to anonymous callers. A third Critical class (tracked production credentials) means the blast radius extends past this repository.

The repo also has **no working quality gate**: CI typechecks only `apps/mobile`, both Next apps set `typescript.ignoreBuildErrors: true`, `pnpm lint` and `pnpm test` both fail at the root, and the two most dangerous auth files are not even committed.

---

## Remediation status (branch `audit-fixes`)

Work applied after the audit below. Everything here is on branch `audit-fixes`,
which was created **on top of a pre-existing dirty tree** — the diff contains
that earlier work too, so review the diff before committing.

### Verified fixed

| ID | Fix | Evidence |
|----|-----|----------|
| C1 | Deleted `apps/web/app/portal/proposals/[id]/page.tsx`, leaving only `[token]`. The ambiguous dynamic segment was shadowing `/api/auth/[...nextauth]`, which is what made **every** login attempt return `/api/auth/error` 404. Public proposal reads now key off `publicToken` only, closing the IDOR. | Build manifest lists `/api/auth/[...nextauth]` and `/portal/proposals/[token]`, and **no** `proposals/[id]`. Web build exit 0. |
| C2 | Deny-by-default `onRequest` gate registered on the root instance *before* every router, so it covers all 116 routers rather than only the 17 that remembered `requireAuth`. `JWT_SECRET` no longer falls back to a default. WebSocket upgrade now authenticates and closes with 4401. | `apps/api/src/plugins/auth-gate.plugin.ts` |
| C3 | Added a global `preSerialization` hook that strips `passwordHash`, `twoFaSecret` and `twoFaBackupCodes` from **every** response at any nesting depth. This closes ~47 `include: { user: true }` call sites at once rather than by hand. | `apps/api/src/plugins/redact-secrets.plugin.ts`; **14/14** assertions in `pnpm --filter @grekam/api test` |
| C4 | Token-based recovery: only a SHA-256 hash is stored, 15-min TTL, single-use, constant-time compare, 12-char minimum, all sessions revoked on success, suspended/inactive accounts refused. Added the **missing** `/auth/reset-password` page the email links to, and fixed the reset URL origin (it previously defaulted to `localhost:3000`, but the app binds `:8888`, so the emailed link was dead). | **21/21** assertions against a real database — `tests/security/reset-flow.check.ts` |
| H2 | `/dashboard/admin/**` is now confined to `SUPER_ADMIN`/`PLATFORM_ADMIN` in middleware. Also stopped leaking the bind host into `callbackUrl` (`req.url` → `pathname`). | `apps/web/middleware.ts` |
| H3/H5 | WebSocket authenticates before upgrade (4401 otherwise); login queries require `status: ACTIVE`, and the API re-checks the user's status and DB-stored role on every request rather than trusting the JWT claims. | |
| H4 | Preview proxy restricted to platform admins, validates scheme + resolves DNS and rejects private/loopback/link-local/CGNAT ranges on every redirect hop. | `apps/api/src/lib/ssrf-guard.ts` |
| H8 | **Type errors eliminated, then the escape hatches removed.** Web 13 → 0, academy 23 → 0, API 0. `ignoreBuildErrors` deleted from both `next.config.ts`. CI now typechecks **and builds** all four packages plus validates the Prisma schema — previously it only checked `apps/mobile`. | `apps/api`, `apps/web`, `apps/academy-web` all typecheck 0 **and** build exit 0 |
| M1 | Six verified 404s addressed: `agency.grekam.in` rewrites removed (they pointed `/` at a non-existent `/agency`, 404ing every visitor on both hostnames); dead `workspace`/`lms` nav links removed; the `Preview Calculator` and `Continue Learning` buttons now render as explicitly disabled with a `title` explaining what to build, instead of 404ing. | Build manifest confirms the routes |
| M2/M4/M5/M6 | `.gitignore` hardened for `*.key`/`*.exp`/`.env.*` with negations; `pnpm-workspace.yaml` build approvals replaced with the real package list; dead `TURBOPACK=0` removed. | |

### Still open — do not consider these closed

- **H1 (tenant isolation) is NOT fixed.** ~709 direct `server.prisma`/`prisma` call sites still bypass the tenant-scoped client. `request.db` exists and the membership check is restored, but routing call sites through it was reverted: a codemod broke 118 type errors and was backed out. This is the largest remaining risk.
- **C5** — admin handlers are now guarded by `requireAdmin`, and the demo seeder requires `NODE_ENV != production` + `ALLOW_DEMO_SEED` + an explicit password — but the seeder route still exists in the tree.
- **C6** — nothing was rotated. `.gitignore` now stops new `.exp`/`.env` files being added, but the ~302 already-tracked files still contain live production credentials, and `ecosystem`/seed files still embed them. **This requires out-of-band action: rotate every exposed credential and purge history.**
- **H9** — Playwright's Chromium is now installed, but the harness was never repaired (missing `webServer` config, a stale global-setup import) and no E2E run has been executed.
- **M3/M7/M8/M9** and the bulk of the lint debt are untouched.

### Notes worth flagging

- **The API build OOMs on a default Node heap.** `tsc` aborts with "JavaScript heap out of memory" at ~2 GB. The package scripts set `NODE_OPTIONS=--max-old-space-size` (build 4 GB, typecheck 8 GB), so the scripts are fine, but anyone invoking bare `tsc` will hit a confusing crash. The type error load was the main cause; worth a follow-up.
- **SMTP is not configured**, so password-reset mail cannot send in this environment. `sendEmail` fails closed with an explicit error rather than silently no-opping, and the API still returns the generic response — but no reset link is ever delivered until `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS` are set.
- **No migration was generated.** The `PasswordResetToken` model exists in the schema, so `prisma db push` or `prisma migrate dev` must be run before deploy. `.gitignore` still ignores migration SQL, which is M2.

### Corrections to this report

- **H6 was wrong** and is retracted above: 2FA is genuinely implemented, not cosmetic.
- H7's "not committed" framing is a working-tree fact, not a code defect; treat it as a `git add` obligation.

---

## Severity summary

| Sev | Count | Theme |
|-----|-------|-------|
| **Critical** | 6 | Login fully broken; anonymous full-data API access; anonymous account takeover; anonymous DB seeding; plaintext production credentials in git |
| **High** | 9 | Broken tenant isolation; IDOR-style role bypass on admin pages; websocket data leak; SSRF; silent 2FA dead code; uncommitted auth bypass files; zero type-safety gate |
| **Medium** | 11 | Broken links; schema drift with no migrations; broken scripts; missing CI; lint debt |
| **Low** | 6 | Placeholder config, host leak in callback, duplicated configs, dead code |

---

# Critical

## C1 — Login is completely non-functional in the running app

**Root cause: two conflicting dynamic route segments abort the build.**

```
apps/web/app/portal/proposals/[id]/page.tsx
apps/web/app/portal/proposals/[token]/page.tsx
```

Next.js cannot resolve `/portal/proposals/[...]` and fails with `Ambiguous app routes detected`. Because the build never produces a valid route manifest, **every** NextAuth handler is dead.

Verified against the live server:

```
GET /api/auth/providers   -> 404
GET /api/auth/csrf        -> 404
GET /api/auth/session     -> 404
GET /api/auth/signin      -> 404
```

Browser-driven result (Playwright, real form fill + real click):

| Attempt | Final URL | Session cookie | Message shown to user |
|---|---|---|---|
| SUPER_ADMIN, correct password | `/api/auth/error` | **none** | **none** |
| SUSPENDED account | `/api/auth/error` | **none** | **none** |
| INACTIVE account | `/api/auth/error` | **none** | **none** |
| Wrong password | `/api/auth/error` | **none** | **none** |

The login page itself renders (`/auth/login` → HTTP 200, 1 form, 2 inputs, button "INITIALIZE SESSION"), so a user types correct credentials, clicks, and is silently bounced to a 404 with no explanation. Every failure mode is indistinguishable.

**Fix:** merge the two segments into one (`[token]`, or a single `[id]` that resolves both), then re-verify all five `/api/auth/*` endpoints return non-404.

---

## C2 — Anonymous callers can read and write nearly all API data

`apps/api/src/plugins/auth-gate.plugin.ts` is a deny-by-default gate that is **never registered**. `app.ts:139` registers only `authPlugin`; there is no `auth-gate` import anywhere.

Corroborating signal: **17 of 116** router files reference `requireAuth`.

Live anonymous results:

| Endpoint | Status | Impact |
|---|---|---|
| `GET /api/v1/hr/employees` | 200 | Full PII + secrets (see C3) |
| `POST /api/v1/hr/employees` | **201** | **Write** — created `injected@evil.test`, persisted |
| `GET /api/v1/finance/invoices` | 200 | Billing data |
| `GET /api/v1/settings/integrations` | 200 | Integration config |
| `GET /api/v1/vendors` | 200 | Vendor directory |
| `GET /api/v1/analytics/overview` | 200 | Business metrics |
| `GET /api/v1/workspace/dashboard` | 200 | Aggregate workspace data |

**Fix:** register the gate as the first preHandler plugin and make `requireAuth` mandatory-by-default rather than opt-in.

---

## C3 — Employee endpoint leaks password hashes and 2FA secrets

`GET /api/v1/hr/employees` returns, unauthenticated:

- `passwordHash`
- `twoFaSecret`
- 2FA backup codes
- salary / compensation
- bank details
- emergency contacts
- government ID numbers
- tenant and organization identifiers

With C2's anonymous write access, an attacker can create an employee whose `passwordHash` they choose, then log in as them.

**Fix:** never select `passwordHash` / `twoFaSecret` / backup codes in list handlers; add a global Prisma result extension that strips them.

---

## C4 — Anonymous full account takeover of any user

`apps/web/app/api/auth/forgot-password/route.ts` (tracked) resets the target's password and **returns it in the JSON response**.

```
POST /api/auth/forgot-password
{ "email": "<any user>" }
-> 200 { "success": true, "tempPassword": "<new plaintext password>" }
```

Verified end-to-end against a SUPER_ADMIN: response returned the new password, and `bcrypt.compare` confirmed it authenticates. No token, no email, no rate limit.

**Fix:** generate a random token, email it, store only a hash, expire in minutes, rate-limit, and never echo a credential in the response.

---

## C5 — Anonymous callers can seed a SUPER_ADMIN into the database

```
POST /api/admin/seed-demo        -> 200
GET  /api/admin/partners         -> 200
GET  /api/admin/plans            -> 200
POST /api/admin/plans            -> 200
GET  /api/admin/commissions      -> 200
GET  /api/admin/kyc              -> 200
GET  /api/admin/dashboard        -> 200
GET  /api/admin/garages          -> 200
GET  /api/admin/payments         -> 200
GET  /api/admin/activity         -> 200
```

`seed-demo` created `admin@grekam.com` with role `SUPER_ADMIN`, plus partner, wallet, and demo records — no authentication required.

**Fix:** require an authenticated SUPER_ADMIN on every `/api/admin/*` route and delete `seed-demo` from production builds.

---

## C6 — 302 tracked files contain the production VPS root password

```
302  .exp scripts tracked in git
264  of them contain the plaintext root SSH password
 64  contain PGPASSWORD=<superuser password>
 16  PGPASSWORD assignments
```

`git ls-files | grep '\.exp$'` → 302. These scripts also use `scp -o StrictHostKeyChecking=no` and hardcode VPS IPs.

**The same literal (`Photoshop09@`) is reused across three trust boundaries:**

- root SSH password in 264 `.exp` scripts
- Postgres superuser password in `ecosystem.config.js`
- SUPER_ADMIN app password in `packages/db/prisma/seed.ts:10`

`packages/db/prisma/seed.ts:15` uses `update: { passwordHash }`, so **re-running the seed resets `admin@grekam.in` to that known password.** `ecosystem.config.js` additionally hardcodes `JWT_SECRET` / `AUTH_SECRET` in tracked source.

**Fix (do these in order):** 1) rotate root SSH, DB superuser, JWT/AUTH secrets, and every seeded credential now; 2) purge the `.exp` scripts from git history; 3) move secrets to a secret manager; 4) change `update:` to `upsert` without password mutation, or gate seeding behind an explicit flag.

---

# High

## H1 — Tenant isolation is decorative

- `x-tenant-id` is trusted from the request and never validated against membership.
- `request.db` is set by the tenant plugin but used **once**; **79** call sites use `fastify.prisma` / `app.prisma` directly.
- Therefore `getTenantPrisma()` (`packages/db/src/tenant.ts`) protects essentially nothing.

Combined with C2, any anonymous caller can read or write any tenant's data by changing one header.

**Fix:** replace direct `fastify.prisma` usage with the tenant-scoped client and validate `x-tenant-id` against a real membership lookup.

## H2 — Low-privilege roles render admin pages (200)

Browser probe with forged sessions for each role:

| Role | `/dashboard/admin` | `/dashboard/admin/settings` | `/dashboard/admin/dashboard` |
|---|---|---|---|
| `PARTNER` | 404 | **200** | **200** |
| `RESELLER_ADMIN` | 404 | **200** | **200** |
| `VENDOR` | 404 | **200** | **200** |
| `STAFF` | 404 | **200** | **200** |

Plain `STAFF` loads both admin screens. `apps/web/middleware.ts` checks authentication but not role. (`/dashboard/admin` 404s only because no `page.tsx` index exists there — itself a broken link.)

## H3 — Unauthenticated WebSocket leaks live CRM data

`ws://127.0.0.1:4000/api/v1/ws` accepts connections with no credentials. After invoking public `POST /api/v1/crm/public/telephony/sync`, an anonymous socket received two live events containing lead name, phone number, call duration, and telecaller identity.

**Fix:** authenticate the upgrade request and drop the public telephony route or require a signed secret.

## H4 — SSRF into internal services

`apps/web/app/api/preview-proxy/route.ts` performs server-side fetches for arbitrary targets. Anonymous request to a loopback PostgreSQL address returned HTTP 200 — the proxy will reach anything the host can reach, including cloud metadata endpoints.

**Fix:** deny private/loopback/link-local ranges, require allowlisting, and restrict schemes to `http`/`https`.

## H5 — Disabled accounts can authenticate

`apps/web/auth.ts` `authorize()` (line 31) fetches the user at line 34 and compares the password at line 41. There is **no `status` check anywhere** in the file — no filter on the query and no post-fetch rejection. `SUSPENDED` and `INACTIVE` accounts authenticate normally. (The credential callback will never run in practice because of C1, so this is currently masked — it becomes exploitable the moment C1 is fixed.)

**Fix:** `where: { email, status: 'ACTIVE' }` plus an explicit post-check.

## H6 — 2FA is dead code — **RETRACTED, this finding was wrong**

> **Correction (post-audit).** This finding was incorrect and has been retracted.
> On re-inspection `apps/web/auth.ts:54-89` performs real TOTP verification: it
> throws `2FA_REQUIRED` when no code is supplied, validates the code with
> `OTPAuth.TOTP.validate({ window: 1 })`, and falls back to single-use backup
> codes (consuming each on use). The client completes the flow too —
> `apps/web/app/auth/login/page.tsx` holds `is2faStage`/`code` state, passes
> `code: code || ""` into `signIn("credentials", ...)`, and renders the
> verification stage. 2FA is wired end to end and is **not** cosmetic.
>
> The one genuine 2FA weakness was never this: it was that `twoFaSecret` and
> `twoFaBackupCodes` were readable from public endpoints (that is C3, now fixed).
>
> Residual, low severity: if `twoFaEnabled` is true while `twoFaSecret` is null,
> `OTPAuth.Secret.fromBase32(null)` throws and the login attempt fails with a
> server error rather than a clean prompt. Worth a null guard, not a rewrite.

## H7 — The auth bypass files are not even committed

```
apps/api/src/plugins/auth-gate.plugin.ts            UNTRACKED
apps/web/app/api/auth/demo-switch/route.ts          UNTRACKED
```

The deny-by-default gate and the demo-session minter are uncommitted local work. Anything that deploys from `git` has neither. `demo-switch` mints a valid session for any requested role and falls back to a hardcoded dev secret when `AUTH_SECRET` is unset.

## H8 — No type-safety gate anywhere

- `.github/workflows/ci.yml` runs `tsc --noEmit` for **only** `apps/mobile`.
- `apps/web/next.config.ts:145` → `typescript.ignoreBuildErrors: true`
- `apps/academy-web/next.config.ts:67` → `typescript.ignoreBuildErrors: true`

So real errors that would crash at runtime are silently skipped, including `useEffect is not defined` (a `ReferenceError` in `apps/academy-web/app/dashboard/academy/referrals/page.tsx`) and a `@prisma/client` import that Turbopack flags as unusable.

**Measured, currently invisible debt:**
- `apps/web` → 13 type errors
- `apps/academy-web` → 35 lines of `tsc` output
- `apps/web` `eslint` → **2071 problems (1242 errors, 829 warnings)**
- Root `pnpm lint` → **exit 1** (`@grekam/academy-web#lint`)
- Root `pnpm test` → **exit 1** (`@grekam/api#test` is `echo "Error: no test specified" && exit 1`)

Specific type errors: invalid Prisma fields in `apps/web/app/api/admin/garages/[id]/route.ts`, `apps/web/app/api/partner/settings/route.ts`, `apps/web/app/api/partner/support/route.ts`, `apps/web/app/api/admin/partners/[id]/whitelabel/route.ts`; course-builder action/type mismatches in `apps/academy-web/.../builder/[id]/actions.ts` and `BuilderClient.tsx`.

## H9 — Playwright has never been runnable, and its setup is stale

- `~/Library/Caches/ms-playwright/` was **empty** — no browser had ever been installed, so `pnpm test:e2e` had never passed locally.
- `tests/e2e/global-setup.ts` is unreferenced by `playwright.config.ts` and clicks a button labelled `INITIALIZE`, stale relative to the current `INITIALIZE SESSION` UI.
- Two independent suites exist (`playwright.config.ts` at root, `apps/e2e/playwright.config.ts`) with a storageState path mismatch.

---

# Medium

## M1 — Broken navigation links (live-verified 404s)

| Link | Source | Result |
|---|---|---|
| `/agency/calculator` | `apps/web/app/dashboard/cms/calculator-settings/page.tsx:100` | **HTTP 404** |
| `/workspace/projects` | `apps/web/app/workspace/layout.tsx:23` | **HTTP 404** |
| `/workspace/invoices` | `apps/web/app/workspace/layout.tsx:25` | **HTTP 404** |
| `/dashboard/lms/courses/:id` | `apps/web/app/portal/dashboard/page.tsx:1143` | route absent |
| `/dashboard/lms/assignments` | `apps/web/src/components/layout/sidebar.tsx:183` | route absent |

The `/workspace/*` links are in a layout, so they break on every workspace page. The two LMS links are unreachable in practice because no such route exists.

**Compounding:** `apps/web/next.config.ts` rewrites `/` → `/agency` on `agency.grekam.in`, but **no `app/agency` route exists**. And `apps/web/app/[slug]/page.tsx` is a single-segment catch-all, so many typos resolve to a CMS lookup or a 404 instead of a real page.

## M2 — No migrations, and live schema drift

`.gitignore` excludes Prisma migration SQL and **no migration directory exists**. The running `grekam_os` database is missing `users.activeTenantId`, `users.organizationId`, and `users.workspaceId`, which `packages/db/prisma/schema.prisma` declares. Any deploy that relies on migrations has no path to a correct schema; one that relies on `db push` silently mutates production.

## M3 — Database configuration mismatch

Before this audit the environment could not work: root `.env` had no `DATABASE_URL`, `apps/api` and `apps/web` pointed at a nonexistent `garage_saas`, `apps/academy-web` had no `DATABASE_URL` at all, while production config (`ecosystem.config.js`) pointed at `grekam_os`. Anyone cloning this repo and following the README hits a dead database connection.

## M4 — Credential backup files are not ignored

`.gitignore` covers `.env` but not `.env.bak-*` / `.env.backup-*`. Two such files exist untracked and would be committed by a `git add .`:

```
apps/api/.env.bak-20260930-130217
apps/api/.env.backup-20260930-130158
```

## M5 — `pnpm-workspace.yaml` build approvals are literal placeholders

```yaml
allowBuilds:
  '@prisma/client': set this to true or false
  esbuild: set this to true or false
  prisma: set this to true or false
```

These are unedited template strings, and `allowBuilds` is not even a pnpm 9 field (pnpm 10 uses `onlyBuiltDependencies`). The native postinstall approvals are therefore inert — which is presumably why Prisma/sharp behaviour differs per machine.

## M6 — `TURBOPACK=0` is a no-op

`apps/academy-web` build script sets `TURBOPACK=0 next build`, but the build log confirms `▲ Next.js 16.2.9 (Turbopack)`. The webpack fallback the author intended never happens on Next 16.

## M7 — Split TypeScript versions

Root pins `5.9.3` while `apps/api` resolves `6.0.3`. This produced a false `TS5103` during the audit before the API built cleanly on its local `6.0.3`. Non-reproducible type behaviour depending on which package invokes the compiler.

## M8 — Next 16 middleware deprecation

Both apps emit: `The "middleware" file convention is deprecated. Please use "proxy" instead.` Not breaking yet, but it will be.

## M9 — `app/dashboard/admin` has no index

There is no `page.tsx`; `/dashboard/admin` 404s while `/dashboard/admin/settings` and `/dashboard/admin/dashboard` return 200. Any link to the parent path breaks.

## M10 — Hardcoded external and internal URLs

Client code contains hardcoded absolute hostnames and internal addresses rather than `NEXT_PUBLIC_*` configuration, so environment targeting is unreliable and internal hosts leak into bundles.

## M11 — Root `pnpm test` cannot pass by design

`@grekam/api`'s `test` script is `echo "Error: no test specified" && exit 1`, which fails the whole Turbo pipeline even when other suites pass. Remove the placeholder or exclude it from the aggregate task.

---

# Low

| # | Finding | Location |
|---|---|---|
| L1 | Auth config is duplicated and divergent — two NextAuth configurations with different settings | `apps/web/auth.config.ts` vs `apps/web/src/auth.config.ts`; root `middleware.ts` imports the `src` copy |
| L2 | Duplicated app trees under `apps/web/` and `apps/web/src/` (and academy equivalents) invite editing the wrong file | `apps/web/app/**` vs `apps/web/src/app/**` |
| L3 | Internal bind host leaks into `callbackUrl`: `/auth/login?callbackUrl=http%3A%2F%2F0.0.0.0%3A8888%2F...` — the exact class of bug `demo-switch` was patched for | `apps/web/middleware.ts` |
| L4 | Fallback JWT secret used when `AUTH_SECRET` is unset, making tokens forgeable in that misconfiguration | `apps/web/app/api/auth/demo-switch/route.ts` |
| L5 | `next-auth` types declared in two files, one with an unused `NextAuth` import | `apps/web/types/next-auth.d.ts` |
| L6 | CommonJS `require()` in linted source | `apps/web/update_links.js` |

---

# Verified-good

Worth recording so the remediation doesn't regress these:

- `apps/api` **builds successfully** (exit 0) with its local TypeScript 6.0.3. The earlier root-TS `TS5103` was a tooling artifact, not an API defect.
- `apps/academy-web` **builds successfully** (exit 0) — but only because `ignoreBuildErrors` hides its 35 `tsc` problems (H8).
- `requireRole` exists and works as a helper in `auth.plugin.ts`; the gap is that H2's page-level checks and C2's route registration never call it.
- bcrypt password comparison in `apps/web/auth.ts:41` is correctly implemented; only the status gate is missing.
- Tenant scoping *logic* in `packages/db/src/tenant.ts` is sound — the failure is adoption (1 of 80 call sites).
- `grekam_os` production data was never modified by this audit.

---

# Remediation order

**Day 1 — stop the bleeding**
1. C6: rotate root SSH, DB superuser, JWT/AUTH secrets, seeded passwords. Purge `.exp` from history.
2. C4: disable or fix `forgot-password` immediately.
3. C5: put `/api/admin/*` behind authentication; remove `seed-demo`.
4. C3: strip `passwordHash`, `twoFaSecret`, backup codes from all read paths.

**Day 2 — restore login and close the API**
5. C1: resolve the `proposals/[id]` vs `[token]` collision; re-verify all `/api/auth/*` endpoints.
6. C2: register `auth-gate.plugin.ts`; make `requireAuth` default-on.
7. H5: enforce `status === 'ACTIVE'` in `authorize()`.
8. H4: lock down `preview-proxy` against private ranges.
9. H3: authenticate the WebSocket upgrade; close the public telephony route.

**Week 1 — isolation, roles, gates**
10. H1: migrate the 79 direct Prisma call sites to the tenant-scoped client; validate `x-tenant-id`.
11. H2: add role checks to `/dashboard/admin/**` in middleware.
12. H8: remove `ignoreBuildErrors` from both Next configs; add API + web typecheck and build to CI; make `pnpm lint`/`pnpm test` green.
13. H7: decide on `auth-gate.plugin.ts` and `demo-switch` — commit them or delete them.
14. H6: either wire real TOTP verification into `authorize()` or remove the 2FA UI.

**Week 2 — correctness and hygiene**
15. M1: fix the five broken links; add the `app/agency` route or drop the rewrite; remove or scope the `[slug]` catch-all.
16. M2/M3: generate and commit real migrations; reconcile `DATABASE_URL` across root/api/web/academy.
17. M4: extend `.gitignore` to `.env*` variants.
18. M5/M6/M7/M8: fix `allowBuilds`, drop `TURBOPACK=0`, pin one TypeScript version, migrate `middleware` → `proxy`.
19. H9: install Playwright browsers, wire `global-setup.ts`, reconcile the two suites.

---

# Residual unknowns

- The academy-side broken-link enumeration was truncated during the audit; M1 covers only the five links verified to completion. A full pass over `apps/academy-web`'s 66 routes is still outstanding.
- Production behavior was not tested — only the local `:4000` / `:8888` instances. C6's credential exposure implies production compromise regardless.
- `apps/mobile` was typechecked (CI-clean) but not runtime-tested; no device or emulator was available.