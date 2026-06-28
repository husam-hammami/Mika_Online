# Plan — Mika_Online launch cycle (hero redesign + early-access flow)

> Forged /warcry (grounded inline — full survey done, no re-scout needed) → /bulletproof → /katana.
> Autonomous run; owner-gated runtime config kept as PLACEHOLDERS, never blockers.

## Goal / done-when
`mika-md.app` first screen shows the hero **fully within one viewport (no scroll to see the whole promo
video)**, over a **tasteful, theme-fit animated background** (no cheap node-network / SVG geometry), and the
**get-MIKA → admin approve/decline → approved-email-with-latest-installer** cycle is complete + verified
locally. Done = hero screenshot-verified at 1280×800 / 1440×900 (and a short 1366×768), the early-access code
path builds + unit tests pass, committed + pushed; prod env/migration documented as placeholders.

## Workstream A — Hero redesign (the real build)
Current (`pages/home.tsx` §1 "DARK / CINEMATIC OPENING"): `min-h-screen`, `justify-start`, a tall stack
(logo h-20→h-32 → h1 → p → CTA → caption → `max-w-5xl` aspect-video → scroll cue) that **overflows the fold**,
layered over `mika-grid-dark` + **`ParticleField`** (canvas node-LINK network = the "weird geometry / cheap"
look) + `mika-float` glow blobs. Brand: dark `#05070d`, accent blue `#1e6bff` (KEEP — established brand, not
an AI-tell; do not introduce purple/cyan/teal).

1. **New `HeroBackdrop.tsx`** (canvas) replacing `ParticleField` in the hero only — tasteful + on-theme +
   performant. Composition: (a) 2–3 large, soft, slow-drifting brand-blue light blooms (aurora/depth), (b) a
   sparse field of soft, blurred, slow-drifting **depth motes — NO connecting lines** (the lines were the
   "geometry"), (c) optional faint, slow vertical light sweep (a quiet nod to a scanner) at low opacity.
   Reuse the existing perf scaffolding verbatim: DPR cap ≤2, IntersectionObserver pause off-screen,
   `visibilitychange` pause, `prefers-reduced-motion` → single static frame, RAF, cleanup on unmount.
   Remove the `ParticleField` usage from the hero (keep the file; it may be used elsewhere — grep first).
   Drop or reduce `mika-grid-dark` in the hero to ≤ opacity-20 so the backdrop isn't busy.
2. **Fit the hero in `100dvh`, no scroll.** Switch §1 to `h-[100dvh]` (fallback `min-h-screen`) with
   `justify-center`, compress the vertical rhythm (smaller margins: mb-3→mb-2, mt-8→mt-4, pt-10→pt-6), and
   **cap the video** so the entire stack fits: container `max-h-[42vh]` (aspect-video, width auto-derived),
   `object-contain`. The promo video is the focal point and must be wholly visible above the fold on a
   1366×768 laptop. Keep the play-poster + iframe-on-click behavior. Keep the scroll cue but ensure it sits
   below the video without forcing overflow (or hide it if space is tight on short viewports).
3. Honor UI discipline: 8px rhythm, relative units, holds at 80/100/125% zoom, no dead voids, single accent.

## Workstream B — Cycle finalization (verify + wire; mostly built by cowork at 01b7af0)
The flow already exists and was independently reviewed (no blockers): hero CTA `Get MIKA` →
`scrollToDownload` → `#download` section → `<EmailGate/>` (firstName+email+profession → `useCreateAccessRequest`
→ `POST /api/access-requests` → "Request received, we'll email you") ; admin queue at `pages/admin.tsx`
(`/admin`) approve/decline ; on approve → Loops transactional email with the link ; `GET /api/download` → 302
to the latest **public** GitHub release `MIKA-Setup-*.exe` (the OTA installer of the latest MIKA desktop).
Tasks:
1. **Verify** it builds + the unit tests (`tests/logic.test.cjs`) pass; typecheck mika-site after the hero
   edits.
2. **Confirm the CTA path is the request form** (not a raw download) end-to-end in the built site, and that
   `/api/download` resolves the latest installer asset (filter `.exe`, exclude `.blockmap`/portable).
3. **Do not re-touch** the committed backend functions/admin unless a real defect surfaces (avoid churn +
   the OneDrive desync risk).
4. **Placeholders (owner-gated, NOT blockers):** the prod env values (`ADMIN_TOKEN`, `LOOPS_TRANSACTIONAL_ID`,
   `GITHUB_TOKEN`, `SITE_URL`, `INSTALLER_FALLBACK_URL`), the Loops transactional template, and
   `drizzle push` on the prod DB. Code is complete; these are config the owner runs. Document in
   `DEPLOY_EARLY_ACCESS.md` (already present) — leave clear, don't block on them.

## Files & surfaces
- NEW: `artifacts/mika-site/src/components/HeroBackdrop.tsx`.
- EDIT (Write-recreate, NOT in-place Edit — OneDrive desync): `artifacts/mika-site/src/pages/home.tsx` (§1
  hero: backdrop swap + layout fit), possibly `index.css` (a backdrop keyframe if needed).
- VERIFY only: `EmailGate.tsx`, `pages/admin.tsx`, `api/*`, `tests/logic.test.cjs`.

## Test & verification
- **Build + typecheck** mika-site (jitless if the sandbox V8 crashes, per cowork). Run `tests/logic.test.cjs`.
- **Visual (mandatory):** run the vite dev server, screenshot the hero at 1280×800, 1440×900, 1366×768;
  audit for: video fully visible without scroll, no AI-tell colors (no purple/cyan), no dead voids, holds at
  125% zoom, reduced-motion path renders a clean static frame. Fix → re-screenshot → only then done.
- **Cycle:** confirm the build serves `/admin` + the form; the live email/DB path needs prod env/migration
  (placeholder — state it, don't fake it).

## Rollout & rollback
Frontend-only changes deploy via the existing git-connected Vercel preview (build needs no secrets). Push to
`main` → auto-redeploy preview. Rollback = revert the hero commit (additive; the cycle is untouched).

## Risks → mitigations
- **OneDrive desync** → full-file Write/recreate only; verify committed blobs NUL-free before push
  ([[onedrive-mount-edit-desync]]). · **Collision with cowork** (it's on the Vercel/build side) →
  re-baseline `git fetch`+status before each commit; sole-edit the hero files. · **Canvas perf** → reuse the
  capped/paused scaffolding; reduced-motion static. · **Video-fit on very short viewports** → cap by vh +
  allow graceful scale; verify at 768 height. · **Don't break the cycle** → verify-only on backend.

## Out of scope / placeholders
Prod env values + Loops template + `drizzle push` (owner). Backend feature rebuild (done). The 4 review nits +
OpenAPI doc-drift (cowork's follow-up). Custom-domain attach (cowork/owner).

## Success criteria (restated)
First screen = full hero + whole video, tasteful themed animated backdrop (no cheap geometry), brand intact;
get-MIKA → approve → email → latest-installer cycle complete + verified locally + pushed; placeholders labeled.
