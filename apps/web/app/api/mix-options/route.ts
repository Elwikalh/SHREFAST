import { asc, eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { db, ensureCustomMixMenuItem, menuItems } from "@el7bboB/db"
import { CUSTOM_MIX_SLUG, parseMixSettings } from "@/app/mix/mix-config"

export const dynamic = "force-dynamic"
export async function GET() {
	await ensureCustomMixMenuItem()
	const [[container],items] = await Promise.all([
		db.select().from(menuItems).where(eq(menuItems.slug,CUSTOM_MIX_SLUG)).limit(1),
		db.select().from(menuItems).where(eq(menuItems.isAvailable,true)).orderBy(asc(menuItems.sortOrder)),
	])
	const itemBySlug = new Map(items.map((item) => [item.slug,item]))
	const options = parseMixSettings(container?.photosJson).filter((setting) => setting.enabled).flatMap((setting) => {
		const item = itemBySlug.get(setting.slug)
		if (!item || (item.category !== "base_item" && item.category !== "addon")) return []
		return [{ id:item.id, nameAr:item.nameAr, nameEn:item.nameEn, priceEGP:setting.priceEGP, image:item.photoDataUrl ?? null }]
	})
	return NextResponse.json({ options }, { headers:{ "Cache-Control":"no-store" } })
}
