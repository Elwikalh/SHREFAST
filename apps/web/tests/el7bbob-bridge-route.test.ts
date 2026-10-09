import { beforeEach, it, expect, vi } from "vitest";
const runtime = vi.hoisted(() => ({
  config: vi.fn(),
  create: vi.fn(),
  read: vi.fn(),
  cancel: vi.fn(),
}));
vi.mock("@/lib/el7bbob-bridge", () => {
  class BridgeError extends Error {
    code: string;
    status: number;
    constructor(code: string, status: number) {
      super(code);
      this.code = code;
      this.status = status;
    }
  }
  return {
    BridgeError,
    bridgeConfig: runtime.config,
    createBridgeOrder: runtime.create,
    readBridgeOrder: runtime.read,
    cancelBridgeOrder: runtime.cancel,
  };
});
import { POST, GET, PATCH } from "../app/api/integrations/el7bbob/orders/route";
import { BridgeError } from "../lib/el7bbob-bridge";
import { signedHeaders, BRIDGE_PATH } from "../lib/sharefast-protocol";
const secret = "test-only-server-secret-more-than-32-characters";
const input = {
  version: 1,
  externalOrderId: "11111111-1111-4111-8111-111111111111",
  displayNumber: "B-261009-0001",
  branchCode: "B",
  destZone: "المنصورة",
  fromAddr: "عنوان المطعم",
  toAddr: "عنوان العميل كامل",
  feeEGP: 10,
  totalEGP: 100,
  paymentMethod: "cash",
  customerName: "عميل اختبار",
  customerPhone: "01000000001",
  note: "",
  source: "client_online",
};
const order = {
  externalOrderId: input.externalOrderId,
  ref: "SX-42",
  status: "searching",
  courier: null,
};
const request = (method: string, path: string, raw = "", signed = true) =>
  new Request("https://test.invalid" + path, {
    method,
    headers: signed ? signedHeaders(secret, method, path, raw) : {},
    ...(raw ? { body: raw } : {}),
  });
beforeEach(() => {
  vi.clearAllMocks();
  runtime.config.mockImplementation(() => ({
    secret,
    merchantRef: "bound-restaurant",
    companyRef: "",
  }));
  runtime.create.mockResolvedValue({ created: true, order });
  runtime.read.mockResolvedValue(order);
  runtime.cancel.mockResolvedValue({ ...order, status: "canceled" });
});
it("rejects unsigned calls before touching storage", async () => {
  expect(
    (await POST(request("POST", BRIDGE_PATH, JSON.stringify(input), false)))
      .status,
  ).toBe(401);
  expect(runtime.create).not.toHaveBeenCalled();
});
it("is disabled by server configuration, without touching storage", async () => {
  runtime.config.mockImplementationOnce(() => {
    throw new BridgeError("bridge_disabled_or_unconfigured", 503);
  });
  expect(
    (await POST(request("POST", BRIDGE_PATH, JSON.stringify(input)))).status,
  ).toBe(503);
  expect(runtime.create).not.toHaveBeenCalled();
});
it("accepts signed creation and applies the server-bound merchant", async () => {
  const response = await POST(
    request("POST", BRIDGE_PATH, JSON.stringify(input)),
  );
  expect(response.status).toBe(201);
  expect(runtime.create).toHaveBeenCalledWith(input, "bound-restaurant", "");
  expect(response.headers.get("cache-control")).toBe("no-store");
});
it("rejects attempts to supply a merchant identity", async () => {
  expect(
    (
      await POST(
        request(
          "POST",
          BRIDGE_PATH,
          JSON.stringify({ ...input, merchantRef: "other" }),
        ),
      )
    ).status,
  ).toBe(400);
  expect(runtime.create).not.toHaveBeenCalled();
});
it("rejects malformed, null and oversized request bodies", async () => {
  for (const raw of ["{", "null", "a".repeat(20000)])
    expect((await POST(request("POST", BRIDGE_PATH, raw))).status).toBe(400);
  expect(runtime.create).not.toHaveBeenCalled();
});
it("looks up only an explicitly signed external order ID", async () => {
  const path = BRIDGE_PATH + "?externalOrderId=" + input.externalOrderId;
  expect((await GET(request("GET", path))).status).toBe(200);
  expect(runtime.read).toHaveBeenCalledWith(
    input.externalOrderId,
    "bound-restaurant",
  );
  expect(
    (
      await GET(
        request("GET", path + "&externalOrderId=" + input.externalOrderId),
      )
    ).status,
  ).toBe(400);
});
it("accepts an authenticated cancellation without permitting status overrides", async () => {
  expect(
    (
      await PATCH(
        request(
          "PATCH",
          BRIDGE_PATH,
          JSON.stringify({ externalOrderId: input.externalOrderId }),
        ),
      )
    ).status,
  ).toBe(200);
  expect(
    (
      await PATCH(
        request(
          "PATCH",
          BRIDGE_PATH,
          JSON.stringify({
            externalOrderId: input.externalOrderId,
            status: "delivered",
          }),
        ),
      )
    ).status,
  ).toBe(400);
});
it("keeps conflict errors reviewable and hides database details", async () => {
  runtime.create.mockRejectedValueOnce(
    new BridgeError("idempotency_conflict", 409),
  );
  expect(
    (await POST(request("POST", BRIDGE_PATH, JSON.stringify(input)))).status,
  ).toBe(409);
  runtime.create.mockRejectedValueOnce(new Error("private db details"));
  const spy = vi.spyOn(console, "error").mockImplementation(() => {});
  const response = await POST(
    request("POST", BRIDGE_PATH, JSON.stringify(input)),
  );
  expect(response.status).toBe(503);
  expect(await response.text()).not.toContain("private db details");
  spy.mockRestore();
});

it("requires a trusted quote when rollout quote enforcement is enabled",async()=>{
 runtime.config.mockReturnValue({secret,merchantRef:"bound-restaurant",companyRef:"",requireQuotes:true});
 const r=await POST(request("POST",BRIDGE_PATH,JSON.stringify(input)));expect(r.status).toBe(409);expect((await r.json()).error).toBe("quote_required");expect(runtime.create).not.toHaveBeenCalled();
 const withQuote={...input,quote:{id:"22222222-2222-4222-8222-222222222222",acceptedAt:new Date().toISOString()}};
 expect((await POST(request("POST",BRIDGE_PATH,JSON.stringify(withQuote)))).status).toBe(201);
});
