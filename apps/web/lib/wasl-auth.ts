import { createHash, randomBytes, randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { db } from "@el7bboB/db";
import { ensureTables, verifyWaslCourierLogin } from "./wasl-store";
import { hashWaslPassword, verifyWaslPassword } from "./wasl-password";
import type { z } from "zod";
import type { registrationSchema, loginSchema } from "./wasl-auth-schema";

export type Principal = {
	id: string;
	role: "merchant" | "company" | "courier" | "admin";
	ref: string;
	name: string;
	phone: string;
	zone: string;
	governorate: string;
	address: string;
	businessType?: string | null;
	status: string;
	phoneVerified: boolean;
};
type Account = {
	id: string;
	role: Principal["role"];
	entity_ref: string | null;
	courier_ref: string | null;
	name: string;
	phone: string;
	password_hash: string;
	status: string;
};
export class AuthError extends Error {
	constructor(
		public code: string,
		public status = 400,
	) {
		super(code);
	}
}
export const cookieName = () =>
	process.env.NODE_ENV === "production"
		? "__Host-sharefast_session"
		: "sharefast_session";
export const SESSION_SECONDS = 30 * 24 * 3600;
const digest = (token: string) =>
	createHash("sha256").update(token).digest("hex");
function rows<T>(value: unknown): T[] {
	return Array.isArray(value) ? (value as T[]) : (value as { rows: T[] }).rows;
}
let initialized: Promise<void> | undefined;
export function ensureAuthTables() {
	return (initialized ??= (async () => {
		await ensureTables();
		await db.execute(
			sql`ALTER TABLE wasl_courier_accounts ADD COLUMN IF NOT EXISTS address TEXT NOT NULL DEFAULT ''`,
		);
		await db.execute(sql`CREATE TABLE IF NOT EXISTS wasl_accounts (
   id TEXT PRIMARY KEY, role TEXT NOT NULL CHECK (role IN ('merchant','company','courier','admin')),
   entity_ref TEXT REFERENCES wasl_entities(ref), courier_ref TEXT REFERENCES wasl_courier_accounts(ref),
   name TEXT NOT NULL, phone TEXT NOT NULL, password_hash TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'active',
   created_at TIMESTAMPTZ NOT NULL DEFAULT now(), UNIQUE (phone, role),
   UNIQUE (entity_ref), UNIQUE (courier_ref)
  )`);
		await db.execute(
			sql`ALTER TABLE wasl_accounts ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMPTZ`,
		);
		await db.execute(
			sql`ALTER TABLE wasl_accounts ADD COLUMN IF NOT EXISTS consent_at TIMESTAMPTZ`,
		);
		await db.execute(
			sql`ALTER TABLE wasl_accounts ADD COLUMN IF NOT EXISTS consent_version TEXT`,
		);
		await db.execute(sql`CREATE TABLE IF NOT EXISTS wasl_sessions (
   token_hash TEXT PRIMARY KEY, account_id TEXT NOT NULL REFERENCES wasl_accounts(id) ON DELETE CASCADE,
   expires_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`);
		await db.execute(
			sql`CREATE INDEX IF NOT EXISTS wasl_sessions_expiry_idx ON wasl_sessions(expires_at)`,
		);
		await db.execute(sql`CREATE TABLE IF NOT EXISTS wasl_auth_limits (
   bucket TEXT PRIMARY KEY, attempts INTEGER NOT NULL, reset_at TIMESTAMPTZ NOT NULL
  )`);
	})().catch((error) => {
		initialized = undefined;
		throw error;
	}));
}
export function assertSameOrigin(request: Request) {
 const origin = request.headers.get("origin");
 if (!origin) throw new AuthError("invalid_origin", 403);
 let parsed: URL;
 try { parsed = new URL(origin); } catch { throw new AuthError("invalid_origin", 403); }
 if (parsed.origin !== origin || (process.env.NODE_ENV === "production" && parsed.protocol !== "https:")) throw new AuthError("invalid_origin", 403);
 const allowed = new Set([new URL(request.url).origin]);
 // Read public configuration dynamically: Docker runtime values must not be frozen into the build.
 for (const key of ["NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_APP_URL", "RAILWAY_PUBLIC_DOMAIN"]) {
  const value = process.env[key]; if (!value) continue;
  try { allowed.add(new URL(key === "RAILWAY_PUBLIC_DOMAIN" ? `https://${value}` : value).origin); } catch {}
 }
 // Next standalone can receive an internal HTTP URL behind Railway TLS termination.
 // Host is the request authority; never trust an arbitrary X-Forwarded-Host as an origin allowlist.
 const host = request.headers.get("host");
 if (host && /^[a-zA-Z0-9.-]+(?::[0-9]{1,5})?$/.test(host)) {
  try { allowed.add(new URL(`https://${host}`).origin); } catch {}
 }
 if (!allowed.has(origin)) throw new AuthError("invalid_origin", 403);
}
export async function rateLimit(
	request: Request,
	purpose: string,
	phone: string,
) {
	await ensureAuthTables();
	const ip =
		request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
	for (const [key, cap] of [
		[`${purpose}:phone:${phone}`, 10],
		[`${purpose}:ip:${ip}`, 50],
	] as const) {
		const bucket = digest(key);
		const result =
			await db.execute(sql`INSERT INTO wasl_auth_limits (bucket, attempts, reset_at)
   VALUES (${bucket}, 1, now() + interval '15 minutes')
   ON CONFLICT (bucket) DO UPDATE SET
    attempts = CASE WHEN wasl_auth_limits.reset_at <= now() THEN 1 ELSE wasl_auth_limits.attempts + 1 END,
    reset_at = CASE WHEN wasl_auth_limits.reset_at <= now() THEN now() + interval '15 minutes' ELSE wasl_auth_limits.reset_at END
   RETURNING attempts`);
		if ((rows<{ attempts: number }>(result)[0]?.attempts || 0) > cap)
			throw new AuthError("too_many_attempts", 429);
	}
	await db.execute(
		sql`DELETE FROM wasl_auth_limits WHERE reset_at < now() - interval '1 day'`,
	);
}
export async function registerAccount(
	data: z.infer<typeof registrationSchema>,
) {
	await ensureAuthTables();
	// Pre-account business records have no ownership proof: never claim them by phone alone.
	if (data.role !== "courier") {
		const legacy =
			await db.execute(sql`SELECT 1 FROM wasl_entities e WHERE e.phone = ${data.phone} AND e.type = ${data.role}
   AND NOT EXISTS (SELECT 1 FROM wasl_accounts a WHERE a.entity_ref = e.ref) LIMIT 1`);
		if (rows(legacy).length)
			throw new AuthError("legacy_account_requires_verification", 409);
	}
	const passwordHash = await hashWaslPassword(data.password);
	try {
		return await db.transaction(async (tx) => {
			let entityRef: string | null = null,
				courierRef: string | null = null;
			if (data.role === "courier") {
				const result = await tx.execute(sql`INSERT INTO wasl_courier_accounts
     (ref, name, phone, password_hash, national_id, vehicle, governorate, zone, status, address)
     VALUES ('CRX-' || nextval('wasl_courier_acct_seq'), ${data.name}, ${data.phone}, ${passwordHash}, ${data.nationalId || null}, ${data.vehicle}, ${data.governorate}, ${data.zone}, 'active', ${data.address}) RETURNING ref`);
				courierRef = rows<{ ref: string }>(result)[0]!.ref;
			} else {
				const result = await tx.execute(sql`INSERT INTO wasl_entities
     (ref, type, name, phone, governorate, zone, address, business_type, coverage_json)
     VALUES ('SX-' || nextval('wasl_entity_seq'), ${data.role}, ${data.name}, ${data.phone}, ${data.governorate}, ${data.zone}, ${data.address}, ${data.businessType || null}, ${JSON.stringify(data.coverage)}) RETURNING ref`);
				entityRef = rows<{ ref: string }>(result)[0]!.ref;
			}
			const result =
				await tx.execute(sql`INSERT INTO wasl_accounts (id, role, entity_ref, courier_ref, name, phone, password_hash, consent_at, consent_version)
    VALUES (${randomUUID()}, ${data.role}, ${entityRef}, ${courierRef}, ${data.name}, ${data.phone}, ${passwordHash}, now(), 'registration-v1') RETURNING *`);
			return rows<Account>(result)[0]!;
		});
	} catch (error) {
		if (databaseCode(error) === "23505")
			throw new AuthError("account_exists", 409);
		throw error;
	}
}
function databaseCode(error: unknown): string | undefined {
	const e = error as { code?: string; cause?: unknown };
	return e?.code || (e?.cause ? databaseCode(e.cause) : undefined);
}
export async function loginAccount(data: z.infer<typeof loginSchema>) {
	await ensureAuthTables();
	let account = rows<Account>(
		await db.execute(
			sql`SELECT * FROM wasl_accounts WHERE phone = ${data.phone} AND role = ${data.role} LIMIT 1`,
		),
	)[0];
	if (!account && data.role === "courier") {
		// Migration is allowed only after verifying the pre-existing courier password.
		const legacy = await verifyWaslCourierLogin(data.phone, data.password);
		if (legacy) {
			const hash = await hashWaslPassword(data.password);
			account = rows<Account>(
				await db.execute(sql`INSERT INTO wasl_accounts (id, role, courier_ref, name, phone, password_hash)
    VALUES (${randomUUID()}, 'courier', ${legacy.ref}, ${legacy.name}, ${legacy.phone}, ${hash})
    ON CONFLICT (phone, role) DO UPDATE SET phone = EXCLUDED.phone RETURNING *`),
			)[0];
		}
	}
	if (
		!account ||
		account.status !== "active" ||
		!(await verifyWaslPassword(data.password, account.password_hash))
	) {
		// Avoid the very cheap unknown-user path. Rate limits also cover these requests.
		if (!account) await hashWaslPassword(data.password);
		throw new AuthError("bad_credentials", 401);
	}
	return account;
}
export async function createSession(accountId: string) {
	const token = randomBytes(32).toString("hex");
	await db.execute(sql`DELETE FROM wasl_sessions WHERE expires_at <= now()`);
	await db.execute(sql`INSERT INTO wasl_sessions (token_hash, account_id, expires_at)
  VALUES (${digest(token)}, ${accountId}, now() + interval '30 days')`);
	return token;
}
export function sessionToken(request: Request): string | null {
	const token = request.headers
		.get("cookie")
		?.split(";")
		.map((x) => x.trim())
		.find((x) => x.startsWith(cookieName() + "="))
		?.slice(cookieName().length + 1);
	return token && /^[a-f0-9]{64}$/.test(token) ? token : null;
}
export async function getPrincipal(
	request: Request,
): Promise<Principal | null> {
	const token = sessionToken(request);
	if (!token) return null;
	await ensureAuthTables();
	const result =
		await db.execute(sql`SELECT a.id, a.role, COALESCE(a.entity_ref, a.courier_ref, a.id) AS ref,
  a.name, a.phone, a.status, (a.phone_verified_at IS NOT NULL) AS "phoneVerified", COALESCE(e.zone, c.zone, '') AS zone, COALESCE(e.governorate, c.governorate, '') AS governorate,
  COALESCE(e.address, c.address, '') AS address, e.business_type AS "businessType"
  FROM wasl_sessions s JOIN wasl_accounts a ON a.id = s.account_id
  LEFT JOIN wasl_entities e ON e.ref = a.entity_ref LEFT JOIN wasl_courier_accounts c ON c.ref = a.courier_ref
  WHERE s.token_hash = ${digest(token)} AND s.expires_at > now() AND a.status = 'active'
  AND (a.role <> 'courier' OR c.status = 'active') LIMIT 1`);
	return rows<Principal>(result)[0] || null;
}
export async function destroySession(request: Request) {
	const token = sessionToken(request);
	if (token) {
		await ensureAuthTables();
		await db.execute(
			sql`DELETE FROM wasl_sessions WHERE token_hash = ${digest(token)}`,
		);
	}
}
export function setSessionCookie(
	response: import("next/server").NextResponse,
	token: string,
) {
	response.cookies.set(cookieName(), token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: SESSION_SECONDS,
	});
}
