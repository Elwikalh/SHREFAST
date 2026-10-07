import crypto from "crypto"
import { createWaslInboxMessage } from "@/lib/wasl-store"

export const dynamic = "force-dynamic"

// WhatsApp Cloud API webhook — رسايل العملاء بتوصل هنا أوتوماتيك وتظهر
// في صندوق الوارد بلوحة النشاط، والتوزيع على المناديب بيتم من اللوحة.

function verifySignature(raw: string, header: string | null, secret: string): boolean {
	if (!header || !header.startsWith("sha256=")) return false
	const expected = "sha256=" + crypto.createHmac("sha256", secret).update(raw, "utf8").digest("hex")
	try {
		return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(header))
	} catch {
		return false
	}
}

export async function GET(request: Request) {
	// خطوة التحقق الوحيدة المطلوبة عند تسجيل الـ webhook في لوحة Meta
	const url = new URL(request.url)
	const mode = url.searchParams.get("hub.mode")
	const token = url.searchParams.get("hub.verify_token")
	const challenge = url.searchParams.get("hub.challenge")
	const expected = process.env.WASL_META_VERIFY_TOKEN || ""
	if (mode === "subscribe" && expected && token === expected && challenge) {
		return new Response(challenge, { status: 200, headers: { "content-type": "text/plain" } })
	}
	return new Response("forbidden", { status: 403 })
}

export async function POST(request: Request) {
	const raw = await request.text()
	const secret = process.env.WASL_META_APP_SECRET || ""
	if (secret && !verifySignature(raw, request.headers.get("x-hub-signature-256"), secret)) {
		return new Response("invalid signature", { status: 401 })
	}
	try {
		const payload = JSON.parse(raw) as Record<string, unknown>
		const entries = Array.isArray(payload?.entry) ? payload.entry : []
		for (const entry of entries) {
			const changes = Array.isArray(entry?.changes) ? entry.changes : []
			for (const change of changes) {
				const value = change?.value
				const messages = Array.isArray(value?.messages) ? value.messages : []
				const contacts = Array.isArray(value?.contacts) ? value.contacts : []
				const profileName = contacts[0]?.profile?.name || null
				for (const msg of messages) {
					// رسايل نصية فقط حاليًا — الوسائط (صور/صوت) بتتجاهل
					if (!msg || msg.type !== "text") continue
					const body = String(msg.text?.body || "").trim()
					const phone = String(msg.from || "").replace(/\D/g, "")
					if (!body || !phone) continue
					await createWaslInboxMessage({ senderPhone: phone, senderName: profileName || undefined, body })
				}
			}
		}
	} catch (error) {
		console.error("[wasl-inbound] parse failed", error)
	}
	// Meta يتوقع 200 دائمًا وإلا بيعيد إرسال نفس الرسالة
	return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } })
}