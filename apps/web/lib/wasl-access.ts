import { normalizeEgyptPhone } from "./wasl-auth-schema";
import { NextResponse } from "next/server";
import { db } from "@el7bboB/db";
import { sql } from "drizzle-orm";
import {
	assertSameOrigin,
	getPrincipal,
	AuthError,
	type Principal,
} from "./wasl-auth";
import { authFailure } from "./wasl-auth-response";
import { readJsonRecord } from "./wasl-validation";
import {
	ensureClientInviteTables,
	ensureCourierTables,
	ensurePartnershipTables,
} from "./wasl-store";
const records = <T>(value: unknown) =>
	Array.isArray(value) ? (value as T[]) : (value as { rows: T[] }).rows;
async function exists(query: ReturnType<typeof sql>) {
	return records(await db.execute(query)).length > 0;
}
/** Every legacy route uses server-derived identity; URL/body refs are never credentials. */
export async function authorizeWasl(
	request: Request,
	resource: string,
): Promise<Principal | Response> {
	try {
		if (!["GET", "HEAD"].includes(request.method)) assertSameOrigin(request);
		const user = await getPrincipal(request);
		if (!user) throw new AuthError("authentication_required", 401);
		if (user.role === "admin") return user;
		if (["admin/control", "inbox"].includes(resource))
			throw new AuthError("forbidden", 403);
		const body =
			request.method === "GET" ? {} : await readJsonRecord(request.clone());
		const params = new URL(request.url).searchParams;
		const value = (key: string) => String(body[key] ?? params.get(key) ?? "");
		const own = (key: string) => {
			const ref = value(key);
			if (ref && ref !== user.ref) throw new AuthError("forbidden", 403);
		};
		if (resource === "register") {
			if (!value("ref")) throw new AuthError("use_auth_registration", 410);
			own("ref");
		}
		if (["couriers", "settlements"].includes(resource)) {
			if (!["merchant", "company"].includes(user.role))
				throw new AuthError("forbidden", 403);
			own("ownerRef");
		}
		if (resource === "settings") {
			const key = value("key");
			if (!key || !key.endsWith(":" + user.ref))
				throw new AuthError("forbidden", 403);
		}
		if (resource === "couriers/join") {
			if (
				user.role !== "courier" ||
				(value("phone") && normalizeEgyptPhone(value("phone")) !== user.phone)
			)
				throw new AuthError("forbidden", 403);
		}
		if (
			(resource.startsWith("clients") && user.role === "merchant") ||
			["partnerships/respond", "partnerships/invites"].includes(resource)
		) {
			// A self-declared phone number is not ownership proof for private invitations.
			if (!user.phoneVerified)
				throw new AuthError("phone_verification_required", 403);
		}
		if (resource.startsWith("clients")) {
			await ensureClientInviteTables();
			if (resource === "clients/resend") {
				if (
					user.role !== "company" ||
					!(await exists(
						sql`SELECT 1 FROM wasl_client_invites WHERE ref = ${value("ref")} AND company_ref = ${user.ref}`,
					))
				)
					throw new AuthError("forbidden", 403);
			} else if (value("ref")) {
				if (
					user.role !== "merchant" ||
					!(await exists(
						sql`SELECT 1 FROM wasl_client_invites WHERE ref = ${value("ref")} AND phone = ${user.phone}`,
					))
				)
					throw new AuthError("forbidden", 403);
			} else if (user.role === "company") own("companyRef");
			else if (
				user.role !== "merchant" ||
				(value("phone") && normalizeEgyptPhone(value("phone")) !== user.phone)
			)
				throw new AuthError("forbidden", 403);
		}
		if (resource.startsWith("partnerships")) {
			await ensurePartnershipTables();
			if (resource === "partnerships" && request.method === "POST") {
				if (user.role !== "merchant") throw new AuthError("forbidden", 403);
				own("founderRef");
			}
			if (resource === "partnerships/invite" || value("partnershipRef")) {
				const founderOnly = resource === "partnerships/invite";
				if (
					!(await exists(sql`SELECT 1 FROM wasl_partnerships p WHERE p.ref = ${value("partnershipRef")}
     AND (p.founder_ref = ${user.ref} OR (${!founderOnly} AND EXISTS (SELECT 1 FROM wasl_partnership_members m WHERE m.partnership_ref = p.ref AND m.entity_ref = ${user.ref})))`))
				)
					throw new AuthError("forbidden", 403);
				if (founderOnly) own("fromRef");
			}
			if (
				resource === "partnerships/respond" &&
				!(await exists(
					sql`SELECT 1 FROM wasl_partnership_invites WHERE ref = ${value("ref")} AND to_phone = ${user.phone}`,
				))
			)
				throw new AuthError("forbidden", 403);
			if (
				resource === "partnerships/invites" &&
				value("phone") &&
				normalizeEgyptPhone(value("phone")) !== user.phone
			)
				throw new AuthError("forbidden", 403);
		}
		if (resource === "courier-auth") {
			if (user.role !== "courier") throw new AuthError("forbidden", 403);
			own("ref");
		}
		if (resource === "company/assign") await ensureClientInviteTables();
		if (resource === "company/assign" && user.role !== "company")
			throw new AuthError("forbidden", 403);
		return user;
	} catch (error) {
		if (
			error instanceof SyntaxError ||
			(error instanceof Error && error.message === "bad_json")
		)
			return NextResponse.json(
				{ ok: false, error: "bad_json" },
				{ status: 400 },
			);
		return authFailure(error);
	}
}
export async function scopedEntities(user: Principal, type?: string) {
	const where =
		user.role === "admin"
			? sql`TRUE`
			: user.role === "company" && type === "merchant"
				? sql`EXISTS (SELECT 1 FROM wasl_client_invites ci WHERE ci.phone = wasl_entities.phone AND ci.company_ref = ${user.ref} AND ci.status = 'accepted')`
				: sql`ref = ${user.ref}`;
	if (user.role === "company" && type === "merchant")
		await ensureClientInviteTables();
	const all = records<import("./wasl-store").WaslEntityRow>(
		await db.execute(
			sql`SELECT * FROM wasl_entities WHERE ${where} ${type ? sql`AND type = ${type}` : sql``} ORDER BY id DESC`,
		),
	);
	return all;
}
export async function scopedOrders(user: Principal) {
	await ensureClientInviteTables();
	await ensureCourierTables();
	const where =
		user.role === "admin"
			? sql`TRUE`
			: user.role === "merchant"
				? sql`o.merchant_ref = ${user.ref}`
				: user.role === "courier"
					? sql`o.courier_ref = ${user.ref} OR EXISTS (SELECT 1 FROM wasl_couriers c WHERE c.ref = o.courier_ref AND c.account_id = ${user.id} AND c.status = 'active')`
					: sql`o.company_ref = ${user.ref} OR EXISTS (
  SELECT 1 FROM wasl_entities e JOIN wasl_client_invites ci ON ci.phone = e.phone AND ci.status = 'accepted'
  WHERE e.ref = o.merchant_ref AND ci.company_ref = ${user.ref})`;
	return records<import("./wasl-store").WaslOrderRow>(
		await db.execute(
			sql`SELECT o.* FROM wasl_orders o WHERE (${where}) ORDER BY o.id DESC LIMIT 100`,
		),
	);
}
export async function ownedCourier(user: Principal, ref: string) {
	await ensureCourierTables();
	return records<{ ref: string; name: string; status: string }>(
		await db.execute(
			sql`SELECT ref, name, status FROM wasl_couriers WHERE ref = ${ref} AND owner_ref = ${user.ref} LIMIT 1`,
		),
	)[0];
}
