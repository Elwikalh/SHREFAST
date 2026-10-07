import { z } from "zod"
import { eq, inArray, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db, menuItems, siteSettings } from "@el7bboB/db"
import { getStaffSession } from "@/lib/staff-session"
import { menuNameToEnglish } from "@/app/staff/admin/menu/menu-name-english"
import { extrasEligible, isProductExtra, parseProductExtras, productExtrasKey, PRODUCT_EXTRA_PREFIX } from "@/app/product-extras"
export const runtime = "nodejs"
const origins = new Set(["https://el7bbob.com", "https://www.el7bbob.com", "https://el7bbob-production.up.railway.app"])
const money = z.string().regex(/^\d+(?:\.\d{1,2})?$/).refine((value) => Number(value) <= 10000)
const schema = z.object({ productId: z.string().uuid(), enabled: z.boolean(), options: z.array(z.object({ id: z.string().uuid(), nameAr: z.string().trim().min(1).max(80), priceEGP: money, available: z.boolean() }).strict()).max(10) }).strict()
class InvalidChoice extends Error {}
class BodyTooLarge extends Error {}
function reply(status: number, body: Record<string, unknown>) { return Response.json(body, { status, headers: { "Cache-Control": "no-store" } }) }
async function readJson(request: Request): Promise<unknown> {
	if (Number(request.headers.get("content-length")) > 50000) throw new BodyTooLarge()
	if (!request.body) throw new SyntaxError()
	const reader = request.body.getReader(), chunks: Uint8Array[] = []; let size = 0
	try { while (true) { const { value, done } = await reader.read(); if (done) break; size += value.byteLength; if (size > 50000) { await reader.cancel(); throw new BodyTooLarge() } chunks.push(value) } } finally { reader.releaseLock() }
	const bytes = new Uint8Array(size); let offset = 0
	for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
	return JSON.parse(new TextDecoder().decode(bytes)) as unknown
}
const english: Record<string, string> = { "زيتون": "Olives", "زتون": "Olives", "بصل": "Onion", "فلفل": "Peppers", "قشطة": "Cream", "قشطه": "Cream", "مكسرات": "Nuts" }
export async function POST(request: Request) {
	const origin = request.headers.get("origin"), local = process.env.NODE_ENV !== "production" && origin !== null && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
	if (!origin || (!origins.has(origin) && !local) || request.headers.get("sec-fetch-site") === "cross-site") return reply(403, { error: "الحفظ لازم يكون من موقع الحَبّوب نفسه." })
	if (request.headers.get("content-type")?.split(";")[0]?.trim() !== "application/json") return reply(415, { error: "صيغة الحفظ غير مدعومة." })
	try {
		const session = await getStaffSession()
		if (!session) return reply(401, { error: "جلسة الدخول انتهت؛ سجل دخول تاني." })
		if (session.role !== "admin") return reply(403, { error: "تعديل الإضافات متاح للإدارة فقط." })
		const parsed = schema.safeParse(await readJson(request))
		if (!parsed.success) return reply(400, { error: "راجع أسماء الإضافات وأسعارها؛ أقصى عدد 10 إضافات للمنتج." })
		const values = parsed.data, ids = values.options.map((option) => option.id)
		if (new Set(ids).size !== ids.length) return reply(400, { error: "في إضافة مكررة؛ راجع الاختيارات." })
		const slug = await db.transaction(async (tx) => {
			await tx.execute(sql`select pg_advisory_xact_lock(741072, hashtext(${values.productId}))`)
			const [parent] = await tx.select().from(menuItems).where(eq(menuItems.id, values.productId)).limit(1)
			if (!parent || !extrasEligible(parent.slug, parent.category)) throw new InvalidChoice()
			const key = productExtrasKey(parent.id), [stored] = await tx.select().from(siteSettings).where(eq(siteSettings.id, key)).limit(1), old = parseProductExtras(stored ? stored.heroImageDataUrl : undefined)
			const allIds = Array.from(new Set([...ids, ...(old?.optionIds ?? [])])), existing = allIds.length ? await tx.select().from(menuItems).where(inArray(menuItems.id, allIds)) : [], byId = new Map(existing.map((item) => [item.id, item]))
			for (const option of values.options) { const item = byId.get(option.id); if (!item && old?.optionIds.includes(option.id)) throw new InvalidChoice(); if (item && (!old?.optionIds.includes(item.id) || !isProductExtra(item.slug) || item.category !== "addon")) throw new InvalidChoice() }
			for (const option of values.options) {
				const fields = { nameAr: option.nameAr, nameEn: english[option.nameAr] ?? menuNameToEnglish(option.nameAr).text, priceEGP: option.priceEGP, isAvailable: false, updatedAt: new Date() }
				if (byId.has(option.id)) await tx.update(menuItems).set(fields).where(eq(menuItems.id, option.id))
				else await tx.insert(menuItems).values({ ...fields, id: option.id, slug: PRODUCT_EXTRA_PREFIX + option.id, category: "addon", costEGP: "0", sortOrder: 0 })
			}
			const removed = (old?.optionIds ?? []).filter((id) => !ids.includes(id) && isProductExtra(byId.get(id)?.slug ?? ""))
			if (removed.length) await tx.update(menuItems).set({ isAvailable: false, updatedAt: new Date() }).where(inArray(menuItems.id, removed))
			const value = JSON.stringify({ version: 1, enabled: values.enabled, optionIds: ids, availableIds: values.options.filter((option) => option.available).map((option) => option.id) })
			await tx.insert(siteSettings).values({ id: key, heroImageDataUrl: value }).onConflictDoUpdate({ target: siteSettings.id, set: { heroImageDataUrl: value, updatedAt: new Date() } })
			return parent.slug
		})
		revalidatePath("/"); revalidatePath(`/menu/${slug}`); revalidatePath("/staff/admin/product-extras")
		return reply(200, { ok: true })
	} catch (error) {
		if (error instanceof InvalidChoice) return reply(400, { error: "المنتج أو إحدى الإضافات لم تعد صالحة؛ حدّث الإعدادات." })
		if (error instanceof BodyTooLarge) return reply(413, { error: "طلب الحفظ كبير جدًا." })
		if (error instanceof SyntaxError) return reply(400, { error: "طلب الحفظ غير صالح." })
		const reference = crypto.randomUUID(); console.error("[product-extras] save failed", { reference })
		return reply(500, { error: `تعذر تأكيد الحفظ؛ حدّث الإعدادات وراجعها قبل إعادة المحاولة. مرجع: ${reference}` })
	}
}
