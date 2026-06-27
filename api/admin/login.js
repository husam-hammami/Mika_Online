// POST /api/admin/login  — { token } -> sets the httpOnly admin cookie on a match.
// Timing-safe compare; wrong token returns 401. The cookie value IS the token, and
// every protected endpoint re-validates it (no server session store).

const { readJsonCapped, tokensEqual, serializeAdminCookie, json } = require("../_logic");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method not allowed." });
  }

  const adminToken = process.env.ADMIN_TOKEN;
  if (!adminToken) {
    console.error("ADMIN_TOKEN is not set");
    return json(res, 500, { error: "Server is not configured." });
  }

  const parsed = await readJsonCapped(req, 4 * 1024);
  if (!parsed.ok) return json(res, 400, { error: "Invalid request." });

  const provided = typeof parsed.value?.token === "string" ? parsed.value.token : "";
  if (!tokensEqual(provided, adminToken)) {
    return json(res, 401, { error: "Invalid token." });
  }

  res.setHeader("Set-Cookie", serializeAdminCookie(adminToken));
  return json(res, 200, { ok: true });
};
