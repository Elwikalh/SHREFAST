import { NextResponse } from "next/server"
import { resendWaslClientInvite } from "@/lib/wasl-store"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
	let body: Record<string, unknown>
	try {
		body = (await request.json()) as Record<string, unknown>
	} catch {
		return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 })
	}
	const ref = String(body.ref || "").trim()
	if (!ref) return NextResponse.json({ ok: false, error: "invalid_fields" }, { status: 400 })
	try {
		const invite = await resendWaslClientInvite(ref)
		if (!invite) return NextResponse.json({ ok: false, error: "invite_not_found" }, { status: 404 })
		return NextResponse.json({ ok: true, invite: { ref: invite.ref, sentCount: invite.sent_count } })
	} catch (error) {
		console.error("[wasl] client invite resend failed", error)
		return NextResponse.json({ ok: false, error: "db_unavailable" }, { status: 503 })
	}
}
