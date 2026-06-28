# Plan — Early-access approval (manual approve → emailed install link)

> Forged in /warcry (cartographer · pre-mortem · prior-art) → Rev 2 after /bulletproof.
> Status: Rev 2 — **Reviewed ✓ (bulletproof) VERDICT: SUFFICIENT** (round 2). Ready for /katana.
> 3 build-time residuals folded in (Phase 0 covers all deps; timing-safe digest compare; /admin route wiring).

## Goal
A visitor submits **first name + email + profession** on the site. The owner sees a **pending list**
(name + profession) and **approves or rejects** each. On approve, the person is **emailed a download link**
for MIKA. Done-when: an approved applicant gets the email and can download; a non-approved one doesn't get
the link from us; the owner runs it all by clicking Approve.

**Soft gate (locked):** the MIKA repo stays **public**, so the installer URL is shareable. Approval controls
**who we email**, not who can technically download. (Hard-gating needs a private repo → breaks the silent OTA
→ out of scope.)

## Approach (and why)
**Self-contained CommonJS Vercel functions + a direct `pg` client. Postgres = source of truth for the queue;
Loops = mailman only. Drizzle owns the schema/migration; it is NOT used at runtime.**

The only deployed backend is `api/access-requests.js` — a plain CommonJS Vercel function that writes to Loops
(`vercel.json:4` builds only `@workspace/mika-site`; `DEPLOY_VERCEL.md:24` confirms the Express api-server +
lib/db are unused by the deploy). New endpoints follow that proven pattern: each opens a `pg` Pool and runs
parameterized SQL.

**Grounding correction (was wrong in Rev 1):** the OpenAPI spec (`lib/api-spec/openapi.yaml`) defines only
`GET /access-requests`, `GET /access-requests/summary`, `POST /access-requests`, `GET /access-requests/{id}/download`
— there is **NO decision/approve endpoint**, and the legacy Express route has **no approval/status logic**.
So **approve/reject + the status machine + the transactional email is entirely NET-NEW code** (do not frame
it as "porting existing logic"). Consequence for the frontend contract (must-have #3): only the **public POST**
keeps using the generated client (add `firstName`/`profession` to `AccessRequestInput` + regenerate). The
**admin endpoints (login, list-with-status, decision) are hand-`fetch`ed** in the /admin screen — they will
NOT be in the generated client. (Adding them to the OpenAPI spec + regenerating is an option but more work
for an owner-only surface; hand-fetch is the recommended call. Pick one and don't claim codegen covers admin.)

**Rejected alternatives:** revive the unused Express api-server on Vercel (big infra change against the
migration); convert `api/` to TS + import Drizzle (no transpile/bundling config here, fights the live
self-contained pattern). Drizzle still owns the schema via `drizzle-kit push`.

## Phase 0 — PROVE `pg` resolves + bundles in a Vercel function (GATE — do this before anything else)
The whole approach rests on a root CommonJS `api/*.js` doing `require('pg')`. Verified today: `pg` is **not** a
root dependency (`package.json` deps = only `puppeteer-core`), **not** in root `node_modules`, and `.npmrc`
does **not** hoist (`auto-install-peers=false`, no `node-linker=hoisted`). The live function uses only native
`fetch` — there is **no precedent of a Vercel function here bundling a node_modules dep under pnpm's symlinked
layout**, which historically trips Vercel's file-tracing. If this fails, every DB endpoint dies at runtime
(`Cannot find module 'pg'`) while the old Loops path still "works" — a silent half-broken launch.
- Add `"pg"` to **root** `package.json` dependencies.
- Pin `"installCommand": "pnpm install"` in `vercel.json` and confirm the Vercel **Project Root = repo root**
  (not the mika-site subdir) so the root install runs.
- Deploy a throwaway `api/_dbcheck.js` that `require('pg')` and opens a Pool to `DATABASE_URL`; hit it on a
  **preview** deploy and confirm it resolves + connects. Only proceed once green; then delete it.
- **Named fallback if file-tracing misses the symlink:** add `node-linker=hoisted` to `.npmrc` (re-install),
  OR vendor pg via `vercel.json` `functions["api/**"].includeFiles`. Do not discover this in production.
- **The proof covers EVERY node_modules dep the functions `require`, not just `pg`** — if the rate-limiter
  ships (`@upstash/ratelimit`), prove it in the same `_dbcheck`. NOTE `.npmrc`/`pnpm-workspace.yaml:28` sets
  `minimumReleaseAge: 1440` → a freshly-published dep can't install for 24 h; add any new dep a day ahead or
  the build fails. (The stream-based body cap is the always-on floor; KV rate-limiting is best-effort on top.)

## Data & schema changes
Extend `access_requests` (`lib/db/src/schema/access-requests.ts`; today: `id` serial, `email` unique,
`createdAt`, `downloadedAt`, `downloadCount`). **All new columns nullable or defaulted** so `drizzle-kit push`
is non-destructive on the populated live table:
```ts
firstName:           text("first_name"),                            // nullable (old rows = null)
profession:          text("profession"),                            // nullable
status:              text("status").notNull().default("pending"),   // pending | approved | rejected
decidedAt:           timestamp("decided_at", { withTimezone: true }),
approvalEmailSentAt: timestamp("approval_email_sent_at", { withTimezone: true }),
// keep downloadedAt/downloadCount (harmless; per-user download tracking is out of scope, see below)
```
**Migration is a manual, ordered ops step (no automation exists):** run `pnpm --filter @workspace/db run push`
against prod `DATABASE_URL` **before** deploying the new code. `push` is safe **only because** every column is
nullable or defaulted (no NOT-NULL-without-default, no rename, no type change). **Never `push --force` on prod**
(it's in `lib/db/package.json` — destructive). Verify with `\d access_requests` before deploying.

## Endpoints (CommonJS Vercel functions; shared `api/_db.js`)
`api/_db.js` exports a **module-scope** `new Pool({ connectionString: DATABASE_URL, max: 1 })` reused across
warm invocations (NOT a Pool per request — serverless fan-out would exhaust Postgres `max_connections`;
must-have #4). Prefer the **pooled / pgbouncer** `DATABASE_URL` endpoint if the host offers one.

1. **`POST /api/access-requests`** *(modify existing)* — accept `{ firstName, email, profession }`. Validate:
   email regex (present); trim; `firstName` ≤ 50, `profession` ≤ 100. **Cap the body by streaming bytes and
   bailing past 10 KB** (the handler already streams chunks at `api/access-requests.js:32-34` — accumulate
   length; do NOT trust `Content-Length`, it's spoofable). **Write order: Postgres FIRST** (`INSERT … ON
   CONFLICT (email) DO UPDATE SET first_name=…, profession=…`, defaults `status='pending'` — idempotent
   resubmit, never 500), **then** best-effort Loops `contacts/create` (failure logged, non-fatal). Return
   `201 { id, status:"pending" }` (id is the Postgres serial → a `number`, matching the generated `AccessRequest`
   type). **Rate-limit** per-IP (Vercel KV / `@upstash/ratelimit`, ~5/min). Reuses the generated client.
2. **`POST /api/admin/login`** *(new)* — `{ token }` → `crypto.timingSafeEqual` vs `ADMIN_TOKEN` → set cookie
   `mika_admin` = the token value, **httpOnly, Secure, SameSite=Strict, Path=/** (so it's sent to every
   `/api/...` admin call; a narrow Path breaks the gate). Never localStorage, never token-in-URL. Wrong → 401.
3. **`GET /api/access-requests`** *(new, admin-only)* — **every protected function re-validates** by
   `crypto.timingSafeEqual(cookie.mika_admin, ADMIN_TOKEN)` (not "cookie present" — that's bypassable; this is
   the email-list-leak class, and the old unauth `/access` dump was killed for exactly this reason,
   `DEPLOY_VERCEL.md:17-19`). **`timingSafeEqual` THROWS on a length mismatch** → hash both sides to equal
   length (compare SHA-256 digests) or length-check first, so a wrong-length/forged cookie returns a clean
   401, never an uncaught 500. Returns `[{ id, firstName, profession, email, status, createdAt, decidedAt,
   approvalEmailSentAt }]`, filter `?status=pending`.
4. **`POST /api/access-requests/[id]/decision`** *(new, admin-only — same timing-safe gate)* — `{ approve }`.
   - Approve → `status='approved'`, `decided_at=now()`. **Idempotent:** send the email only if
     `approval_email_sent_at IS NULL`. Send via **Loops Transactional** (`POST
     https://api.loops.so/api/v1/transactional`, `transactionId="approve-<id>"`, `dataVariables:{ firstName,
     downloadUrl }`); on success set `approval_email_sent_at=now()`. On Loops failure leave it NULL and surface
     "email not sent — Resend" in the UI.
   - Reject → `status='rejected'`, `decided_at=now()`. No email.
5. **`GET /api/download`** *(new, public — soft gate)* — GitHub `GET /repos/husam-hammami/ai-mri-analyzer/
   releases/latest` with `Authorization: Bearer GITHUB_TOKEN` (5000/hr vs 60/hr unauth — **the token is the
   real rate-limit mitigation**). Pick asset: `name.endsWith('.exe') && !name.includes('.blockmap') &&
   !name.toLowerCase().includes('portable')`; `302` to its `browser_download_url`. On any error/no-release →
   302 to `INSTALLER_FALLBACK_URL` (releases page). An in-memory cache is **per-cold-start/ephemeral on Vercel
   — best-effort only, not a real defense**; rely on the token (optionally Vercel KV for a real cache later).
   This is the `downloadUrl` emailed in step 4 (`https://<SITE_URL>/api/download`). Generic latest link (no
   per-user token) — `downloadedAt/downloadCount` stay unused; per-user download analytics is out of scope.

## Frontend (artifacts/mika-site)
- **`EmailGate.tsx`** — add `firstName` + `profession` inputs (trim + maxLength; React escapes on render).
  Submit now → **pending, not instant-unlock**: replace the `sessionStorage mika_unlocked`/`mika_access_id`
  flow + the now-meaningless summary/list query invalidations (`EmailGate.tsx:54-57`) with a calm
  confirmation: *"Thanks {firstName} — we'll review and email you a download link."* Keep using the generated
  `useCreateAccessRequest` for the public POST.
- **New `/admin` route** (`App.tsx`) — wire a `<Route path="/admin">` into the existing wouter `<Switch>`
  (today only `/` + NotFound; the `vercel.json` SPA rewrite already serves `/admin`). Password box → `POST /api/admin/login` (hand-`fetch`, credentials:
  'include'); then the pending list with Approve/Reject (hand-`fetch` the admin endpoints — they're not in the
  generated client). Show per-row status (Pending → Approved · emailed ✓ / email-failed → **Resend** /
  Rejected). Resend re-triggers the decision send for approved-but-unsent rows.
- **OpenAPI/codegen** — add `firstName`+`profession` to `AccessRequestInput`, regenerate (`pnpm --filter
  @workspace/api-spec run codegen`). Admin endpoints stay hand-fetched (don't claim codegen covers them).

## Test & verification
- **In-session (deterministic):** unit tests for validation + SQL (upsert dedupe, status transitions,
  idempotent approve), the GitHub asset filter, and the **admin gate returning 401 without a valid cookie**
  (timing-safe). Mock Loops + GitHub. `pnpm run typecheck` clean; build mika-site.
- **Owner / real (not in-session):** Phase-0 `_dbcheck` preview; `drizzle-kit push` prod; submit a real form;
  approve in /admin; confirm the Loops email arrives with a link that lands on the latest installer; confirm
  the list endpoint 401s when logged out.

## Rollout & rollback
0. Phase-0 pg-bundling gate green on preview. 1. nullable/defaulted columns → `push` prod. 2. Deploy modified
`POST /api/access-requests` (backward-compatible). 3. Deploy admin + decision + download functions + /admin UI.
4. Set the Loops transactional template + env vars. Rollback: endpoints are additive; reverting frontend +
functions leaves the table intact (extra nullable columns are harmless). No destructive migration.

## Risks → mitigations (pre-mortem)
pg-not-bundled → **Phase 0 gate + named fallback**. · Loops/Postgres desync → Postgres-first, Loops
best-effort (Loops non-authoritative). · Form abuse/DoS → **stream-based** body cap + length caps + per-IP
rate-limit. · Email-dup 500 → ON CONFLICT upsert. · Email-list leak / unauth approve → **timing-safe cookie
gate in every protected fn, Path=/**. · Silent approval-email failure → `approval_email_sent_at` + status +
Resend. · Double-approve → idempotent on `approval_email_sent_at` + `transactionId`. · GitHub rate limit →
**token** (+ fallback URL; in-memory cache is best-effort only). · Asset/draft → strict `.exe` filter +
`/releases/latest` skips drafts + fallback. · NOT NULL on live rows → nullable/defaulted columns. · Conn
exhaustion → module-scope `Pool({max:1})` + pooled URL. · Migration-not-run → ordered (push before deploy). ·
XSS → escape on render + caps.

## Out of scope
Hard download gating / private repo (breaks OTA). · Per-user tokenized download links + download analytics
(schema supports it later; not built). · Team/multi-admin auth, OAuth, magic-link. · License validation. ·
Loops sender warmup (ops, not code). · Reviving the Express api-server.

## Success criteria (restated)
Owner sees a name+profession pending list, clicks Approve, the applicant gets a Loops email with a working
`/api/download` link to the latest installer; the list is unreachable without a valid admin cookie
(timing-safe); the public form can't be spammed into a 500 or memory blow-up; existing email-only rows + the
live handler survive the migration.

## Owner hand-off (env + one-time setup)
- `DATABASE_URL` *(exists)* — prod Postgres; run `pnpm --filter @workspace/db run push` once (prefer pooled URL).
- `LOOPS_API_KEY` *(exists)* — also the transactional send.
- **`ADMIN_TOKEN`** *(new)* — long random admin password.
- **`GITHUB_TOKEN`** *(new, recommended)* — fine-grained read-only, for `/api/download` 5000/hr.
- **`SITE_URL`** *(new)* — builds the email `downloadUrl`.
- **`INSTALLER_FALLBACK_URL`** *(new)* — releases page, used if the GitHub call fails.
- Optional KV (`@upstash/ratelimit` / Vercel KV) for the form rate-limit.
- **Loops:** one **Transactional template** (Download button using `{{ downloadUrl }}` + `{{ firstName }}`);
  put its transactional id in the decision function.
- **Vercel:** `installCommand: pnpm install`, Project Root = repo root (Phase 0).
