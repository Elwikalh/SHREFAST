import { createHmac } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { verifyMetaSignature } from "../lib/wasl-webhook";
const { store } = vi.hoisted(() => ({
	store: vi.fn().mockResolvedValue({ ref: "WX-1" }),
}));
vi.mock("@/lib/wasl-store", () => ({ createWaslInboxMessage: store }));
import { POST } from "../app/api/wasl/inbound/route";
const secret = "test-webhook-secret";
const raw = JSON.stringify({
	entry: [
		{
			changes: [
				{
					value: {
						messages: [
							{
								id: "wamid.test",
								from: "201012345678",
								type: "text",
								text: { body: "طلب جديد" },
							},
						],
					},
				},
			],
		},
	],
});
const sign = (s: string) =>
	"sha256=" + createHmac("sha256", secret).update(s).digest("hex");
const req = (body: string, signature = sign(body)) =>
	new Request("http://localhost/api/wasl/inbound", {
		method: "POST",
		body,
		headers: { "x-hub-signature-256": signature },
	});
afterEach(() => {
	vi.unstubAllEnvs();
	store.mockReset();
	store.mockResolvedValue({ ref: "WX-1" });
});
describe("webhook verification", () => {
	it("checks signature without throwing on malformed input", () => {
		expect(verifyMetaSignature(raw, sign(raw), secret)).toBe(true);
		for (const h of [null, "sha256=bad", sign(raw).slice(1), sign("tampered")])
			expect(verifyMetaSignature(raw, h, secret)).toBe(false);
		expect(verifyMetaSignature(raw, sign(raw), "")).toBe(false);
	});
	it("fails closed when missing the app secret", async () => {
		vi.stubEnv("WASL_META_APP_SECRET", "");
		expect((await POST(req(raw))).status).toBe(503);
		expect(store).not.toHaveBeenCalled();
	});
	it("rejects an unsigned request", async () => {
		vi.stubEnv("WASL_META_APP_SECRET", secret);
		expect((await POST(req(raw, ""))).status).toBe(401);
		expect(store).not.toHaveBeenCalled();
	});
	it("passes provider message ID for retry deduplication", async () => {
		vi.stubEnv("WASL_META_APP_SECRET", secret);
		expect((await POST(req(raw))).status).toBe(200);
		expect(store).toHaveBeenCalledWith(
			expect.objectContaining({ messageId: "wamid.test", body: "طلب جديد" }),
		);
	});
	it("rejects malformed signed JSON", async () => {
		vi.stubEnv("WASL_META_APP_SECRET", secret);
		expect((await POST(req("null"))).status).toBe(400);
	});
	it("requests retries on a storage failure", async () => {
		vi.stubEnv("WASL_META_APP_SECRET", secret);
		store.mockRejectedValueOnce(new Error("test database unavailable"));
		expect((await POST(req(raw))).status).toBe(503);
	});
});
