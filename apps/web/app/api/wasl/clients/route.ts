import { NextResponse } from "next/server"
import { createWaslClientInvite, listWaslClientInvites } from "@/lib/wasl-store"

export const dynamic = "force-dynamic"

function inviteToClient(v: Record<string, unknown>) {
	return {
		ref: v.ref,
		companyRef: v.company_ref,
		companyName: v.company_name,
		merchantName: v.merchant_name,
		phone: v.phone,
		zone: v.zone,
		status: v.status,
		sentCount: v.sent_count,
		created: v.created_at,
	}
}

export async function GET(request: Request) {
	const companyRef = new URL(request.url).searchParams.get("companyRef") || ""
	if (!companyRef) return NextResponse.json({ ok: false, error: "invalid_fields" }, { status: 400 })
	try {
		const rows = await listWaslClientInvites(companyRef)
		return NextResponse.json({ ok: true, invites: rows.map(inviteToClient) })
	} catch (error) {
		console.error("[wasl] client invites list failed", error)
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
	const companyRef = String(body.companyRef || "").trim()
	const companyName = String(body.companyName || "").trim()
	const merchantName = String(body.merchantName || "").trim()
	const phone = String(body.phone || "").replace(/\s+/g, "")
	const zone = String(body.zone || "").trim()
	if (!companyRef || merchantName.length < 2 || phone.length < 8 || !zone) {
		return NextResponse.json({ ok: false, error: "invalid_fields" }, { status: 400 })
	}
	try {
		const invite = await createWaslClientInvite({ companyRef, companyName, merchantName, phone, zone })
		return NextResponse.json({ ok: true, invite: inviteToClient(invite) })
	} catch (error) {
		const message = error instanceof Error ? error.message : "db_unavailable"
		if (message === "invite_pending") return NextResponse.json({ ok: false, error: message }, { status: 409 })
		console.error("[wasl] client invite create failed", error)
		return NextResponse.json({ ok: false, error: "db_unavailable" }, { status: 503 })
	}
}
