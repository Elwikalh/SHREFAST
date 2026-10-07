import { verifyMetaSignature } from "@/lib/wasl-webhook";
import { z } from "zod";
import { createWaslInboxMessage } from "@/lib/wasl-store";

export const dynamic = "force-dynamic";

// WhatsApp Cloud API webhook — رسايل العملاء بتوصل هنا أوتوماتيك وتظهر
// في صندوق الوارد بلوحة النشاط، والتوزيع على المناديب بيتم من اللوحة.

const webhookSchema = z.object({
	entry: z
		.array(
			z.object({
				changes: z
					.array(
						z.object({
							value: z.object({
								messages: z
									.array(
										z.object({
											id: z.string().min(1),
											from: z.string(),
											type: z.string(),
											text: z.object({ body: z.string() }).optional(),
										}),
									)
									.optional(),
								contacts: z
									.array(
										z.object({
											profile: z.object({ name: z.string() }).optional(),
										}),
									)
									.optional(),
							}),
						}),
					)
					.optional(),
			}),
		)
		.optional(),
});

export async function GET(request: Request) {
	// خطوة التحقق الوحيدة المطلوبة عند تسجيل الـ webhook في لوحة Meta
	const url = new URL(request.url);
	const mode = url.searchParams.get("hub.mode");
	const token = url.searchParams.get("hub.verify_token");
	const challenge = url.searchParams.get("hub.challenge");
	const expected = process.env.WASL_META_VERIFY_TOKEN || "";
	if (mode === "subscribe" && expected && token === expected && challenge) {
		return new Response(challenge, {
			status: 200,
			headers: { "content-type": "text/plain" },
		});
	}
	return new Response("forbidden", { status: 403 });
}

export async function POST(request: Request) {
	const secret = process.env.WASL_META_APP_SECRET || "";
	// Fail closed even in development: never accept unsigned customer messages.
	if (!secret) return new Response("webhook not configured", { status: 503 });
	const raw = await request.text();
	if (
		!verifyMetaSignature(
			raw,
			request.headers.get("x-hub-signature-256"),
			secret,
		)
	) {
		return new Response("invalid signature", { status: 401 });
	}
	let payload: z.infer<typeof webhookSchema>;
	try {
		payload = webhookSchema.parse(JSON.parse(raw));
	} catch {
		return new Response("invalid payload", { status: 400 });
	}
	try {
		for (const entry of payload.entry || []) {
			for (const change of entry.changes || []) {
				const value = change.value;
				const profileName = value.contacts?.[0]?.profile?.name;
				for (const msg of value.messages || []) {
					if (msg.type !== "text") continue;
					const body = msg.text?.body.trim() || "";
					const phone = msg.from.replace(/\D/g, "");
					if (!body || !phone) continue;
					await createWaslInboxMessage({
						messageId: msg.id,
						senderPhone: phone,
						senderName: profileName,
						body,
					});
				}
			}
		}
	} catch (error) {
		console.error("[wasl-inbound] storage failed", error);
		// Ask Meta to retry; unique message IDs make partial batch retries safe.
		return new Response("storage unavailable", { status: 503 });
	}
	return Response.json({ ok: true });
}
