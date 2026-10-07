import { z } from "zod";

export async function readJsonRecord(
	request: Request,
): Promise<Record<string, unknown>> {
	if (!request.body) throw new Error("bad_json");
	const reader = request.body.getReader();
	const chunks: Uint8Array[] = [];
	let size = 0;
	try {
		for (;;) {
			const part = await reader.read();
			if (part.done) break;
			size += part.value.byteLength;
			if (size > 64 * 1024) {
				void reader.cancel().catch(() => {});
				throw new Error("bad_json");
			}
			chunks.push(part.value);
		}
	} finally {
		reader.releaseLock();
	}
	const bytes = new Uint8Array(size);
	let offset = 0;
	for (const part of chunks) {
		bytes.set(part, offset);
		offset += part.byteLength;
	}
	const value: unknown = JSON.parse(new TextDecoder().decode(bytes));
	if (value === null || typeof value !== "object" || Array.isArray(value))
		throw new Error("bad_json");
	return value as Record<string, unknown>;
}
const text = (max: number) => z.string().trim().min(1).max(max);
const optionalText = (max: number) => z.string().trim().max(max).optional();
const amount = z
	.union([
		z.number(),
		z
			.string()
			.trim()
			.regex(/^\d+(?:\.\d+)?$/),
	])
	.transform(Number)
	.pipe(z.number().finite().nonnegative().max(1_000_000));

export const waslOrderSchema = z.object({
	merchant: text(160),
	merchantZone: text(100),
	fromAddr: text(500),
	destZone: text(100),
	toAddr: text(500),
	fee: amount,
	total: amount
		.refine(Number.isInteger, "Order total must use whole EGP")
		.nullish(),
	readyMinutes: amount.pipe(z.number().int().max(180)).nullish(),
	pay: optionalText(40),
	kind: optionalText(80),
	customerPhone: optionalText(24),
	customerName: optionalText(160),
	note: optionalText(2000),
	source: optionalText(80),
});

export function courierCanWork(
	account: {
		status: string;
		sub_active: boolean | null;
		sub_until?: Date | string | null;
	},
	settings: { enabled: boolean },
	now = Date.now(),
): boolean {
	if (account.status !== "active") return false;
	if (!settings.enabled) return true;
	if (!account.sub_active || !account.sub_until) return false;
	return new Date(account.sub_until).getTime() > now;
}
