// Pure, dependency-free helpers (only Node built-ins). Unit-tested without a DB.
// Exported as a function (clean 404 if Vercel ever routes /api/_logic) with the
// helpers attached as properties so siblings can `require('./_logic')` and destructure.

const crypto = require("crypto");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FIRST_NAME = 50;
const MAX_PROFESSION = 100;

function isValidEmail(s) {
  return typeof s === "string" && EMAIL_RE.test(s);
}

// Validate + normalize a public submission. Returns {ok,value} or {ok:false,error}.
function normalizeSubmission(body) {
  const email =
    typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!isValidEmail(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  let firstName = typeof body?.firstName === "string" ? body.firstName.trim() : "";
  let profession =
    typeof body?.profession === "string" ? body.profession.trim() : "";
  if (firstName.length > MAX_FIRST_NAME) firstName = firstName.slice(0, MAX_FIRST_NAME);
  if (profession.length > MAX_PROFESSION) profession = profession.slice(0, MAX_PROFESSION);
  return {
    ok: true,
    value: {
      email,
      firstName: firstName || null,
      profession: profession || null,
    },
  };
}

// Read the body as JSON, capping by counting streamed bytes (never trusting the
// spoofable Content-Length). Returns {ok,value} | {ok:false,tooLarge} | {ok:false,invalid}.
async function readJsonCapped(req, maxBytes = 10 * 1024) {
  if (req.body && typeof req.body === "object") return { ok: true, value: req.body };
  let raw = req.body;
  if (typeof raw !== "string") {
    const chunks = [];
    let total = 0;
    for await (const chunk of req) {
      total += chunk.length;
      if (total > maxBytes) return { ok: false, tooLarge: true };
      chunks.push(chunk);
    }
    raw = Buffer.concat(chunks).toString("utf8");
  } else if (Buffer.byteLength(raw) > maxBytes) {
    return { ok: false, tooLarge: true };
  }
  if (!raw) return { ok: true, value: {} };
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch {
    return { ok: false, invalid: true };
  }
}

// Constant-time token compare that never throws on length mismatch: hash both
// sides to fixed-length SHA-256 digests first (timingSafeEqual requires equal length).
function tokensEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length === 0 || b.length === 0) {
    return false;
  }
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function parseCookies(header) {
  const out = {};
  if (typeof header !== "string") return out;
  for (const part of header.split(";")) {
    const i = part.indexOf("=");
    if (i < 0) continue;
    const k = part.slice(0, i).trim();
    if (!k) continue;
    out[k] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}

// Admin gate: valid only when the cookie's value matches ADMIN_TOKEN (timing-safe).
// "Cookie present" is NOT enough — that was the email-list-leak class.
function isAdmin(req) {
  const token = process.env.ADMIN_TOKEN;
  if (!token) return false;
  const cookies = parseCookies(req.headers && req.headers.cookie);
  return tokensEqual(cookies.mika_admin, token);
}

function serializeAdminCookie(value, maxAgeSeconds = 60 * 60 * 12) {
  // httpOnly + Secure + SameSite=Strict + Path=/ so it reaches every /api admin call.
  return `mika_admin=${encodeURIComponent(value)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAgeSeconds}`;
}

function clearAdminCookie() {
  return "mika_admin=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0";
}

// Pick the Windows installer from a GitHub release's assets: a .exe that is not an
// electron-builder .blockmap and not a "portable" build.
function pickInstallerAsset(assets) {
  if (!Array.isArray(assets)) return null;
  return (
    assets.find((a) => {
      const n = (a && a.name ? a.name : "").toLowerCase();
      return n.endsWith(".exe") && !n.includes(".blockmap") && !n.includes("portable");
    }) || null
  );
}

// Send the approval email only when approved AND not already sent (idempotent).
function shouldSendApprovalEmail(row) {
  return !!row && row.status === "approved" && !row.approval_email_sent_at;
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}

function notFound(_req, res) {
  json(res, 404, { error: "Not found." });
}

module.exports = Object.assign(notFound, {
  isValidEmail,
  normalizeSubmission,
  readJsonCapped,
  tokensEqual,
  parseCookies,
  isAdmin,
  serializeAdminCookie,
  clearAdminCookie,
  pickInstallerAsset,
  shouldSendApprovalEmail,
  json,
});
