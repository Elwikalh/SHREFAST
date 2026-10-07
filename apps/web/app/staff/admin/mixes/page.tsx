import { asc, eq } from "drizzle-orm"
import { SlidersHorizontal } from "lucide-react"
import { db, ensureCustomMixMenuItem, menuItems } from "@el7bboB/db"
import { CUSTOM_MIX_SLUG, parseMixSettings } from "@/app/mix/mix-config"
import { requireAdmin } from "@/lib/staff-session"
import { MixSettingsPanel } from "./mix-settings-panel"

export const dynamic = "force-dynamic"
export default async function MixesAdminPage() {
	await requireAdmin(); await ensureCustomMixMenuItem()
	const [[container],items] = await Promise.all([db.select().from(menuItems).where(eq(menuItems.slug,CUSTOM_MIX_SLUG)).limit(1),db.select().from(menuItems).orderBy(asc(menuItems.category),asc(menuItems.sortOrder),asc(menuItems.nameAr))])
	const settings = parseMixSettings(container?.photosJson), bySlug = new Map(settings.map((item) => [item.slug,item]))
	const candidates = items.filter((item) => item.slug !== CUSTOM_MIX_SLUG && (item.category === "base_item" || item.category === "addon"))
	const rows = candidates.map((item,index) => { const setting=bySlug.get(item.slug); return { slug:item.slug, nameAr:item.nameAr, category:item.category as "base_item"|"addon", menuPriceEGP:Number(item.priceEGP), available:item.isAvailable, enabled:setting?.enabled ?? false, priceEGP:setting?.priceEGP ?? Math.max(1,Math.round(Number(item.priceEGP)/2)), sortOrder:setting?.sortOrder ?? settings.length+index } })
	return <main className="mx-auto max-w-4xl px-4 py-8"><div className="card mb-5 flex items-center gap-4 p-5"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--amber)] text-[var(--ink)]"><SlidersHorizontal className="h-6 w-6" /></span><div><h1 className="text-2xl font-black">إعدادات الميكس</h1><p className="mt-1 text-sm font-bold text-[var(--ink)]/50">حدد الأصناف المتاحة داخل الميكس وسعر إضافة كل صنف.</p></div></div><MixSettingsPanel initialRows={rows} /></main>
}
