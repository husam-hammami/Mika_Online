// POST /api/access-requests/[id]/decision  (admin-only)  body: { approve: boolean }
//   approve -> status='approved', decided_at set, then email the install link ONCE
//   reject  -> status='rejected', decided_at set, no email
//
// Idempotency is enforced at the DB (approval_email_sent_at) AND at Loops (Idempotency-Key),
// so a double-click or retry never sends two emails.

const { pool } = require("../../_db");
const { isAdmin, readJsonCapped, shouldSendApprovalEmail, json } = require("../../_logic");

const LOOPS_TRANSACTIONAL_URL = "https://app.loops.so/api/v1/transactional";

async function safeText(resp) {
  try {
    return await resp.text();
  } catch {
    return "";
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method not allowed." });
  }
  if (!isAdmin(req)) return json(res, 401, { error: "Unauthorized." });

  const id = Number(req.query && req.query.id);
  if (!Number.isInteger(id) || id <= 0) return json(res, 400, { error: "Invalid id." });

  const parsed = await readJsonCapped(req, 4 * 1024);
  if (!parsed.ok) return json(res, 400, { error: "Invalid request." });
  const approve = parsed.value?.approve === true;

  let row;
  try {
    const r = await pool.query(
      "SELECT id, first_name, email, status, approval_email_sent_at FROM access_requests WHERE id = $1",
      [id],
    );
    row = r.rows[0];
  } catch (err) {
    console.error("decision load failed", err);
    return json(res, 500, { error: "Server error." });
  }
  if (!row) return json(res, 404, { error: "Not found." });

  // --- Reject ---
  if (!approve) {
    try {
      await pool.query(
        "UPDATE access_requests SET status='rejected', decided_at=now() WHERE id=$1",
        [id],
      );
    } catch (err) {
      console.error("reject update failed", err);
      return json(res, 500, { error: "Server error." });
    }
    return json(res, 200, { id, status: "rejected", emailed: false });
  }

  // --- Approve (idempotent: don't clobber an earlier decided_at) ---
  try {
    await pool.query(
      "UPDATE access_requests SET status='approved', decided_at=COALESCE(decided_at, now()) WHERE id=$1",
      [id],
    );
  } catch (err) {
    console.error("approve update failed", err);
    return json(res, 500, { error: "Server error." });
  }

  // Re-read authoritative state before deciding to send.
  let fresh;
  try {
    fresh = (
      await pool.query(
        "SELECT id, first_name, email, status, approval_email_sent_at FROM access_requests WHERE id=$1",
        [id],
      )
    ).rows[0];
  } catch (err) {
    console.error("approve re-read failed", err);
    return json(res, 500, { error: "Server error." });
  }

  if (!shouldSendApprovalEmail(fresh)) {
    // Already emailed earlier — report success without re-sending.
    return json(res, 200, { id, status: "approved", emailed: !!fresh.approval_email_sent_at });
  }

  const apiKey = process.env.LOOPS_API_KEY;
  const transactionalId = process.env.LOOPS_TRANSACTIONAL_ID;
  const downloadUrl = `${process.env.SITE_URL || ""}/api/download`;

  if (!apiKey || !transactionalId) {
    console.error("LOOPS_API_KEY or LOOPS_TRANSACTIONAL_ID missing — cannot send approval email");
    return json(res, 200, { id, status: "approved", emailed: false });
  }

  let emailed = false;
  try {
    const resp = await fetch(LOOPS_TRANSACTIONAL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // 409 if this key was used in the last 24h -> treat as already-sent.
        "Idempotency-Key": `approve-${id}`,
      },
      body: JSON.stringify({
        transactionalId,
        email: fresh.email,
        dataVariables: { firstName: fresh.first_name || "there", downloadUrl },
      }),
    });
    emailed = resp.ok || resp.status === 409;
    if (!emailed) console.error("Loops transactional failed", resp.status, await safeText(resp));
  } catch (err) {
    console.error("Loops transactional error", err);
  }

  if (emailed) {
    try {
      await pool.query(
        "UPDATE access_requests SET approval_email_sent_at=now() WHERE id=$1 AND approval_email_sent_at IS NULL",
        [id],
      );
    } catch (err) {
      console.error("stamp approval_email_sent_at failed (email already sent)", err);
    }
  }

  return json(res, 200, { id, status: "approved", emailed });
};
