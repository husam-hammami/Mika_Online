---
name: MIKA site
description: Conventions and gotchas for the MIKA Launch Website (mika-site web artifact + api-server email capture).
---

# MIKA Launch Website

Email-gated download landing page for MIKA (free clinical-imaging desktop app). No real installers, no auth, no payments — by spec.

## Email gate (artifacts/mika-site/src/components/EmailGate.tsx)
- The download button must ONLY unlock on a *successful* POST /api/access-requests.
  **Why:** an earlier version unlocked on `onError` too, which let users download without a captured email and defeated the gate.
  **How to apply:** never unlock / write `sessionStorage mika_unlocked` in the mutation `onError`; only in `onSuccess`.
- `DOWNLOAD_URL = "#"` is an intentional placeholder, swap for the real installer URL later.

## Backend (artifacts/api-server/src/routes/access-requests.ts)
- POST is idempotent on a normalized (trim + lowercase) email: 201 for new, 200 for existing, 400 for invalid. DB `access_requests.email` is unique.

## Routing / assets
- mika-site is at previewPath "/"; the promo video artifact (mika-promo) was moved to "/promo/".
- Static assets live in `artifacts/mika-site/public/{brand,footage,product}` + `MIKA_Promo.mp4`; referenced via `import.meta.env.BASE_URL` (stripped trailing slash) so they resolve under any base path.
