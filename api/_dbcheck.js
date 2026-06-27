// PHASE 0 PROBE — TEMPORARY. Delete before production.
// Proves that a root CommonJS Vercel function can require('pg') (resolves through
// pnpm's symlinked node_modules) AND connect to DATABASE_URL on a preview deploy.
// Returns only a boolean + pg version + server time. No data, no secrets.

const { Pool } = require("pg");

// Module-scope, reused across warm invocations (mirrors the real api/_db.js pattern).
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, max: 1 })
  : null;

module.exports = async function handler(_req, res) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  const pgVersion = require("pg/package.json").version;

  if (!pool) {
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, pgResolved: true, pgVersion, db: "DATABASE_URL not set" }));
    return;
  }

  try {
    const { rows } = await pool.query("select now() as now");
    res.statusCode = 200;
    res.end(JSON.stringify({ ok: true, pgResolved: true, pgVersion, db: "connected", now: rows[0].now }));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ ok: false, pgResolved: true, pgVersion, db: "connect failed", error: String(err && err.message || err) }));
  }
};
