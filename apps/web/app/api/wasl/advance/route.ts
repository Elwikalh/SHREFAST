import { NextResponse } from "next/server"
import { advanceWaslOrder, waslOrderToClient } from "@/lib/wasl-store"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
	let body: Record<string, unknown>
	try {
		body = (await request.json()) as Record<string, unknown>
	} catch {
		return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 })
	}
	const ref = String(body.ref || "").trim()
	const status = String(body.status || "").trim()
	if (!ref || !status) return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 })
	try {
		const row = await advanceWaslOrder(ref, status, body.courier ? String(body.courier) : undefined)
		if (!row) return NextResponse.json({ ok: false, error: "not_found" }, { status: 404 })
		return NextResponse.json({ ok: true, order: waslOrderToClient(row) })
	} catch (error) {
		console.error("[wasl] advance failed", error)
		return NextResponse.json({ ok: false, error: "db_unavailable" }, { status: 503 })
	}
}
