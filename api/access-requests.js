// Vercel Serverless Function — early-access email capture.
//
// Replaces the former Express + Postgres backend. The frontend still POSTs
// { email } to /api/access-requests via the generated api-client; this handler
// preserves that contract and forwards the contact to Loops.
//
// Required env var (set in Vercel Project Settings → Environment Variables):
//   LOOPS_API_KEY  — Loops API key (Settings → API → Generate key)
// Optional:
//   LOOPS_USER_GROUP  — segment label for these contacts (default "early-access")

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOOPS_CREATE_URL = "https://app.loops.so/api/v1/contacts/create";

function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  // Vercel parses JSON bodies automatically, but be defensive about strings
  // and unparsed streams so the handler never throws on a malformed request.
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return null;
    }
  }
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (chunks.length === 0) return null;
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    return null;
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  const apiKey = process.env.LOOPS_API_KEY;
  if (!apiKey) {
    // Misconfiguration — log server-side, return a generic error to the client.
    console.error("LOOPS_API_KEY is not set");
    return sendJson(res, 500, { error: "Server is not configured." });
  }

  const body = await readBody(req);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email)) {
    return sendJson(res, 400, { error: "Please enter a valid email address." });
  }

  let loopsRes;
  try {
    loopsRes = await fetch(LOOPS_CREATE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        source: "MIKA website",
        userGroup: process.env.LOOPS_USER_GROUP || "early-access",
        subscribed: true,
      }),
    });
  } catch (err) {
    console.error("Loops request failed", err);
    return sendJson(res, 502, { error: "We couldn't process your request. Please try again." });
  }

  let data = null;
  try {
    data = await loopsRes.json();
  } catch {
    // Loops returned a non-JSON body.
  }

  const now = new Date().toISOString();

  // Success: new contact created.
  if (loopsRes.ok && data?.success) {
    return sendJson(res, 201, { id: data.id || email, email, createdAt: now });
  }

  // Idempotent: contact already on the list — treat as success so the gate opens.
  const message = typeof data?.message === "string" ? data.message : "";
  if (loopsRes.status === 409 || /already/i.test(message)) {
    return sendJson(res, 200, { id: data?.id || email, email, createdAt: now });
  }

  console.error("Loops create failed", loopsRes.status, message);
  return sendJson(res, 502, { error: "We couldn't process your request. Please try again." });
};
