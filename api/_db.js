// Shared Postgres pool for the Vercel functions.
//
// ONE module-scope Pool per warm container (max:1), reused across invocations —
// NOT a Pool per request, which serverless fan-out would multiply until Postgres
// max_connections is exhausted. Prefer the pooled/pgbouncer DATABASE_URL endpoint.
//
// This file lives under api/ so siblings can `require('./_db')`. It is not a real
// endpoint; if Vercel ever routes /api/_db, the default export returns a clean 404.

const { Pool } = require("pg");

const pool =
  global.__mikaPool ||
  (global.__mikaPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1,
  }));

function notFound(_req, res) {
  res.statusCode = 404;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify({ error: "Not found." }));
}

module.exports = Object.assign(notFound, { pool });
