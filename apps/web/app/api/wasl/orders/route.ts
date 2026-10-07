import { NextResponse } from "next/server"
import { createWaslOrder, listWaslOrders, waslOrderToClient } from "@/lib/wasl-store"

export const dynamic = "force-dynamic"

export async function GET() {
	try {
		const rows = await listWaslOrders(50)
		return NextResponse.json({ ok: true, orders: rows.map(waslOrderToClient) })
	} catch (error) {
		console.error("[wasl] list failed", error)
		return NextResponse.json({ ok: false, error: "db_unavailable" }, { status: 503 })
	}
}

export async function POST(request: Request) {
	let body: Record<string, unknown>
	try {
		body = (await request.json()) as Record<string, unknown>
	} catch {
		return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 })
	}
	const merchant = String(body.merchant || "").trim()
	const merchantZone = String(body.merchantZone || "").trim()
	const fromAddr = String(body.fromAddr || "").trim()
	const destZone = String(body.destZone || "").trim()
	const toAddr = String(body.toAddr || "").trim()
	const fee = Number(body.fee)
	const total = body.total === undefined || body.total === null ? undefined : Number(body.total)
	const readyMinutesRaw = body.readyMinutes === undefined || body.readyMinutes === null ? undefined : Number(body.readyMinutes)
	const readyMinutes = readyMinutesRaw !== undefined && Number.isFinite(readyMinutesRaw)
		? Math.min(180, Math.max(0, Math.round(readyMinutesRaw)))
		: undefined
	if (!merchant || !merchantZone || !fromAddr || !destZone || !toAddr || !Number.isFinite(fee)) {
		return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 })
	}
	try {
		const row = await createWaslOrder({
			merchant,
			merchantZone,
			fromAddr,
			destZone,
			toAddr,
			fee,
			pay: body.pay ? String(body.pay) : undefined,
			kind: body.kind ? String(body.kind) : undefined,
			customerPhone: body.customerPhone ? String(body.customerPhone) : undefined,
			customerName: body.customerName ? String(body.customerName) : undefined,
			total: total !== undefined && Number.isFinite(total) ? total : undefined,
			readyMinutes,
			note: body.note ? String(body.note) : undefined,
			source: body.source ? String(body.source) : undefined,
		})
		return NextResponse.json({ ok: true, order: waslOrderToClient(row) })
	} catch (error) {
		console.error("[wasl] create failed", error)
		return NextResponse.json({ ok: false, error: "db_unavailable" }, { status: 503 })
	}
}
