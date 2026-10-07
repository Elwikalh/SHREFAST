import { authorizeWasl } from "@/lib/wasl-access";
import { NextResponse } from "next/server";
import {
	listWaslInvitesByPartnership,
	listWaslInvitesByPhone,
} from "@/lib/wasl-store";

export const dynamic = "force-dynamic";

function inviteToClient(i: Record<string, unknown>) {
	return {
		ref: i.ref,
		partnershipRef: i.partnership_ref,
		partnershipName: i.partnership_name ?? null,
		partnershipZone: i.partnership_zone ?? null,
		fromRef: i.from_ref,
		fromName: i.from_name,
		toPhone: i.to_phone,
		status: i.status,
		created: i.created_at,
	};
}

export async function GET(request: Request) {
	const access = await authorizeWasl(request, "partnerships/invites");
	if (access instanceof Response) return access;
	const params = new URL(request.url).searchParams;
	const phone = (params.get("phone") || "").replace(/\s+/g, "");
	const partnershipRef = params.get("partnershipRef") || "";
	try {
		if (phone) {
			const rows = await listWaslInvitesByPhone(phone);
			return NextResponse.json({ ok: true, invites: rows.map(inviteToClient) });
		}
		if (partnershipRef) {
			const rows = await listWaslInvitesByPartnership(partnershipRef);
			return NextResponse.json({ ok: true, invites: rows.map(inviteToClient) });
		}
		return NextResponse.json(
			{ ok: false, error: "invalid_fields" },
			{ status: 400 },
		);
	} catch (error) {
		console.error("[wasl] invites list failed", error);
		return NextResponse.json(
			{ ok: false, error: "db_unavailable" },
			{ status: 503 },
		);
	}
}
