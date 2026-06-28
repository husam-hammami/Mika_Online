// POST /api/access-requests/[id]/decision  (admin-only)  body: { approve: boolean }
//   approve -> status='approved', decided_at set, then email the install link ONCE
//   reject  -> status='rejected', decided_at set, no email
//
// Idempotency is enforced at the DB (approval_email_sent_at) AND at Resend
// (Idempotency-Key), so a double-click or retry never sends two emails.

const { pool } = require("../../_db");
const { isAdmin, readJsonCapped, shouldSendApprovalEmail, json } = require("../../_logic");

const RESEND_URL = "https://api.resend.com/emails";

async function safeText(resp) {
  try {
    return await resp.text();
  } catch {
    return "";
  }
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]),
  );
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

  // --- Approval email via Resend ---
  const apiKey = process.env.RESEND_API_KEY;
  // Until the mika-md.app domain is verified in Resend, the shared sender
  // "onboarding@resend.dev" works (delivers to the Resend account owner).
  // After verifying the domain, set RESEND_FROM="MIKA <noreply@mika-md.app>".
  const fromAddr = process.env.RESEND_FROM || "MIKA <onboarding@resend.dev>";
  const downloadUrl = `${process.env.SITE_URL || ""}/api/download`;

  if (!apiKey) {
    console.error("RESEND_API_KEY missing — cannot send approval email");
    return json(res, 200, { id, status: "approved", emailed: false });
  }

  const firstName = escapeHtml(fresh.first_name || "there");
  const subject = "You're in — download MIKA";
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;color:#111111">
  <div style="font-size:20px;font-weight:700;letter-spacing:.02em;margin-bottom:24px">MIKA</div>
  <p style="font-size:16px;line-height:1.6;margin:0 0 16px">Hi ${firstName},</p>
  <p style="font-size:16px;line-height:1.6;margin:0 0 24px">You're approved for early access to MIKA. Download the app for Mac or Windows below.</p>
  <a href="${downloadUrl}" style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 20px;border-radius:8px">Download MIKA</a>
  <p style="font-size:13px;line-height:1.6;color:#666666;margin:28px 0 0">Or paste this link into your browser:<br><span style="color:#444444">${downloadUrl}</span></p>
  <p style="font-size:12px;line-height:1.6;color:#999999;margin:28px 0 0;border-top:1px solid #eeeeee;padding-top:16px">MIKA explains scans and lab reports in plain language. It is not a doctor and does not replace professional medical advice.</p>
</div>`;
  const text = `Hi ${fresh.first_name || "there"},

You're approved for early access to MIKA. Download the app for Mac or Windows:

${downloadUrl}

MIKA explains scans and lab reports in plain language. It is not a doctor and does not replace professional medical advice.`;

  let emailed = false;
  try {
    const resp = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        // Resend returns the same result for a repeated key -> safe on retry.
        "Idempotency-Key": `approve-${id}`,
      },
      body: JSON.stringify({ from: fromAddr, to: [fresh.email], subject, html, text }),
    });
    emailed = resp.ok;
    if (!emailed) console.error("Resend send failed", resp.status, await safeText(resp));
  } catch (err) {
    console.error("Resend send error", err);
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
