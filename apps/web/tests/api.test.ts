import { afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "../lib/wasl-api";
afterEach(() => {
	vi.unstubAllGlobals();
	vi.useRealTimers();
});
describe("portal API client", () => {
	it("deduplicates overlapping GETs and provides independent response bodies", async () => {
		const mock = vi.fn().mockResolvedValue(Response.json({ ok: true }));
		vi.stubGlobal("fetch", mock);
		const responses = await Promise.all([
			apiFetch("/api/test"),
			apiFetch("/api/test"),
		]);
		expect(mock).toHaveBeenCalledTimes(1);
		expect(await responses[0]!.json()).toEqual({ ok: true });
		expect(await responses[1]!.json()).toEqual({ ok: true });
	});
	it("does not deduplicate mutations", async () => {
		const mock = vi
			.fn()
			.mockImplementation(() => Promise.resolve(Response.json({ ok: true })));
		vi.stubGlobal("fetch", mock);
		await Promise.all([
			apiFetch("/api/test", { method: "POST" }),
			apiFetch("/api/test", { method: "POST" }),
		]);
		expect(mock).toHaveBeenCalledTimes(2);
	});
	it("preserves HTTP errors for existing UI handlers", async () => {
		vi.stubGlobal(
			"fetch",
			vi
				.fn()
				.mockResolvedValue(
					Response.json({ error: "invalid_fields" }, { status: 400 }),
				),
		);
		expect((await apiFetch("/api/error")).status).toBe(400);
	});
	it("aborts hanging requests after 15 seconds", async () => {
		vi.useFakeTimers();
		vi.stubGlobal(
			"fetch",
			vi.fn().mockImplementation(
				(_input, init: RequestInit) =>
					new Promise((_resolve, reject) => {
						init.signal!.addEventListener(
							"abort",
							() => reject(init.signal!.reason),
							{ once: true },
						);
					}),
			),
		);
		const promise = apiFetch("/api/hanging");
		const assertion = expect(promise).rejects.toThrow("request_timeout");
		await vi.advanceTimersByTimeAsync(15_000);
		await assertion;
	});
});
