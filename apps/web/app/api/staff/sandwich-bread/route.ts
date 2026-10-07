import { z } from "zod"
import { eq, inArray, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db, menuItems, siteSettings } from "@el7bboB/db"
import { getStaffSession } from "@/lib/staff-session"
import { parseSandwichBread, sandwichBreadEligible, sandwichBreadKey, SANDWICH_BREAD_PREFIX, SANDWICH_BREADS } from "@/app/sandwich-bread"
export const runtime = "nodejs"
const origins = new Set(["https://el7bbob.com", "https://www.el7bbob.com", "https://el7bbob-production.up.railway.app"])
const money = z.string().regex(/^\d+(?:\.\d{1,2})?$/).refine(value => Number(value) > 0 && Number(value) <= 10000)
const schema = z.object({ productId: z.string().uuid(), enabled: z.boolean(), variants: z.array(z.object({ id: z.string().uuid(), kind: z.enum(["baladi", "fino"]), priceEGP: money, available: z.boolean() }).strict()).max(2) }).strict()
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
export async function POST(request: Request) {
 const origin = request.headers.get("origin"), local = process.env.NODE_ENV !== "production" && origin !== null && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
 if (!origin || (!origins.has(origin) && !local) || request.headers.get("sec-fetch-site") === "cross-site") return reply(403, { error: "الحفظ لازم يكون من موقع الحَبّوب نفسه." })
 if (request.headers.get("content-type")?.split(";")[0]?.trim() !== "application/json") return reply(415, { error: "صيغة الحفظ غير مدعومة." })
 try {
  const session = await getStaffSession()
  if (!session) return reply(401, { error: "جلسة الدخول انتهت؛ سجل دخول تاني." })
  if (session.role !== "admin") return reply(403, { error: "تعديل أنواع العيش متاح للإدارة فقط." })
  const parsed = schema.safeParse(await readJson(request))
  if (!parsed.success) return reply(400, { error: "راجع أسعار الساندوتش الكامل لكل نوع؛ سعر موجب حتى منزلتين عشريتين." })
  const values = parsed.data, ids = values.variants.map(v => v.id)
  if (new Set(ids).size !== ids.length || new Set(values.variants.map(v => v.kind)).size !== ids.length) return reply(400, { error: "نوع العيش مكرر." })
  const slug = await db.transaction(async tx => {
   await tx.execute(sql`select pg_advisory_xact_lock(741073, hashtext(${values.productId}))`)
   const [parent] = await tx.select().from(menuItems).where(eq(menuItems.id, values.productId)).limit(1)
   if (!parent || !sandwichBreadEligible(parent)) throw new InvalidChoice()
   const key = sandwichBreadKey(parent.id), [stored] = await tx.select().from(siteSettings).where(eq(siteSettings.id, key)).limit(1), old = parseSandwichBread(stored ? stored.heroImageDataUrl : undefined)
   const existing = ids.length ? await tx.select().from(menuItems).where(inArray(menuItems.id, ids)) : [], byId = new Map(existing.map(item => [item.id, item]))
   for (const v of values.variants) {
    const item = byId.get(v.id), previous = old?.variants.find(x => x.id === v.id)
    if (item && (!previous || previous.kind !== v.kind || item.slug !== SANDWICH_BREAD_PREFIX + v.id || item.category !== parent.category)) throw new InvalidChoice()
    if (!item && previous) throw new InvalidChoice()
    const label = SANDWICH_BREADS[v.kind], fields = { nameAr: `${parent.nameAr} — ${label.nameAr}`, nameEn: `${parent.nameEn} — ${label.nameEn}`, priceEGP: v.priceEGP, isAvailable: false, updatedAt: new Date() }
    if (item) await tx.update(menuItems).set(fields).where(eq(menuItems.id, v.id))
    else await tx.insert(menuItems).values({ ...fields, id: v.id, slug: SANDWICH_BREAD_PREFIX + v.id, category: parent.category, costEGP: parent.costEGP, sortOrder: parent.sortOrder })
   }
   const value = JSON.stringify({ version: 1, enabled: values.enabled, variants: values.variants.map(({ id, kind, available }) => ({ id, kind, available })) })
   await tx.insert(siteSettings).values({ id: key, heroImageDataUrl: value }).onConflictDoUpdate({ target: siteSettings.id, set: { heroImageDataUrl: value, updatedAt: new Date() } })
   return parent.slug
  })
  for (const path of ["/", `/menu/${slug}`, "/staff/admin/sandwich-bread", "/staff/owner/orders"]) revalidatePath(path)
  return reply(200, { ok: true })
 } catch (error) {
  if (error instanceof InvalidChoice) return reply(400, { error: "الصنف أو نوع العيش لم يعد صالحًا؛ حدّث الإعدادات." })
  if (error instanceof BodyTooLarge) return reply(413, { error: "طلب الحفظ كبير جدًا." })
  if (error instanceof SyntaxError) return reply(400, { error: "طلب الحفظ غير صالح." })
  const reference = crypto.randomUUID(); console.error("[sandwich-bread] save failed", { reference })
  return reply(500, { error: `تعذر تأكيد الحفظ؛ راجع الإعدادات قبل إعادة المحاولة. مرجع: ${reference}` })
 }
}
