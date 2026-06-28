# MIKA site — deployment & operations

Reference for anyone (incl. Claude Code) working on this repo's deployment. No secrets in this file — it's committed. All secret values live in `.local/` (git-ignored): `admin-token.txt`, `supabase-mika-db.txt`, `resend-mika.txt`, `vercel-token.txt`.

## TL;DR — current state
- **Live:** https://mika-md.app (production, HTTPS/SSL valid). Also https://mika-tau.vercel.app.
- **Early-access flow** (form -> admin approve -> email -> download) is **LIVE and verified end-to-end** (smoke test 2026-06-28). DB, env vars, and the approval email (Resend) are all configured.
- **Email provider = Resend** (the old Loops path was replaced).

## ⚠️ CRITICAL: production is AHEAD of git — reconcile before pushing
- Production currently runs a **Vercel CLI deploy from the working tree**, not a git deploy. It contains the **Resend** version of `api/access-requests/[id]/decision.js`.
- The **committed** `decision.js` in git still has the **old Loops** code. Repo HEAD is behind production for that file.
- **The next `git push` to `main` auto-deploys from git and will REVERT the approval email to the unconfigured Loops path -> approval emails stop.**
- Reconcile (do this before any other push):
  1. `git checkout -- artifacts/mika-site/src/pages/home.tsx`  ← its working-tree copy is **truncated by OneDrive sync** (production is fine; it built from the committed version). Do NOT commit the truncated file.
  2. Verify the working-tree `decision.js` is intact: `node --check "api/access-requests/[id]/decision.js"` (should pass; it uses Resend).
  3. `git add "api/access-requests/[id]/decision.js" CLAUDE.md` then commit + push. After that, git == production and auto-deploy is safe again.

## Vercel project
- Account/team: **husam-hammami's projects** (`h.hammami@asm.net`). Team `team_lhZORya5rBNN2Ys6xKwl6Cp9`.
- Project: **mika** (`prj_FrYSoTFnKo6N8my5i95okklH6b8P`). Framework "Other", root = repo root, build from `vercel.json`. Functions run Node 24.
- Domains: `mika-md.app` (apex, Production), `mika-tau.vercel.app`.
- A no-expiry Vercel token (CLI/API) is in `.local/vercel-token.txt` (git-ignored — never commit).

## Build config (`vercel.json`) — don't break these
- `installCommand: "pnpm install --no-frozen-lockfile"` — **required** (root `package.json` has `pg`; committed lockfile lags -> a frozen install aborts with `ERR_PNPM_OUTDATED_LOCKFILE`).
- `buildCommand: "BASE_PATH=/ PORT=3000 pnpm --filter @workspace/mika-site run build"` — `vite.config.ts` throws without `BASE_PATH` + `PORT`.
- `outputDirectory: "artifacts/mika-site/dist/public"`; SPA rewrite to `/index.html` excluding `/api`.

## Backend — serverless functions (CommonJS, in `/api`)
- `POST /api/access-requests` — public submit (`firstName`, `email`, `profession`). Postgres-first idempotent upsert (`status=pending`). Then a **best-effort Loops contact** create that is GUARDED by `LOOPS_API_KEY` (unset -> skipped, harmless). Returns `{id, status}`.
- `GET  /api/access-requests` — admin-only (timing-safe cookie gate), `?status=` filter. Powers `/admin`.
- `POST /api/admin/login` — `{token}` vs `ADMIN_TOKEN` (SHA-256 + `timingSafeEqual`); sets `mika_admin` cookie.
- `POST /api/access-requests/[id]/decision` — admin; `{approve}`. Approve -> `status=approved` + sends ONE approval email **via Resend** (`POST https://api.resend.com/emails`), idempotent via `approval_email_sent_at` + Resend `Idempotency-Key: approve-<id>`. Reject -> `status=rejected`. Uses `RESEND_API_KEY` + `RESEND_FROM`; link = `${SITE_URL}/api/download`.
- `GET  /api/download` — public; 302 to the latest GitHub release `.exe` (verified: -> `MIKA-Setup-v3.0.120.exe`), else `INSTALLER_FALLBACK_URL`.
- Shared: `api/_db.js` (one `pg.Pool({max:1})`) and `api/_logic.js` (pure helpers, unit-tested in `tests/logic.test.cjs`).

## Database — dedicated Supabase project "mika"
- Project **mika**, ref `nvjuitsnaionolncbqjb`, region **us-east-1** (Free plan). **Data API disabled** at creation (we use direct `pg`, not PostgREST — removes the REST surface over the email PII).
- `access_requests` table **created + migrated 2026-06-28** (all columns: id, email[unique], created_at, first_name, profession, status default 'pending', decided_at, approval_email_sent_at, downloaded_at, download_count). PK on id, UNIQUE on email (the upsert needs `ON CONFLICT (email)`).
- **Connections (both in `.local/supabase-mika-db.txt`):**
  - Runtime `DATABASE_URL` = **Transaction pooler**, IPv4, port **6543** (serverless functions). Verified: parameterized queries work through it.
  - Migrations/DDL = **Session pooler**, IPv4, port **5432**.
  - Direct (`db.<ref>.supabase.co`) is **IPv6-only** — unusable from Vercel/sandbox; don't use it.
- Future schema changes: `pnpm --filter @workspace/db run push` with the **session-pooler** URL.

## Environment variables (Vercel -> project `mika` -> Settings; all Production+Preview)
Env changes require a redeploy to take effect.

| Var | Status | Purpose |
|---|---|---|
| `DATABASE_URL` | **SET** (Sensitive) | Supabase transaction pooler (6543) |
| `RESEND_API_KEY` | **SET** (Sensitive) | Resend send. Key name "mika-prod", Sending access |
| `RESEND_FROM` | **SET** | From address. Currently `MIKA <mika@noreply.herculesv2.com>` (a verified domain). See Email note. |
| `ADMIN_TOKEN` | **SET** (Sensitive) | the `/admin` password (value in `.local/admin-token.txt`) |
| `SITE_URL` | **SET** = `https://mika-md.app` | builds the email link (`${SITE_URL}/api/download`) |
| `INSTALLER_FALLBACK_URL` | **SET** | releases-page fallback for `/api/download` |
| `GITHUB_TOKEN` | optional (unset) | lifts GitHub API rate limit for `/api/download` |
| `GITHUB_REPO` | optional | default `husam-hammami/ai-mri-analyzer` (public; ships `MIKA-Setup-*.exe`) |
| `LOOPS_*` | **NOT USED** | superseded by Resend |

## Email (Resend) — decision RESOLVED (replaces the old Loops plan)
- The approval email is sent by `decision.js` via Resend. From = `RESEND_FROM`, link = `${SITE_URL}/api/download`.
- Resend account: **sam.hammami@gmail.com**. Currently-verified sending domain: **noreply.herculesv2.com** (the Hercules domain) — used so the test could reach any inbox immediately.
- **For MIKA-branded sending:** add `mika-md.app` in Resend -> it shows DKIM/SPF records -> add them in Vercel DNS for `mika-md.app` -> once verified, set `RESEND_FROM=MIKA <noreply@mika-md.app>` and redeploy.
- Idempotent: `approval_email_sent_at` gates re-sends; Resend `Idempotency-Key` = `approve-<id>`.

## Frontend (`artifacts/mika-site`, Vite + React + wouter)
- `EmailGate`: first name + email + profession -> "request received, pending" confirmation. Posts to `POST /api/access-requests`.
- `/admin` (`src/pages/admin.tsx`): password sign-in, then pending queue with Approve / Reject / Resend.
- Hero "Get MIKA — it's free" CTA scrolls to the EmailGate (verified live).
- `index.html` has absolute `og:image`/`og:url`/canonical for `https://mika-md.app`.

## Deploy & operate
- **Normal path:** push `main` -> auto-deploy production. (Only after reconciling `decision.js` — see the CRITICAL note.)
- **Manual deploy from working tree (used for the Resend hotfix):** Vercel CLI + token. Deploy from a **CLEAN tree** (`git archive HEAD | tar -x -C /tmp/x`, overlay only the changed files) — NOT the raw working tree (that uploaded 281MB of local assets and failed on the corrupted `home.tsx`). Env: `VERCEL_ORG_ID=team_lhZORya5rBNN2Ys6xKwl6Cp9 VERCEL_PROJECT_ID=prj_FrYSoTFnKo6N8my5i95okklH6b8P vercel deploy --prod --yes --token=<.local token> --archive=tgz`. The CLI call will exceed a 45s shell timeout; the deployment is created server-side and finishes — monitor in the dashboard.

## Smoke test — PASSED (2026-06-28)
Submitted the live form (`h.hammami@asm.net`) -> `201 pending` -> DB row id 1 -> Resend email **delivered (confirmed received)** -> `/api/download` -> `MIKA-Setup-v3.0.120.exe`. Test row id 1 left as `approved` in the queue (it's the owner's own email).

## Gotchas
- **OneDrive sync corruption:** this repo is OneDrive-synced. Whole-file writes through some tooling get **truncated / NUL-padded** in the git layer (hit `decision.js` and `home.tsx` this session). Before committing, verify changed blobs (`node --check`, `grep -qP '\x00'`). Safe pattern from the sandbox: write to `/tmp`, validate, then `cp` to the repo path and re-validate.
- **`home.tsx` is currently truncated in the working tree** — restore with `git checkout --` before committing (see CRITICAL).
- **Production ahead of git** for `decision.js` (see CRITICAL).
- **Two Vercel accounts:** project + `mika-md.app` are in the ASM account; a personal account holds the lapsed `miika-md.app` (double-i) — ignore it.
- **ICANN verification:** `mika-md.app` is a fresh registration — verify the registrant email if Vercel/ICANN asks, or it can be suspended.
- The legacy Express `artifacts/api-server` is NOT deployed (Vercel functions replaced it); `lib/db` is still used for the schema.

## Outstanding
1. **Reconcile git with production** (top priority): restore `home.tsx`, commit the Resend `decision.js` + this `CLAUDE.md`, push. Until then, do not push anything else to `main`.
2. (Optional) Verify `mika-md.app` in Resend + switch `RESEND_FROM` to `noreply@mika-md.app` for branding.
3. (Optional) Regenerate the API client / OpenAPI doc-drift nits (cosmetic; red `tsc` only).

## Deeper references in this repo
- `DEPLOY_EARLY_ACCESS.md` — early-access feature + endpoint detail.
- `DEPLOY_VERCEL.md` — original Vercel hosting/runbook notes.
