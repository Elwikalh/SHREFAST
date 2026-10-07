import { asc } from "drizzle-orm"
import { db, menuItems } from "@el7bboB/db"
import { requireAdmin } from "@/lib/staff-session"
import { extrasEligible, isProductExtra } from "@/app/product-extras"
import { loadProductExtrasConfigs } from "@/app/product-extras-store"
import { ProductExtrasPanel, type ExtraEditProduct } from "./product-extras-panel"
export const dynamic = "force-dynamic"
export default async function ProductExtrasPage() {
	await requireAdmin()
	const items = await db.select().from(menuItems).orderBy(asc(menuItems.category), asc(menuItems.sortOrder), asc(menuItems.nameAr)), candidates = items.filter((item) => extrasEligible(item.slug, item.category)), configs = await loadProductExtrasConfigs(candidates.map((item) => item.id)), byId = new Map(items.map((item) => [item.id, item]))
	const products: ExtraEditProduct[] = candidates.map((item) => {
		const config = configs[item.id]
		return { id: item.id, nameAr: item.nameAr, available: item.isAvailable, enabled: config?.enabled ?? false, options: (config?.optionIds ?? []).map((id) => { const option = byId.get(id); return { id, nameAr: option?.nameAr ?? "إضافة غير موجودة — احذفها", priceEGP: option ? String(option.priceEGP) : "", available: config?.availableIds.includes(id) ?? false } }) }
	})
	return <div dir="rtl" className="mx-auto max-w-4xl space-y-5"><header className="card p-5"><h1 className="text-2xl font-black">إضافات المنتجات</h1><p className="mt-2 text-sm text-[var(--ink)]/60">اختار المنتج، ثم اكتب الإضافات الاختيارية وسعر كل إضافة. كل منتج له إعداداته المستقلة.</p></header><ProductExtrasPanel products={products} savedExtras={items.filter((item) => item.category === "addon" && isProductExtra(item.slug)).map((item) => ({ id: item.id, nameAr: item.nameAr, priceEGP: String(item.priceEGP) }))}/></div>
}
