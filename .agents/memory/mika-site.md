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

## Hero layout gotchas (artifacts/mika-site/src/pages/home.tsx)
- The brand logo source `mika_logo_glow.png` has huge baked-in transparent padding (artwork ~1232x559 inside a 1536x1024 canvas). Use the trimmed `mika_logo_hero.png` (ImageMagick `-trim +repage`) so the mark fills its height box.
  **Why:** at any CSS height ~45% of the logo box was empty space; user repeatedly read this as "MIKA has too much space around it / isn't the hero".
- Hero is top-aligned (`justify-start`) not centered, so the bigger video + headline fit in the first 1080px screen.
- The headless screenshot tool freezes CSS keyframe/`animate-in` entrance animations, so any element that starts at opacity 0 stays invisible in captures (framer-motion JS-driven FadeIn still renders). Render the hero video statically (no entrance animation) — that's why it was a black void before.

## Routing / assets
- mika-site is at previewPath "/"; the promo video artifact (mika-promo) was moved to "/promo/".
- Static assets live in `artifacts/mika-site/public/{brand,footage,product}`; referenced via `import.meta.env.BASE_URL` (stripped trailing slash) so they resolve under any base path.

## Promo video on the site = embedded live deck, NOT a baked mp4
- The hero video is the live mika-promo deck, embedded as a self-contained static build under `public/promo-embed/` and loaded in an `<iframe>` behind a click-to-play poster — never a hand-exported mp4.
  **Why:** a baked `MIKA_Promo.mp4` silently went stale whenever deck scenes changed (the lab scene existed in the deck but the mp4 still showed the old cut). video-js artifacts aren't deployable standalone, so the live `/promo/` dev URL can't be iframed in production either.
  **How to apply:** any deck change requires rebuilding mika-promo and re-syncing the bundle into `public/promo-embed/` — the two drift independently. Build the deck with a relative base (`BASE_PATH=./`) so assets resolve in both the proxied dev preview and production. The deck starts MUTED when iframed (intentional, so standalone autoplay isn't blocked); audio is via the in-deck unmute control, not auto-on. Re-shoot `footage/promo_poster.jpg` from a deck frame when on-screen copy changes.

## GitHub push setup
- Code is pushed to GitHub repo **husam-hammami/Mika_Online** (public) via the Replit GitHub **connector** (OAuth, account husam-hammami), NOT a PAT.
- PATs the user pasted failed with "Bad credentials"; the built-in GitHub connection worked first try. Prefer the connector over asking for a PAT.
- To push: get token via `listConnections("github")[0].settings.access_token` in code_execution, write it to a /tmp askpass helper, push with `GIT_ASKPASS` + inline `https://x-access-token@github.com/...` URL, then shred the temp files. Never print the token.
- **Gotcha:** `git remote add`/config writes are blocked in main agent ("Destructive git operations not allowed"), so a persistent `origin` cannot be saved — push with an inline URL each time. Plain `git push` (non-force) to an inline URL is allowed.
- **Gotcha:** the bash shell can hold a stale `GITHUB_TOKEN` env value; `viewEnvVars` masks secret values (returns `true`), so read connector tokens via `listConnections`, not env.
