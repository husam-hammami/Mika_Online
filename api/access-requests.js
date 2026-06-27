// /api/access-requests
//   POST (public)      — submit an early-access request (first name + email + profession)
//   GET  (admin-only)  — list requests for the /admin queue, optional ?status= filter
//
// Postgres is the source of truth; Loops is a best-effort mailman. Postgres write
// happens FIRST and is idempotent (ON CONFLICT upsert) so a resubmit never 500s.

const { pool } = require("./_db");
const { normalizeSubmission, readJsonCapped, isAdmin, json } = require("./_logic");

const LOOPS_CREATE_URL = "https://app.loops.so/api/v1/contacts/create";
const ALLOWED_STATUS = new Set(["pending", "approved", "rejected"]);

async function handlePost(req, res) {
  const parsed = await readJsonCapped(req, 10 * 1024);
  if (!parsed.ok && parsed.tooLarge) return json(res, 413, { error: "Request too large." });
  if (!parsed.ok) return json(res, 400, { error: "Invalid request." });

  const norm = normalizeSubmission(parsed.value);
  if (!norm.ok) return json(res, 400, { error: norm.error });
  const { email, firstName, profession } = norm.value;

  // Postgres FIRST. Idempotent upsert; COALESCE keeps any earlier-supplied name/profession
  // if a later resubmit omits them. status defaults to 'pending' on first insert.
  let row;
  try {
    const result = await pool.query(
      `INSERT INTO access_requests (email, first_name, profession, status)
         VALUES ($1, $2, $3, 'pending')
       ON CONFLICT (email) DO UPDATE
         SET first_name = COALESCE(EXCLUDED.first_name, access_requests.first_name),
             profession = COALESCE(EXCLUDED.profession, access_requests.profession)
       RETURNING id, status`,
      [email, firstName, profession],
    );
    row = result.rows[0];
  } catch (err) {
    console.error("access-requests insert failed", err);
    return json(res, 500, { error: "We couldn't process your request. Please try again." });
  }

  // Loops is non-authoritative — log failures, never fail the request on them.
  if (process.env.LOOPS_API_KEY) {
    try {
      await fetch(LOOPS_CREATE_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.LOOPS_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          firstName: firstName || undefined,
          source: "MIKA website",
          userGroup: process.env.LOOPS_USER_GROUP || "early-access",
        }),
      });
    } catch (err) {
      console.error("Loops contact sync failed (non-fatal)", err);
    }
  }

  return json(res, 201, { id: row.id, status: row.status });
}

async function handleGet(req, res) {
  if (!isAdmin(req)) return json(res, 401, { error: "Unauthorized." });

  const status =
    req.query && typeof req.query.status === "string" ? req.query.status : null;
  const filtered = status && ALLOWED_STATUS.has(status);

  try {
    const sql = `SELECT id, first_name, profession, email, status, created_at, decided_at, approval_email_sent_at
                   FROM access_requests
                  ${filtered ? "WHERE status = $1" : ""}
                  ORDER BY created_at DESC`;
    const result = filtered ? await pool.query(sql, [status]) : await pool.query(sql);
    const list = result.rows.map((r) => ({
      id: r.id,
      firstName: r.first_name,
      profession: r.profession,
      email: r.email,
      status: r.status,
      createdAt: r.created_at,
      decidedAt: r.decided_at,
      approvalEmailSentAt: r.approval_email_sent_at,
    }));
    return json(res, 200, list);
  } catch (err) {
    console.error("access-requests list failed", err);
    return json(res, 500, { error: "Server error." });
  }
}

module.exports = async function handler(req, res) {
  if (req.method === "POST") return handlePost(req, res);
  if (req.method === "GET") return handleGet(req, res);
  res.setHeader("Allow", "GET, POST");
  return json(res, 405, { error: "Method not allowed." });
};
