import { beforeEach, it, expect, vi } from "vitest";
const f = vi.hoisted(() => ({
  config: vi.fn(),
  issue: vi.fn(),
  read: vi.fn(),
}));
vi.mock("@/lib/el7bbob-bridge", () => {
  class BridgeError extends Error {
    constructor(
      public code: string,
      public status: number,
    ) {
      super(code);
    }
  }
  return { bridgeConfig: f.config, BridgeError };
});
vi.mock("@/lib/el7bbob-quotes", () => {
  class QuoteError extends Error {
    constructor(
      public code: string,
      public status: number,
    ) {
      super(code);
    }
  }
  return { issueBridgeQuote: f.issue, readBridgeQuote: f.read, QuoteError };
});
import { POST, GET } from "../app/api/integrations/el7bbob/quote/route";
import { signedHeaders } from "../lib/sharefast-protocol";
import { QuoteError } from "../lib/el7bbob-quotes";
const secret = "test-only-quote-secret-at-least-32-characters",
  path = "/api/integrations/el7bbob/quote",
  id = "11111111-1111-4111-8111-111111111111";
const request = (method: string, p: string, raw = "", signed = true) =>
  new Request("https://test.invalid" + p, {
    method,
    headers: signed ? signedHeaders(secret, method, p, raw) : {},
    ...(raw ? { body: raw } : {}),
  });
beforeEach(() => {
  vi.clearAllMocks();
  f.config.mockReturnValue({ secret, merchantRef: "root" });
  f.issue.mockResolvedValue({ id, feeEGP: 15 });
  f.read.mockResolvedValue({ id, feeEGP: 15 });
});
it("requires signed issuance and server-owned merchant identity", async () => {
  const raw = JSON.stringify({ branchCode: "MAIN", destZone: "ميدان مشعل" });
  expect((await POST(request("POST", path, raw, false))).status).toBe(401);
  expect(f.issue).not.toHaveBeenCalled();
  const r = await POST(request("POST", path, raw));
  expect(r.status).toBe(201);
  expect(r.headers.get("cache-control")).toBe("no-store");
  expect(f.issue).toHaveBeenCalledWith("MAIN", "ميدان مشعل", "root");
});
it("rejects custom fee/merchant, malformed and oversized issuance", async () => {
  for (const raw of [
    "null",
    "{",
    "x".repeat(17000),
    JSON.stringify({ branchCode: "MAIN", destZone: "المنصورة", feeEGP: 0 }),
    JSON.stringify({
      branchCode: "MAIN",
      destZone: "المنصورة",
      merchantRef: "other",
    }),
  ])
    expect((await POST(request("POST", path, raw))).status).toBe(400);
  expect(f.issue).not.toHaveBeenCalled();
});
it("only reads one signed UUID with no query injection", async () => {
  const p = path + "?id=" + id;
  expect((await GET(request("GET", p))).status).toBe(200);
  expect(f.read).toHaveBeenCalledWith(id, "root");
  for (const bad of [
    path,
    p + "&id=" + id,
    p + "&merchantRef=other",
    path + "?id=bad",
  ])
    expect((await GET(request("GET", bad))).status).toBe(400);
});
it("signatures bind query and body; edited destinations cannot reuse a signature", async () => {
  const raw = JSON.stringify({ branchCode: "MAIN", destZone: "ميدان مشعل" });
  const r = new Request("https://test.invalid" + path, {
    method: "POST",
    headers: signedHeaders(secret, "POST", path, raw),
    body: JSON.stringify({ branchCode: "MAIN", destZone: "طلخا" }),
  });
  expect((await POST(r)).status).toBe(401);
  const q = new Request("https://test.invalid" + path + "?id=" + id, {
    headers: signedHeaders(
      secret,
      "GET",
      path + "?id=22222222-2222-4222-8222-222222222222",
      "",
    ),
  });
  expect((await GET(q)).status).toBe(401);
  expect(f.issue).not.toHaveBeenCalled();
  expect(f.read).not.toHaveBeenCalled();
});
it("keeps known expired errors reviewable without leaking database internals", async () => {
  f.read.mockRejectedValueOnce(new QuoteError("quote_expired", 410));
  expect((await GET(request("GET", path + "?id=" + id))).status).toBe(410);
  f.read.mockRejectedValueOnce(Error("private SQL credentials"));
  const r = await GET(request("GET", path + "?id=" + id));
  expect(r.status).toBe(503);
  expect(await r.text()).not.toContain("private");
});
