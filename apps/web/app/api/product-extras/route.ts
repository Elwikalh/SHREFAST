import { z } from "zod"
import { eq, inArray } from "drizzle-orm"
import { db, menuItems } from "@el7bboB/db"
import { extrasEligible, isProductExtra } from "@/app/product-extras"
import { loadProductExtrasConfigs } from "@/app/product-extras-store"
export const dynamic = "force-dynamic"
export async function GET(request: Request) {
	const parsed = z.string().uuid().safeParse(new URL(request.url).searchParams.get("productId"))
	const headers = { "Cache-Control": "no-store" }
	if (!parsed.success) return Response.json({ error: "المنتج غير صالح." }, { status: 400, headers })
	try {
		const [parent] = await db.select().from(menuItems).where(eq(menuItems.id, parsed.data)).limit(1)
		if (!parent || !parent.isAvailable || isProductExtra(parent.slug)) return Response.json({ error: "المنتج غير متاح." }, { status: 404, headers })
		const config = extrasEligible(parent.slug, parent.category) ? (await loadProductExtrasConfigs([parent.id]))[parent.id] : undefined
		if (!config?.enabled || !config.availableIds.length) return Response.json({ options: [] }, { headers })
		const rows = await db.select().from(menuItems).where(inArray(menuItems.id, config.availableIds)), byId = new Map(rows.map((item) => [item.id, item]))
		const options = config.availableIds.flatMap((id) => { const item = byId.get(id), price = Number(item?.priceEGP); return item && item.category === "addon" && isProductExtra(item.slug) && Number.isFinite(price) && price >= 0 ? [{ id: item.id, nameAr: item.nameAr, nameEn: item.nameEn, priceEGP: price }] : [] })
		return Response.json({ options }, { headers })
	} catch { return Response.json({ error: "تعذر تحميل إضافات المنتج؛ حاول مرة تانية." }, { status: 503, headers }) }
}
