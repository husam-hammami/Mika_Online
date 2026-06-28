# MIKA site — Vercel deployment

Hosting `artifacts/mika-site` (the launch site) on Vercel. The former Express + Postgres
backend is gone; the only server-side piece is one serverless function that forwards
early-access signups to Loops.

**The domain is NOT required to deploy.** You go live immediately on a free
`*.vercel.app` URL and attach the custom domain later (Step 5) in ~2 minutes once purchased.

## What changed (committed locally as `6a3bf9a`, not yet pushed)

- `vercel.json` — builds only mika-site (`pnpm --filter @workspace/mika-site build`), output
  `artifacts/mika-site/dist/public`, SPA rewrite to `/index.html` (excludes `/api`).
- `api/access-requests.js` — Vercel serverless function. Keeps the frontend's existing
  `POST /api/access-requests` contract, validates the email, and upserts the contact into
  Loops. Idempotent (existing contact = success).
- Removed `/access` route + `pages/access.tsx` — that dashboard served the full signup
  list over an **unauthenticated** `GET`; on a public domain it was an open dump of every
  email. Signups now live in the Loops dashboard.
- `.vercelignore` — trims heavy non-package files (root promo mp4, `exports/`,
  `attached_assets/`) from the build context. Site videos under
  `artifacts/mika-site/public/footage` still ship.

`api-server/`, `lib/db`, `lib/api-zod` remain in the repo but are unused by this deploy.

## Verified

Built locally with **pnpm 10** (the version Vercel auto-selects for `lockfileVersion 9.0`)
using the exact `vercel.json` build command. Output emitted cleanly:
`index.html` + hashed JS/CSS, `%BASE_URL%` resolved to `/`.

## Your steps

### 1. Push
The commit is already in your local repo. From the project folder on your machine:
```
git push origin main
```

### 2. Create Loops + API key
1. Sign up at loops.so (free tier: 1,000 contacts / 4,000 emails per 30 days).
2. Settings → API → **Generate key**. Copy it.
3. Optional: create a mailing list / segment. The function tags contacts with
   `userGroup: "early-access"` and `source: "MIKA website"` automatically.

### 3. Import to Vercel
1. vercel.com → **Add New → Project** → import `husam-hammami/Mika_Online`.
2. **Root Directory:** leave at repo root (`./`). Framework: **Other**.
   Do not override Build/Output — `vercel.json` is authoritative.
3. **Environment Variables** → add:
   - `LOOPS_API_KEY` = the key from Step 2 (Production + Preview).
   - *(optional)* `LOOPS_USER_GROUP` = a label if you want something other than `early-access`.
4. **Deploy.** You get a `*.vercel.app` URL.

### 4. Test the gate
On the deployed URL, enter an email in the download gate → it should unlock, and the
contact should appear in Loops within seconds. If it errors, check the function logs
(Vercel → Project → Logs) — a missing/invalid `LOOPS_API_KEY` returns a 500.

### 5. Attach the domain (after you buy it)
1. Vercel → Project → **Settings → Domains → Add** → enter the domain.
2. Follow Vercel's DNS instructions at your registrar (either point an `A`/`CNAME`
   record, or move nameservers to Vercel). Registrar is your call — Cloudflare or
   Namecheap both fine; or buy through **Vercel Domains** for one-click setup with no DNS step.
3. SSL is automatic once DNS resolves.

## Before public launch (follow-ups, not blockers)

- **Download link:** `EmailGate.tsx` has `DOWNLOAD_URL = "#"`. The unlock button currently
  goes nowhere — wire the real MIKA installer URL before announcing.
- **Social/OG tags:** `index.html` uses a relative `og:image`. LinkedIn/Facebook crawlers
  need **absolute** URLs. Once the domain is set, add `<link rel="canonical">`, `og:url`,
  absolute `og:image`/`twitter:image`, and a `public/sitemap.xml`. (There's a TODO comment
  in `index.html` marking exactly this.) Happy to do this pass once the domain is locked.
- **Confirmation email:** the gate unlocks client-side only. If you want the promised
  "download link" email, set up a transactional Loop in Loops triggered on contact creation.
