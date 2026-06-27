# Early-access approval — deploy & hand-off

Manual-approval gate: visitor submits **first name + email + profession** → owner sees a
**pending queue** at `/admin` → **Approve** emails a download link via Loops; **Reject** doesn't.
Postgres is the source of truth; Loops is the mailman. Soft gate by design (the MIKA repo is
public, so the installer link is shareable; approval controls who we *email*).

## Verified in-session
- **Phase 0 (pg bundling):** `@vercel/nft` (Vercel's own tracer) pulls `pg` through pnpm's
  symlinked layout — 51 pg files incl. `pg/lib/index.js`, `pg-pool`, `pg-protocol`. Only optional
  `pg-native` / `cloudflare:sockets` warnings (pg degrades gracefully). **No `node-linker=hoisted`
  or `includeFiles` fallback needed.**
- `pnpm run typecheck:libs` ✓ · mika-site `typecheck` ✓ · mika-site production `build` ✓ ·
  8/8 unit tests ✓ (`node --test tests/`) · all functions load + export a handler ✓.

## Your ordered steps (the parts I can't do from here)

**1. Push**
```
git push origin main
```
(Commit is already made locally.)

**2. Phase 0 runtime check (preview) — GATE before prod**
After Vercel builds a preview, hit `https://<preview>.vercel.app/api/_dbcheck`.
Expect `{ "ok": true, "pgResolved": true, "db": "connected", ... }`. (Set `DATABASE_URL` on the
preview env first.) Once green, delete the probe:
```
git rm api/_dbcheck.js && git commit -m "chore: remove phase-0 db probe" && git push
```

**3. Migrate the DB (before deploying the new code to prod)**
```
pnpm --filter @workspace/db run push      # against prod DATABASE_URL; prefer the pooled URL
```
All new columns are nullable/defaulted, so this is non-destructive on the live table. Verify with
`\d access_requests`. **Never `push --force` on prod.**

**4. Vercel env vars** (Production + Preview)
| Var | Status | Purpose |
|---|---|---|
| `DATABASE_URL` | exists | Postgres (use the **pooled/pgbouncer** endpoint) |
| `LOOPS_API_KEY` | exists | contact create + transactional send |
| `ADMIN_TOKEN` | **new** | long random string; the `/admin` password |
| `LOOPS_TRANSACTIONAL_ID` | **new** | id of the Loops transactional template (step 5) |
| `SITE_URL` | **new** | builds the email link, e.g. `https://mika.app` → `…/api/download` |
| `GITHUB_TOKEN` | **new, rec.** | fine-grained read-only; lifts GitHub 60/hr → 5000/hr |
| `INSTALLER_FALLBACK_URL` | **new** | releases page, used if the GitHub call fails |
| `GITHUB_REPO` | optional | defaults to `husam-hammami/ai-mri-analyzer` |
| `LOOPS_USER_GROUP` | optional | contact tag, default `early-access` |

**5. Loops transactional template**
Create one transactional email with a Download button using `{{ downloadUrl }}` and `{{ firstName }}`.
Put its id in `LOOPS_TRANSACTIONAL_ID`. (Host is `app.loops.so`, not `api.loops.so`.)

**6. Deploy + smoke test**
Submit the form → it shows "request received" (no instant unlock). Open `/admin`, sign in with
`ADMIN_TOKEN`, Approve the row → the Loops email arrives with a `/api/download` link that lands on
the latest installer. Confirm `/api/access-requests` returns **401 when logged out**.

## Endpoints (all CommonJS Vercel functions)
| Route | Method | Auth | Notes |
|---|---|---|---|
| `/api/access-requests` | POST | public | upsert (Postgres-first, idempotent), then best-effort Loops; 10 KB stream cap |
| `/api/access-requests` | GET | admin cookie | pending queue, `?status=pending\|approved\|rejected` |
| `/api/admin/login` | POST | — | `{token}` → httpOnly `mika_admin` cookie (Secure, SameSite=Strict, Path=/) |
| `/api/access-requests/[id]/decision` | POST | admin cookie | `{approve}`; idempotent email on approve (`approval_email_sent_at` + Loops Idempotency-Key) |
| `/api/download` | GET | public | 302 → latest GitHub `.exe` (skips `.blockmap`/portable), else fallback URL |

Shared helpers: `api/_db.js` (module-scope `Pool({max:1})` reused across warm invocations) and
`api/_logic.js` (validation, timing-safe token compare, cookie, asset filter). Both export a clean
404 handler so they're inert if ever hit directly.

## Notes & deviations from the plan draft
- **Admin gate is timing-safe**: every protected function compares SHA-256 digests of cookie vs
  `ADMIN_TOKEN` via `timingSafeEqual` (equal-length, never throws → clean 401, never a 500).
- **OpenAPI**: spec updated with `firstName`/`profession`; `api.schemas.ts` hand-synced (typecheck
  confirms). `api-zod` was **not** regenerated (it's unused by the functions). To fully sync both
  from the spec: `pnpm --filter @workspace/api-spec run codegen`. Admin endpoints stay hand-fetched.
- **Rate-limiting**: the 10 KB stream-based body cap is the always-on floor. Per-IP KV limiting is
  deferred; if you add `@upstash/ratelimit`, add it ≥24 h ahead (`minimumReleaseAge: 1440`) and
  prove it bundles in the same way as `pg` (Phase 0) before relying on it.
- **Rollback** is clean: endpoints are additive; reverting the frontend + functions leaves the
  table intact (the extra nullable columns are harmless).
