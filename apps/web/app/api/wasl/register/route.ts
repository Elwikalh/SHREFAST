import { readJsonRecord } from "@/lib/wasl-validation";
import { NextResponse } from "next/server";
import { registerWaslEntity, updateWaslEntityProfile } from "@/lib/wasl-store";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
	let body: Record<string, unknown>;
	try {
		body = await readJsonRecord(request);
	} catch {
		return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
	}
	// تحديث بيانات نشاط مسجّل بالمرجع — نوع النشاط أو العنوان فقط
	const existingRef = String(body.ref || "").trim();
	if (existingRef) {
		const businessType = String(body.businessType || "").trim();
		const address = String(body.address || "").trim();
		if (!businessType && !address)
			return NextResponse.json(
				{ ok: false, error: "nothing_to_update" },
				{ status: 400 },
			);
		try {
			const row = await updateWaslEntityProfile({
				ref: existingRef,
				businessType: businessType || undefined,
				address: address || undefined,
			});
			if (!row)
				return NextResponse.json(
					{ ok: false, error: "entity_not_found" },
					{ status: 404 },
				);
			return NextResponse.json({
				ok: true,
				updated: true,
				entity: {
					ref: row.ref,
					type: row.type,
					name: row.name,
					businessType: row.business_type,
				},
			});
		} catch (error) {
			console.error("[wasl] profile update failed", error);
			return NextResponse.json(
				{ ok: false, error: "db_unavailable" },
				{ status: 503 },
			);
		}
	}
	const type = String(body.type || "") === "company" ? "company" : "merchant";
	const name = String(body.name || "").trim();
	const phone = String(body.phone || "").trim();
	const governorate = String(body.governorate || "").trim();
	const zone = String(body.zone || "").trim();
	const address = String(body.address || "").trim();
	const businessType = String(body.businessType || "").trim();
	const coverage = Array.isArray(body.coverage)
		? body.coverage.map(String)
		: [];
	if (
		!name ||
		phone.length < 8 ||
		!governorate ||
		!zone ||
		!address ||
		(type === "company" && !coverage.length)
	) {
		return NextResponse.json(
			{ ok: false, error: "invalid_fields" },
			{ status: 400 },
		);
	}
	try {
		const row = await registerWaslEntity({
			type,
			name,
			phone,
			governorate,
			zone,
			address,
			businessType: businessType || undefined,
			coverage,
		});
		return NextResponse.json({
			ok: true,
			entity: { ref: row.ref, type: row.type, name: row.name },
		});
	} catch (error) {
		console.error("[wasl] register failed", error);
		return NextResponse.json(
			{ ok: false, error: "db_unavailable" },
			{ status: 503 },
		);
	}
}
