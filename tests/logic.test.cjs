// Deterministic in-session tests for the dependency-free function logic.
// Run with: node --test tests/
const { test } = require("node:test");
const assert = require("node:assert/strict");

const logic = require("../api/_logic");
const {
  isValidEmail,
  normalizeSubmission,
  readJsonCapped,
  tokensEqual,
  parseCookies,
  isAdmin,
  pickInstallerAsset,
  shouldSendApprovalEmail,
} = logic;

function fakeReq(str, chunkSize = 4) {
  const buf = Buffer.from(str, "utf8");
  return {
    headers: {},
    async *[Symbol.asyncIterator]() {
      for (let i = 0; i < buf.length; i += chunkSize) yield buf.subarray(i, i + chunkSize);
    },
  };
}

test("isValidEmail", () => {
  assert.equal(isValidEmail("a@b.co"), true);
  assert.equal(isValidEmail("no-at"), false);
  assert.equal(isValidEmail("a@b"), false);
  assert.equal(isValidEmail(123), false);
});

test("normalizeSubmission trims, lowercases, caps, and nulls empties", () => {
  const ok = normalizeSubmission({ email: "  USER@Example.COM ", firstName: "  Sam ", profession: " Radiologist " });
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.value, { email: "user@example.com", firstName: "Sam", profession: "Radiologist" });

  const noName = normalizeSubmission({ email: "x@y.io" });
  assert.deepEqual(noName.value, { email: "x@y.io", firstName: null, profession: null });

  const longName = normalizeSubmission({ email: "x@y.io", firstName: "a".repeat(80) });
  assert.equal(longName.value.firstName.length, 50);

  const bad = normalizeSubmission({ email: "nope" });
  assert.equal(bad.ok, false);
});

test("readJsonCapped parses, rejects oversize, rejects invalid", async () => {
  assert.deepEqual((await readJsonCapped(fakeReq('{"a":1}'))).value, { a: 1 });

  const big = await readJsonCapped(fakeReq("x".repeat(20000)), 1024);
  assert.equal(big.ok, false);
  assert.equal(big.tooLarge, true);

  const invalid = await readJsonCapped(fakeReq("not json"));
  assert.equal(invalid.ok, false);
  assert.equal(invalid.invalid, true);

  // Pre-parsed object body (Vercel) passes through.
  assert.deepEqual((await readJsonCapped({ body: { a: 2 }, headers: {} })).value, { a: 2 });
});

test("tokensEqual is correct and never throws on length mismatch", () => {
  assert.equal(tokensEqual("secret", "secret"), true);
  assert.equal(tokensEqual("secret", "SECRET"), false);
  assert.equal(tokensEqual("short", "a-much-longer-token"), false); // would throw without hashing
  assert.equal(tokensEqual("", "x"), false);
  assert.equal(tokensEqual(undefined, "x"), false);
});

test("isAdmin requires a cookie matching ADMIN_TOKEN", () => {
  const prev = process.env.ADMIN_TOKEN;
  process.env.ADMIN_TOKEN = "the-real-token";
  assert.equal(isAdmin({ headers: { cookie: "mika_admin=the-real-token" } }), true);
  assert.equal(isAdmin({ headers: { cookie: "mika_admin=wrong" } }), false);
  assert.equal(isAdmin({ headers: {} }), false);
  delete process.env.ADMIN_TOKEN;
  assert.equal(isAdmin({ headers: { cookie: "mika_admin=anything" } }), false); // unset env -> never authed
  if (prev !== undefined) process.env.ADMIN_TOKEN = prev;
});

test("parseCookies", () => {
  assert.deepEqual(parseCookies("a=1; mika_admin=tok; b=2").mika_admin, "tok");
  assert.deepEqual(parseCookies(undefined), {});
});

test("pickInstallerAsset selects the .exe, skipping blockmap/portable", () => {
  const assets = [
    { name: "MIKA-1.2.3-portable.exe", browser_download_url: "u1" },
    { name: "MIKA-Setup-1.2.3.exe.blockmap", browser_download_url: "u2" },
    { name: "MIKA-Setup-1.2.3.exe", browser_download_url: "u3" },
    { name: "MIKA-1.2.3.dmg", browser_download_url: "u4" },
  ];
  assert.equal(pickInstallerAsset(assets).browser_download_url, "u3");
  assert.equal(pickInstallerAsset([{ name: "only.dmg" }]), null);
  assert.equal(pickInstallerAsset(null), null);
});

test("shouldSendApprovalEmail is idempotent on approval_email_sent_at", () => {
  assert.equal(shouldSendApprovalEmail({ status: "approved", approval_email_sent_at: null }), true);
  assert.equal(shouldSendApprovalEmail({ status: "approved", approval_email_sent_at: "2026-01-01" }), false);
  assert.equal(shouldSendApprovalEmail({ status: "pending", approval_email_sent_at: null }), false);
  assert.equal(shouldSendApprovalEmail({ status: "rejected", approval_email_sent_at: null }), false);
});
