import { readJsonRecord } from "@/lib/wasl-validation";
import { NextResponse } from "next/server";
import { inviteWaslPartner } from "@/lib/wasl-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
	let body: Record<string, unknown>;
	try {
		body = await readJsonRecord(request);
	} catch {
		return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
	}
	const partnershipRef = String(body.partnershipRef || "").trim();
	const fromRef = String(body.fromRef || "").trim();
	const fromName = String(body.fromName || "").trim() || "مؤسس الشراكة";
	const toPhone = String(body.toPhone || "").replace(/\s+/g, "");
	if (!partnershipRef || !fromRef || toPhone.length < 8) {
		return NextResponse.json(
			{ ok: false, error: "invalid_fields" },
			{ status: 400 },
		);
	}
	try {
		const invite = await inviteWaslPartner({
			partnershipRef,
			fromRef,
			fromName,
			toPhone,
		});
		return NextResponse.json({
			ok: true,
			invite: {
				ref: invite.ref,
				toPhone: invite.to_phone,
				registered: Boolean(invite.to_ref),
			},
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "db_unavailable";
		const known = new Set([
			"partnership_not_found",
			"not_founder",
			"already_member",
			"invite_pending",
		]);
		if (known.has(message)) {
			return NextResponse.json({ ok: false, error: message }, { status: 409 });
		}
		console.error("[wasl] invite failed", error);
		return NextResponse.json(
			{ ok: false, error: "db_unavailable" },
			{ status: 503 },
		);
	}
}
