import { readJsonRecord } from "@/lib/wasl-validation";
import { NextResponse } from "next/server";
import { createWaslSettlement, listWaslSettlements } from "@/lib/wasl-store";

export const dynamic = "force-dynamic";

function settlementToClient(s: Record<string, unknown>) {
	return {
		ref: s.ref,
		ownerRef: s.owner_ref,
		ownerName: s.owner_name,
		courierName: s.courier_name,
		amount: s.amount,
		kind: s.kind,
		created: s.created_at,
	};
}

export async function GET(request: Request) {
	const ownerRef = new URL(request.url).searchParams.get("ownerRef") || "";
	if (!ownerRef)
		return NextResponse.json(
			{ ok: false, error: "invalid_fields" },
			{ status: 400 },
		);
	try {
		const rows = await listWaslSettlements(ownerRef);
		return NextResponse.json({
			ok: true,
			settlements: rows.map(settlementToClient),
		});
	} catch (error) {
		console.error("[wasl] settlements list failed", error);
		return NextResponse.json(
			{ ok: false, error: "db_unavailable" },
			{ status: 503 },
		);
	}
}

export async function POST(request: Request) {
	let body: Record<string, unknown>;
	try {
		body = await readJsonRecord(request);
	} catch {
		return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
	}
	const ownerRef = String(body.ownerRef || "").trim();
	const ownerName = String(body.ownerName || "").trim() || "صاحب حساب";
	const courierName = String(body.courierName || "").trim();
	const amount = Number(body.amount || 0);
	if (!ownerRef || !courierName || !(amount > 0)) {
		return NextResponse.json(
			{ ok: false, error: "invalid_fields" },
			{ status: 400 },
		);
	}
	try {
		const settlement = await createWaslSettlement({
			ownerRef,
			ownerName,
			courierName,
			amount,
			kind: body.kind ? String(body.kind) : undefined,
		});
		return NextResponse.json({
			ok: true,
			settlement: settlementToClient(settlement),
		});
	} catch (error) {
		console.error("[wasl] settlement create failed", error);
		return NextResponse.json(
			{ ok: false, error: "db_unavailable" },
			{ status: 503 },
		);
	}
}
