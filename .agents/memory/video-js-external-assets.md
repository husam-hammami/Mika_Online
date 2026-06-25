---
name: video-js external assets
description: video-js DESIGN subagent sometimes leaves external-URL assets that 404 and break export
---

The DESIGN subagent that builds video-js artifacts sometimes references external
asset URLs in scene/background code — most commonly a noise texture from
`https://grainy-gradients.vercel.app/noise.svg`. These 404 in the preview and
will also fail in the exported frame.

**Rule:** After the subagent finishes, grep the video components for `https?://`
and replace any network-fetched visual asset with a self-contained equivalent
(inline SVG `data:image/svg+xml,...` for noise/textures, or a generated/stock
file placed in `public/`). Ignore harmless `xmlns="http://www.w3.org/2000/svg"`
namespace declarations — those are not fetches.

**Why:** Video exports must be deterministic and offline-safe; an external URL
that 404s leaves a broken/empty layer in the recorded video.

**How to apply:** Part of the main-agent post-build pass, alongside the audio +
scene-selector wiring, before presentArtifact.
