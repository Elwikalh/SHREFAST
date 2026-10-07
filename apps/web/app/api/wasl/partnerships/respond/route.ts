import { readJsonRecord } from "@/lib/wasl-validation";
import { NextResponse } from "next/server";
import { respondWaslInvite } from "@/lib/wasl-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
	let body: Record<string, unknown>;
	try {
		body = await readJsonRecord(request);
	} catch {
		return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
	}
	const ref = String(body.ref || "").trim();
	const action = String(body.action || "").trim();
	if (!ref || !["accept", "decline"].includes(action)) {
		return NextResponse.json(
			{ ok: false, error: "invalid_fields" },
			{ status: 400 },
		);
	}
	try {
		const result = await respondWaslInvite({ ref, action });
		if (!result)
			return NextResponse.json(
				{ ok: false, error: "invite_not_found" },
				{ status: 404 },
			);
		return NextResponse.json({
			ok: true,
			invite: { ref: result.invite.ref, status: result.invite.status },
			members: result.members.map((m) => ({
				ref: m.entity_ref,
				name: m.entity_name,
				sharePct: m.share_pct,
			})),
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "db_unavailable";
		const known = new Set([
			"bad_action",
			"already_responded",
			"merchant_not_registered",
		]);
		if (known.has(message)) {
			return NextResponse.json({ ok: false, error: message }, { status: 409 });
		}
		console.error("[wasl] invite respond failed", error);
		return NextResponse.json(
			{ ok: false, error: "db_unavailable" },
			{ status: 503 },
		);
	}
}
