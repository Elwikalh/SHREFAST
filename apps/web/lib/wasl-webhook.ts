import { createHmac, timingSafeEqual } from "node:crypto";
export function verifyMetaSignature(
	raw: string,
	header: string | null,
	secret: string,
): boolean {
	if (!secret || !header || !/^sha256=[a-f0-9]{64}$/.test(header)) return false;
	const expected = createHmac("sha256", secret).update(raw, "utf8").digest();
	return timingSafeEqual(expected, Buffer.from(header.slice(7), "hex"));
}
