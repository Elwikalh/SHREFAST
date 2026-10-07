import { describe, expect, it } from "vitest";
import {
	courierCanWork,
	readJsonRecord,
	waslOrderSchema,
} from "../lib/wasl-validation";
const order = {
	merchant: "نشاط",
	merchantZone: "المعادي",
	fromAddr: "عنوان النشاط",
	destZone: "المقطم",
	toAddr: "عنوان العميل",
	fee: 30,
};
describe("order input", () => {
	it("accepts valid numeric input", () => {
		expect(waslOrderSchema.parse({ ...order, fee: "30" }).fee).toBe(30);
	});
	it.each([-1, NaN, Infinity, null, "", true, {}, 1000001])(
		"rejects invalid fee %s",
		(fee) => {
			expect(waslOrderSchema.safeParse({ ...order, fee }).success).toBe(false);
		},
	);
	it("rejects blank addresses and oversized notes", () => {
		expect(waslOrderSchema.safeParse({ ...order, toAddr: " " }).success).toBe(
			false,
		);
		expect(
			waslOrderSchema.safeParse({ ...order, note: "x".repeat(2001) }).success,
		).toBe(false);
	});
	it("rejects negative totals and invalid ready times", () => {
		expect(waslOrderSchema.safeParse({ ...order, total: -1 }).success).toBe(
			false,
		);
		expect(waslOrderSchema.safeParse({ ...order, total: 1.5 }).success).toBe(
			false,
		);
		expect(
			waslOrderSchema.safeParse({ ...order, readyMinutes: 181 }).success,
		).toBe(false);
	});
	it.each([null, [], "string", 123])(
		"rejects non-object JSON %s",
		async (value) => {
			const request = new Request("http://localhost/test", {
				method: "POST",
				body: JSON.stringify(value),
			});
			await expect(readJsonRecord(request)).rejects.toThrow("bad_json");
		},
	);
});
describe("subscription eligibility", () => {
	const now = Date.parse("2026-10-07T00:00:00Z");
	it("allows active free accounts", () => {
		expect(
			courierCanWork(
				{ status: "active", sub_active: false },
				{ enabled: false },
				now,
			),
		).toBe(true);
	});
	it("never allows suspended accounts", () => {
		expect(
			courierCanWork(
				{ status: "suspended", sub_active: true },
				{ enabled: false },
				now,
			),
		).toBe(false);
	});
	it("requires an unexpired paid subscription", () => {
		expect(
			courierCanWork(
				{ status: "active", sub_active: true, sub_until: "2026-10-08" },
				{ enabled: true },
				now,
			),
		).toBe(true);
		for (const sub_until of [
			undefined,
			"invalid",
			"2026-10-07",
			"2026-10-01",
		]) {
			expect(
				courierCanWork(
					{ status: "active", sub_active: true, sub_until },
					{ enabled: true },
					now,
				),
			).toBe(false);
		}
	});
});
