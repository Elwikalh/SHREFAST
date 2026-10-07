import { z } from "zod"
import { getStaffSession } from "@/lib/staff-session"
import { databaseErrorCode, MENU_ITEM_REFERENCED_MESSAGE } from "@/app/staff/admin/menu/database-error-code"
import {
	createMenuItem, updateMenuItem, toggleMenuItemAvailability, deleteMenuItem, reorderMenuItems,
} from "@/app/staff/admin/menu/actions"

export const runtime = "nodejs"

const trustedOrigins = new Set([
	"https://el7bbob.com", "https://www.el7bbob.com",
	"https://el7bbob-production.up.railway.app",
])
// Matches the existing per-image and gallery limits, including JSON overhead.
const MAX_BODY_BYTES = 22_000_000
const photo = z.string().max(3_000_000).refine(
	(value) => value.startsWith("data:image/") || value.startsWith("https://") || value.startsWith("http://"),
).nullable().optional()
const money = z.string().regex(/^\d+(?:\.\d{1,2})?$/).refine((value) => Number(value) < 100_000_000)
const inputSchema = z.object({
	slug: z.string().min(1).max(100),
	nameAr: z.string().min(1).max(1000),
	nameEn: z.string().min(1).max(1000),
	category: z.enum(["base_item", "mix", "platter", "addon", "breakfast_box", "beverage"]),
	priceEGP: money, costEGP: money,
	sortOrder: z.number().int().min(-2147483648).max(2147483647),
	photoDataUrl: photo,
	photosJson: z.array(photo.unwrap().unwrap()).max(6).nullable().optional(),
	descriptionAr: z.string().max(1000).nullable().optional(),
	descriptionEn: z.string().max(1000).nullable().optional(),
})
const id = z.string().uuid()
const section = z.enum(["base_item", "mix", "packs", "platter", "breakfast_box", "addon", "beverage"])
const mutationSchema = z.discriminatedUnion("operation", [
	z.object({ operation: z.literal("create"), input: inputSchema.extend({
		slug: z.string().max(100).default(""),
		sortOrder: z.number().int().min(-2147483648).max(2147483647).default(0),
	}) }),
	z.object({ operation: z.literal("update"), id, input: inputSchema }),
	z.object({ operation: z.literal("toggle"), id, isAvailable: z.boolean() }),
	z.object({ operation: z.literal("delete"), id }),
	z.object({ operation: z.literal("reorder"), section, orderedIds: z.array(id).min(1).max(1000).refine((ids) => new Set(ids).size === ids.length) }),
])

class BodyTooLarge extends Error {}
async function readBody(request: Request): Promise<unknown> {
	if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) throw new BodyTooLarge()
	if (!request.body) throw new SyntaxError()
	const reader = request.body.getReader()
	const chunks: Uint8Array[] = []
	let size = 0
	try {
		while (true) {
			const { done, value } = await reader.read()
			if (done) break
			size += value.byteLength
			if (size > MAX_BODY_BYTES) {
				await reader.cancel()
				throw new BodyTooLarge()
			}
			chunks.push(value)
		}
	} finally {
		reader.releaseLock()
	}
	const bytes = new Uint8Array(size)
	let offset = 0
	for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
	return JSON.parse(new TextDecoder().decode(bytes)) as unknown
}
function reply(status: number, body: Record<string, unknown>) {
	return Response.json(body, { status, headers: { "Cache-Control": "no-store" } })
}
// Only application-authored validation messages may be shown to the browser.
const publicErrors = new Set([
	MENU_ITEM_REFERENCED_MESSAGE,
	"صيغة الصورة/الرابط غير مدعومة",
	"حجم الصورة كبير جدًا — استخدم صورة أصغر",
	"أقصى عدد صور للصنف 6 صور غير صورة الغلاف",
	"الوصف طويل جدًا — خليه أقصر",
	"تعذر تحديد كود جديد للصنف",
	"تعذر تحديد ترتيب جديد للصنف",
	"سعر البيع لازم يكون أكبر من صفر عشان المنتج يظهر للعميل",
	"اكتب سعر بيع أكبر من صفر قبل إظهار الصنف على الموقع",
	"راجع قائمة ترتيب الأصناف",
	"قائمة الترتيب غير صالحة",
	"بعض الأصناف لم تعد موجودة — حدّث الصفحة",
	"لا يمكن نقل صنف خارج قسمه بهذه الطريقة",
	"مينفعش تحذف الصنف ده لأنه مرتبط بطلبات أو ميكسات سابقة — استخدم زرار الإخفاء بدل الحذف",
])

export async function POST(request: Request) {
	const origin = request.headers.get("origin")
	const localOrigin = process.env.NODE_ENV !== "production"
		&& origin !== null && /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
	if (!origin || (!trustedOrigins.has(origin) && !localOrigin)
		|| request.headers.get("sec-fetch-site") === "cross-site") {
		return reply(403, { error: "طلب الحفظ لازم يكون من موقع الحَبّوب نفسه" })
	}
	if (request.headers.get("content-type")?.split(";")[0]?.trim() !== "application/json") {
		return reply(415, { error: "صيغة طلب الحفظ غير مدعومة" })
	}
	let operation: string | undefined
	try {
		const session = await getStaffSession()
		if (!session) return reply(401, { error: "جلسة الدخول انتهت — سجّل دخول تاني قبل الحفظ" })
		if (session.role !== "admin") return reply(403, { error: "الحفظ متاح للإدارة فقط" })
		const parsed = mutationSchema.safeParse(await readBody(request))
		if (!parsed.success) return reply(400, { error: "راجع بيانات الصنف: الاسم والكود والأسعار والوصف والصور" })
		const mutation = parsed.data
		operation = mutation.operation
		switch (mutation.operation) {
			case "create": await createMenuItem(mutation.input); break
			case "update": await updateMenuItem(mutation.id, mutation.input); break
			case "toggle": await toggleMenuItemAvailability(mutation.id, mutation.isAvailable); break
			case "delete": await deleteMenuItem(mutation.id); break
			case "reorder": await reorderMenuItems(mutation.section, mutation.orderedIds); break
		}
		return reply(200, { ok: true })
	} catch (error) {
		if (error instanceof BodyTooLarge) return reply(413, { error: "حجم الصور كبير جدًا — استخدم صور أصغر" })
		if (error instanceof SyntaxError) return reply(400, { error: "طلب الحفظ غير صالح" })
		if (error instanceof Error && publicErrors.has(error.message)) return reply(400, { error: error.message })
		// Do not log SQL/parameters, image data, session tokens, or passwords.
		const reference = crypto.randomUUID()
		console.error("[menu-mutation] failed", { reference, operation, code: databaseErrorCode(error) ?? "UNKNOWN" })
		return reply(500, { error: `مقدرناش نؤكد الحفظ — حدّث القائمة وتأكد من التعديل قبل ما تكرر الحفظ. مرجع: ${reference}` })
	}
}
