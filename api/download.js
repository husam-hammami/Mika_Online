// GET /api/download  (public — soft gate)
// Redirects to the latest MIKA Windows installer from GitHub Releases. The repo is
// public, so this link is shareable by design; approval controls who we *email*, not
// who can technically download. On any error, fall back to the releases page.
//
// GITHUB_TOKEN lifts the GitHub API rate limit 60/hr -> 5000/hr (the real mitigation).

const { pickInstallerAsset } = require("./_logic");

const REPO = process.env.GITHUB_REPO || "husam-hammami/ai-mri-analyzer";

module.exports = async function handler(_req, res) {
  const fallback =
    process.env.INSTALLER_FALLBACK_URL || `https://github.com/${REPO}/releases/latest`;

  try {
    const headers = {
      Accept: "application/vnd.github+json",
      "User-Agent": "mika-site",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

    const r = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, { headers });
    if (!r.ok) throw new Error(`GitHub API ${r.status}`);

    const release = await r.json();
    const asset = pickInstallerAsset(release.assets);
    if (!asset || !asset.browser_download_url) throw new Error("no installer asset in latest release");

    res.statusCode = 302;
    res.setHeader("Location", asset.browser_download_url);
    res.setHeader("Cache-Control", "no-store");
    res.end();
  } catch (err) {
    console.error("download: falling back to releases page —", err && err.message);
    res.statusCode = 302;
    res.setHeader("Location", fallback);
    res.setHeader("Cache-Control", "no-store");
    res.end();
  }
};
