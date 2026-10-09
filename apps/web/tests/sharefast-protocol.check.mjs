import test from "node:test";
import assert from "node:assert/strict";
import {
  BRIDGE_PATH,
  parseEnvelope,
  payloadHash,
  signedHeaders,
  verifySignature,
  readLimitedBody,
  bridgeOrigin,
} from "../lib/sharefast-protocol.ts";
const secret = "test-only-bridge-secret-32-characters-long";
const now = 1791490000000;
const envelope = {
  version: 1,
  externalOrderId: "11111111-1111-4111-8111-111111111111",
  displayNumber: "B-261009-0001",
  branchCode: "B",
  destZone: "المنصورة",
  fromAddr: "عنوان المطعم التجريبي",
  toAddr: "عنوان العميل التجريبي كامل",
  feeEGP: 0,
  totalEGP: 100,
  paymentMethod: "cash",
  customerName: "عميل اختبار",
  customerPhone: "01000000001",
  note: "",
  source: "client_online",
};
const request = (
  method,
  path,
  raw,
  headers = signedHeaders(secret, method, path, raw, now),
) =>
  new Request("https://test.invalid" + path, {
    method,
    headers,
    ...(raw ? { body: raw } : {}),
  });
test("whole EGP charged fee is preserved including zero", () => {
  assert.equal(parseEnvelope(envelope).feeEGP, 0);
});
test("rejects decimal money instead of rounding", () => {
  for (const field of ["feeEGP", "totalEGP"])
    assert.throws(() => parseEnvelope({ ...envelope, [field]: 1.5 }));
});
test("rejects forged merchant binding and unsupported payload fields", () => {
  assert.throws(() => parseEnvelope({ ...envelope, merchantRef: "other" }));
});
test("rejects invalid addresses, phones, IDs and amounts", () => {
  for (const change of [
    { externalOrderId: "bad" },
    { toAddr: "short" },
    { customerPhone: "11111111111" },
    { feeEGP: -1 },
    { totalEGP: 0 },
    { feeEGP: 101 },
  ])
    assert.throws(() => parseEnvelope({ ...envelope, ...change }));
});
test("idempotency fingerprint ignores object key order, not content changes", () => {
  assert.equal(
    payloadHash(envelope),
    payloadHash(Object.fromEntries(Object.entries(envelope).reverse())),
  );
  assert.notEqual(
    payloadHash(envelope),
    payloadHash({ ...envelope, note: "different" }),
  );
});
test("accepts a valid signed server request", () => {
  const raw = JSON.stringify(envelope);
  assert.equal(
    verifySignature(secret, request("POST", BRIDGE_PATH, raw), raw, now),
    true,
  );
});
test("rejects tampered body, path, method and query", () => {
  const raw = JSON.stringify(envelope),
    h = signedHeaders(secret, "POST", BRIDGE_PATH, raw, now);
  for (const [method, path, body] of [
    ["POST", BRIDGE_PATH, raw + " "],
    ["PATCH", BRIDGE_PATH, raw],
    ["POST", BRIDGE_PATH + "/other", raw],
    ["POST", BRIDGE_PATH + "?x=1", raw],
  ])
    assert.equal(
      verifySignature(secret, request(method, path, body, h), body, now),
      false,
    );
});
test("rejects stale signatures, missing secrets and malformed signatures", () => {
  const raw = JSON.stringify(envelope),
    r = request("POST", BRIDGE_PATH, raw);
  assert.equal(verifySignature(secret, r, raw, now + 301000), false);
  assert.equal(verifySignature("short", r, raw, now), false);
  assert.equal(
    verifySignature(
      secret,
      request("POST", BRIDGE_PATH, raw, { "x-sharefast-signature": "bad" }),
      raw,
      now,
    ),
    false,
  );
});
test("signed GET binds external order ID query", () => {
  const p = BRIDGE_PATH + "?externalOrderId=" + envelope.externalOrderId;
  assert.equal(verifySignature(secret, request("GET", p, ""), "", now), true);
});
test("reads UTF-8 bodies and rejects oversized bytes", async () => {
  assert.equal(
    await readLimitedBody(request("POST", BRIDGE_PATH, "عربي")),
    "عربي",
  );
  await assert.rejects(() =>
    readLimitedBody(request("POST", BRIDGE_PATH, "a".repeat(100)), 10),
  );
});
test("requires an HTTPS origin with no credentials or path", () => {
  assert.equal(bridgeOrigin("https://test.invalid"), "https://test.invalid");
  for (const u of [
    "http://test.invalid",
    "https://test.invalid/api",
    "https://user:password@test.invalid",
    "https://test.invalid/?x=1",
  ])
    assert.throws(() => bridgeOrigin(u));
});
