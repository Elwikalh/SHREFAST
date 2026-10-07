import { authorizeWasl } from "@/lib/wasl-access";
import { NextResponse } from "next/server";
import { scopedEntities } from "@/lib/wasl-access";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	const access = await authorizeWasl(request, "entities");
	if (access instanceof Response) return access;
	const type = new URL(request.url).searchParams.get("type") || undefined;
	try {
		const rows = await scopedEntities(access, type);
		return NextResponse.json({
			ok: true,
			entities: rows.map((e) => ({
				ref: e.ref,
				type: e.type,
				name: e.name,
				phone: e.phone,
				zone: e.zone,
				governorate: e.governorate,
				address: e.address,
				businessType: e.business_type,
			})),
		});
	} catch (error) {
		console.error("[wasl] entities list failed", error);
		return NextResponse.json(
			{ ok: false, error: "db_unavailable" },
			{ status: 503 },
		);
	}
}
