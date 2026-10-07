import { normalizeEgyptPhone } from "@/lib/wasl-auth-schema";
import { authorizeWasl } from "@/lib/wasl-access";
import { readJsonRecord } from "@/lib/wasl-validation";
import { NextResponse } from "next/server";
import { createWaslCourier, listWaslCouriers } from "@/lib/wasl-store";

export const dynamic = "force-dynamic";

function courierToClient(c: Record<string, unknown>) {
	return {
		ref: c.ref,
		ownerRef: c.owner_ref,
		ownerName: c.owner_name,
		name: c.name,
		phone: c.phone,
		zone: c.zone,
		vehicle: c.vehicle,
		status: c.status,
		inviteCode: c.invite_code,
		joined: c.joined_at,
	};
}

export async function GET(request: Request) {
	const access = await authorizeWasl(request, "couriers");
	if (access instanceof Response) return access;
	const ownerRef = new URL(request.url).searchParams.get("ownerRef") || "";
	if (!ownerRef)
		return NextResponse.json(
			{ ok: false, error: "invalid_fields" },
			{ status: 400 },
		);
	try {
		const rows = await listWaslCouriers(ownerRef);
		return NextResponse.json({ ok: true, couriers: rows.map(courierToClient) });
	} catch (error) {
		console.error("[wasl] couriers list failed", error);
		return NextResponse.json(
			{ ok: false, error: "db_unavailable" },
			{ status: 503 },
		);
	}
}

export async function POST(request: Request) {
	const access = await authorizeWasl(request, "couriers");
	if (access instanceof Response) return access;
	let body: Record<string, unknown>;
	try {
		body = await readJsonRecord(request);
	} catch {
		return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
	}
	const ownerRef = String(body.ownerRef || "").trim();
	const ownerType =
		access.role === "admin"
			? String(body.ownerType) === "company"
				? "company"
				: "merchant"
			: (access.role as "company" | "merchant");
	const ownerName =
		access.role === "admin" ? String(body.ownerName || "").trim() : access.name;
	const name = String(body.name || "").trim();
	const phone = normalizeEgyptPhone(String(body.phone || ""));
	const zone = String(body.zone || "").trim();
	const vehicle = String(body.vehicle || "moto").trim();
	if (!ownerRef || name.length < 2 || !/^01[0125]\d{8}$/.test(phone) || !zone) {
		return NextResponse.json(
			{ ok: false, error: "invalid_fields" },
			{ status: 400 },
		);
	}
	try {
		const courier = await createWaslCourier({
			ownerRef,
			ownerType,
			ownerName,
			name,
			phone,
			zone,
			vehicle,
		});
		return NextResponse.json({ ok: true, courier: courierToClient(courier) });
	} catch (error) {
		const message = error instanceof Error ? error.message : "db_unavailable";
		if (message === "courier_exists")
			return NextResponse.json({ ok: false, error: message }, { status: 409 });
		console.error("[wasl] courier create failed", error);
		return NextResponse.json(
			{ ok: false, error: "db_unavailable" },
			{ status: 503 },
		);
	}
}
