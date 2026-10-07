import { normalizeEgyptPhone } from "@/lib/wasl-auth-schema";
import { db } from "@el7bboB/db";
import { sql } from "drizzle-orm";
import { authorizeWasl } from "@/lib/wasl-access";
import { readJsonRecord } from "@/lib/wasl-validation";
import { NextResponse } from "next/server";
import {
	createWaslClientInvite,
	listWaslClientInvites,
} from "@/lib/wasl-store";

export const dynamic = "force-dynamic";

function inviteToClient(v: Record<string, unknown>) {
	return {
		ref: v.ref,
		companyRef: v.company_ref,
		companyName: v.company_name,
		merchantName: v.merchant_name,
		phone: v.phone,
		zone: v.zone,
		status: v.status,
		sentCount: v.sent_count,
		created: v.created_at,
	};
}

export async function GET(request: Request) {
	const access = await authorizeWasl(request, "clients");
	if (access instanceof Response) return access;
	if (access.role === "merchant") {
		const invites = await db.execute(
			sql`SELECT * FROM wasl_client_invites WHERE phone = ${access.phone} ORDER BY id DESC`,
		);
		return NextResponse.json({
			ok: true,
			invites: (Array.isArray(invites)
				? invites
				: (invites as { rows: Record<string, unknown>[] }).rows
			).map(inviteToClient),
		});
	}
	const companyRef =
		access.role === "company"
			? access.ref
			: new URL(request.url).searchParams.get("companyRef") || "";
	if (!companyRef)
		return NextResponse.json(
			{ ok: false, error: "invalid_fields" },
			{ status: 400 },
		);
	try {
		const rows = await listWaslClientInvites(companyRef);
		return NextResponse.json({ ok: true, invites: rows.map(inviteToClient) });
	} catch (error) {
		console.error("[wasl] client invites list failed", error);
		return NextResponse.json(
			{ ok: false, error: "db_unavailable" },
			{ status: 503 },
		);
	}
}

export async function POST(request: Request) {
	const access = await authorizeWasl(request, "clients");
	if (access instanceof Response) return access;
	let body: Record<string, unknown>;
	try {
		body = await readJsonRecord(request);
	} catch {
		return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
	}
	if (
		access.role === "merchant" &&
		body.ref &&
		["accept", "decline"].includes(String(body.action))
	) {
		const result = await db.execute(
			sql`UPDATE wasl_client_invites SET status = ${body.action === "accept" ? "accepted" : "declined"}, responded_at = now() WHERE ref = ${String(body.ref)} AND phone = ${access.phone} AND status = 'pending' RETURNING ref`,
		);
		return NextResponse.json({
			ok: Array.isArray(result) && result.length > 0,
		});
	}
	if (access.role !== "company" && access.role !== "admin")
		return NextResponse.json(
			{ ok: false, error: "forbidden" },
			{ status: 403 },
		);
	const companyRef =
		access.role === "company"
			? access.ref
			: String(body.companyRef || "").trim();
	const companyName =
		access.role === "company"
			? access.name
			: String(body.companyName || "").trim();
	const merchantName = String(body.merchantName || "").trim();
	const phone = normalizeEgyptPhone(String(body.phone || ""));
	const zone = String(body.zone || "").trim();
	if (
		!companyRef ||
		merchantName.length < 2 ||
		!/^01[0125]\d{8}$/.test(phone) ||
		!zone
	) {
		return NextResponse.json(
			{ ok: false, error: "invalid_fields" },
			{ status: 400 },
		);
	}
	try {
		const invite = await createWaslClientInvite({
			companyRef,
			companyName,
			merchantName,
			phone,
			zone,
		});
		return NextResponse.json({ ok: true, invite: inviteToClient(invite) });
	} catch (error) {
		const message = error instanceof Error ? error.message : "db_unavailable";
		if (message === "invite_pending")
			return NextResponse.json({ ok: false, error: message }, { status: 409 });
		console.error("[wasl] client invite create failed", error);
		return NextResponse.json(
			{ ok: false, error: "db_unavailable" },
			{ status: 503 },
		);
	}
}
