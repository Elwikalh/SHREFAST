import { asc } from "drizzle-orm"
import { db, menuItems } from "@el7bboB/db"
import { requireAdmin } from "@/lib/staff-session"
import { isMealFood } from "@/app/meal-config"
import { loadMealSelections } from "@/app/meal-settings-store"
import { BreakfastSettingsPanel, type BreakfastChoiceRow } from "./breakfast-settings-panel"
export const dynamic = "force-dynamic"
export default async function BreakfastAdminPage() {
	await requireAdmin()
	const [items, selections] = await Promise.all([
		db.select().from(menuItems).orderBy(asc(menuItems.category), asc(menuItems.sortOrder), asc(menuItems.nameAr)),
		loadMealSelections(),
	])
	const rows: BreakfastChoiceRow[] = items.map((item) => {
		const product = { ...item, priceEGP: Number(item.priceEGP) }
		return { id: item.id, nameAr: item.nameAr, nameEn: item.nameEn, slug: item.slug, priceEGP: Number(item.priceEGP), available: item.isAvailable, tray: isMealFood("tray", product), box: isMealFood("box", product) }
	}).filter((item) => item.tray || item.box)
	return <div className="mx-auto max-w-4xl space-y-5" dir="rtl"><header className="card p-5"><h1 className="text-2xl font-black">إعدادات الطبلية والبوكس</h1><p className="mt-2 text-sm text-[var(--ink)]/60">اختار مكونات كل واحد بشكل مستقل. الأسعار من قائمة الطعام، والعيش بعداداته المنفصلة.</p></header><BreakfastSettingsPanel rows={rows} initialSelections={selections}/></div>
}
