import { z } from "zod"
import { inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db, menuItems, siteSettings } from "@el7bboB/db"
import { getStaffSession } from "@/lib/staff-session"
import { isMealFood } from "@/app/meal-config"
import { MAX_MEAL_CHOICES } from "@/app/meal-settings"
import { MEAL_SETTINGS_ROWS } from "@/app/meal-settings-store"
export const runtime = "nodejs"
const trustedOrigins = new Set(["https://el7bbob.com", "https://www.el7bbob.com", "https://el7bbob-production.up.railway.app"])
const schema = z.object({ kind: z.enum(["tray", "box"]), allowedIds: z.array(z.string().uuid()).max(MAX_MEAL_CHOICES) }).strict()
const MAX_BYTES = 50_000
class BodyTooLarge extends Error {}
async function readJson(request: Request): Promise<unknown> {
	if (Number(request.headers.get("content-length")) > MAX_BYTES) throw new BodyTooLarge()
	if (!request.body) throw new SyntaxError()
	const reader = request.body.getReader(), chunks: Uint8Array[] = []; let size = 0
	try {
		while (true) { const { value, done } = await reader.read(); if (done) break; size += value.byteLength; if (size > MAX_BYTES) { await reader.cancel(); throw new BodyTooLarge() } chunks.push(value) }
	} finally { reader.releaseLock() }
	const bytes = new Uint8Array(size); let offset = 0
	for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
	return JSON.parse(new TextDecoder().decode(bytes)) as unknown
}
function reply(status: number, body: Record<string, unknown>) { return Response.json(body, { status, headers: { "Cache-Control": "no-store" } }) }
export async function POST(request: Request) {
	const origin = request.headers.get("origin"), local = process.env.NODE_ENV !== "production" && origin !== null && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
	if (!origin || (!trustedOrigins.has(origin) && !local) || request.headers.get("sec-fetch-site") === "cross-site") return reply(403, { error: "الحفظ لازم يكون من موقع الحَبّوب نفسه." })
	if (request.headers.get("content-type")?.split(";")[0]?.trim() !== "application/json") return reply(415, { error: "صيغة الحفظ غير مدعومة." })
	try {
		const session = await getStaffSession()
		if (!session) return reply(401, { error: "جلسة الدخول انتهت؛ سجل دخول تاني قبل الحفظ." })
		if (session.role !== "admin") return reply(403, { error: "تعديل الاختيارات متاح للإدارة فقط." })
		const parsed = schema.safeParse(await readJson(request))
		if (!parsed.success) return reply(400, { error: "اختيارات الفطار غير صالحة." })
		const { kind } = parsed.data, ids = Array.from(new Set(parsed.data.allowedIds))
		const products = ids.length ? await db.select().from(menuItems).where(inArray(menuItems.id, ids)) : []
		const allowed = new Set(products.filter((item) => isMealFood(kind, { ...item, priceEGP: Number(item.priceEGP) })).map((item) => item.id))
		if (ids.some((id) => !allowed.has(id))) return reply(400, { error: "صنف اتحذف أو مش مسموح في التكوين ده؛ راجع الاختيارات." })
		const value = JSON.stringify({ version: 1, allowedIds: ids })
		await db.insert(siteSettings).values({ id: MEAL_SETTINGS_ROWS[kind], heroImageDataUrl: value }).onConflictDoUpdate({ target: siteSettings.id, set: { heroImageDataUrl: value, updatedAt: new Date() } })
		revalidatePath("/"); revalidatePath("/staff/admin/breakfast")
		return reply(200, { ok: true })
	} catch (error) {
		if (error instanceof BodyTooLarge) return reply(413, { error: "طلب الاختيارات كبير جدًا." })
		if (error instanceof SyntaxError) return reply(400, { error: "طلب الحفظ غير صالح." })
		const reference = crypto.randomUUID(); console.error("[breakfast-settings] save failed", { reference })
		return reply(500, { error: `تعذر تأكيد الحفظ؛ حدّث الصفحة وراجع الاختيارات قبل إعادة المحاولة. مرجع: ${reference}` })
	}
}
