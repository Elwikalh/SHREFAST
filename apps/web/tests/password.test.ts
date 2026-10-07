import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import { hashWaslPassword, verifyWaslPassword } from "../lib/wasl-password";
describe("password hashing", () => {
	it("uses salted scrypt and verifies correct passwords", async () => {
		const hash = await hashWaslPassword("test-password-123");
		expect(hash).toMatch(/^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/);
		expect(await verifyWaslPassword("test-password-123", hash)).toBe(true);
		expect(await verifyWaslPassword("incorrect", hash)).toBe(false);
		expect(await hashWaslPassword("test-password-123")).not.toBe(hash);
	});
	it("accepts valid legacy hashes for transparent migration", async () => {
		const salt = "ab".repeat(16);
		const digest = createHash("sha256")
			.update(salt + "legacy-password")
			.digest("hex");
		expect(
			await verifyWaslPassword("legacy-password", `${salt}$${digest}`),
		).toBe(true);
		expect(await verifyWaslPassword("wrong", `${salt}$${digest}`)).toBe(false);
	});
	it.each([
		"",
		"bad$hash",
		"scrypt$bad$bad",
		"scrypt$" + "ab".repeat(16) + "$ff",
		"x$y$z",
	])("safely rejects malformed hash %s", async (stored) => {
		expect(await verifyWaslPassword("password", stored)).toBe(false);
	});
});
