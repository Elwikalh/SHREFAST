import { NextResponse } from "next/server"
import { joinWaslCourier } from "@/lib/wasl-store"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
	let body: Record<string, unknown>
	try {
		body = (await request.json()) as Record<string, unknown>
	} catch {
		return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 })
	}
	const phone = String(body.phone || "").replace(/\s+/g, "")
	const code = String(body.code || "").trim()
	if (phone.length < 8 || code.length < 4) {
		return NextResponse.json({ ok: false, error: "invalid_fields" }, { status: 400 })
	}
	try {
		const courier = await joinWaslCourier(phone, code)
		if (!courier) return NextResponse.json({ ok: false, error: "invite_not_found" }, { status: 404 })
		return NextResponse.json({ ok: true, courier: { ref: courier.ref, name: courier.name, ownerName: courier.owner_name, zone: courier.zone } })
	} catch (error) {
		console.error("[wasl] courier join failed", error)
		return NextResponse.json({ ok: false, error: "db_unavailable" }, { status: 503 })
	}
}
