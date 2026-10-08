import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ access: vi.fn(), quote: vi.fn() }));
vi.mock("@/lib/wasl-access", () => ({ authorizeWasl: mocks.access }));
vi.mock("@/lib/wasl-store", () => ({ quoteWaslDelivery: mocks.quote }));
import { GET } from "../app/api/wasl/orders/quote/route";
beforeEach(() => { mocks.access.mockResolvedValue({ role: "merchant", zone: "المعادي", address: "شارع المطعم" }); mocks.quote.mockReturnValue({ km: 4, feeMin: 35, feeMax: 50 }); });
describe("authenticated quick-request price quote", () => {
 it("keeps the server-side pickup and quoted price inside the allowed range", async () => {
  const response = await GET(new Request("https://example.test/api/wasl/orders/quote?zone=" + encodeURIComponent("المقطم") + "&merchantZone=fake"));
  expect(response.status).toBe(200); expect(response.headers.get("cache-control")).toBe("no-store");
  expect(mocks.quote).toHaveBeenCalledWith("المعادي", "المقطم");
  expect((await response.json()).quote).toEqual({ zone: "المقطم", km: 4, feeMin: 35, feeMax: 50, fee: 45 });
 });
 it("does not quote to an unauthenticated visitor", async () => { mocks.access.mockResolvedValue(Response.json({ok:false},{status:401})); expect((await GET(new Request("https://example.test/?zone=Maadi"))).status).toBe(401); expect(mocks.quote).not.toHaveBeenCalled(); });
 it.each(["courier", "company", "admin"])("does not expose the restaurant flow to %s", async role => { mocks.access.mockResolvedValue({role,zone:"المعادي",address:"عنوان"}); expect((await GET(new Request("https://example.test/?zone=Maadi"))).status).toBe(403); expect(mocks.quote).not.toHaveBeenCalled(); });
 it.each(["", "x", "x".repeat(101)])("rejects invalid destination input", async zone => { expect((await GET(new Request("https://example.test/?zone=" + zone))).status).toBe(400); expect(mocks.quote).not.toHaveBeenCalled(); });
 it("requires a real pickup address instead of using demonstration data", async () => { mocks.access.mockResolvedValue({role:"merchant",zone:"المعادي",address:""}); expect((await GET(new Request("https://example.test/?zone=Maadi"))).status).toBe(409); expect(mocks.quote).not.toHaveBeenCalled(); });
});
