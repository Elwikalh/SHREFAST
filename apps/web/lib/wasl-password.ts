import { createHash, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const derive = promisify(scrypt);
const KEY_LENGTH = 64;
const HEX_SALT = /^[a-f0-9]{32}$/;
const HEX_KEY = /^[a-f0-9]{128}$/;

/** Async scrypt keeps password work off the server event loop. */
export async function hashWaslPassword(password: string): Promise<string> {
	const salt = randomBytes(16).toString("hex");
	const key = (await derive(password, salt, KEY_LENGTH)) as Buffer;
	return `scrypt$${salt}$${key.toString("hex")}`;
}

/** Verify old salted SHA-256 hashes only for migration on successful login. */
export async function verifyWaslPassword(
	password: string,
	stored: string,
): Promise<boolean> {
	const parts = stored.split("$");
	if (parts[0] === "scrypt") {
		const [, salt, key] = parts;
		if (
			parts.length !== 3 ||
			!salt ||
			!key ||
			!HEX_SALT.test(salt) ||
			!HEX_KEY.test(key)
		)
			return false;
		const actual = (await derive(password, salt, KEY_LENGTH)) as Buffer;
		return timingSafeEqual(actual, Buffer.from(key, "hex"));
	}
	const [salt, key] = parts;
	if (
		parts.length !== 2 ||
		!salt ||
		!key ||
		!HEX_SALT.test(salt) ||
		!/^[a-f0-9]{64}$/.test(key)
	)
		return false;
	const actual = createHash("sha256")
		.update(salt + password)
		.digest();
	return timingSafeEqual(actual, Buffer.from(key, "hex"));
}
