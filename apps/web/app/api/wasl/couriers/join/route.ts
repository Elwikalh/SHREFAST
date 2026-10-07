import { normalizeEgyptPhone } from "@/lib/wasl-auth-schema";
import { rateLimit } from "@/lib/wasl-auth";
import { authFailure } from "@/lib/wasl-auth-response";
import { authorizeWasl } from "@/lib/wasl-access";
import { readJsonRecord } from "@/lib/wasl-validation";
import { NextResponse } from "next/server";
import { joinWaslCourier } from "@/lib/wasl-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
	const access = await authorizeWasl(request, "couriers/join");
	if (access instanceof Response) return access;
	let body: Record<string, unknown>;
	try {
		body = await readJsonRecord(request);
	} catch {
		return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
	}
	const phone = normalizeEgyptPhone(String(body.phone || ""));
	const code = String(body.code || "").trim();
	if (!/^01[0125]\d{8}$/.test(phone) || code.length < 4) {
		return NextResponse.json(
			{ ok: false, error: "invalid_fields" },
			{ status: 400 },
		);
	}
	try {
		await rateLimit(request, "courier-invite", access.phone);
		const courier = await joinWaslCourier(access.phone, code, access.id);
		if (!courier)
			return NextResponse.json(
				{ ok: false, error: "invite_not_found" },
				{ status: 404 },
			);
		return NextResponse.json({
			ok: true,
			courier: {
				ref: courier.ref,
				name: courier.name,
				ownerName: courier.owner_name,
				zone: courier.zone,
			},
		});
	} catch (error) {
		return authFailure(error);
	}
}
