import { isSandwichBread } from "./sandwich-bread"
import { isProductExtra } from "./product-extras"
export type MealKind = "tray" | "box"
export const MEALS = {
	tray: { slug: "breakfast-tray-custom", nameAr: "طبلية حسب اختيارك", nameEn: "Build your breakfast tray", category: "platter" },
	box: { slug: "breakfast-box-custom", nameAr: "بوكس حسب اختيارك", nameEn: "Build your breakfast box", category: "breakfast_box" },
} as const
export const BREADS = [
	{ slug: "extra-bread", nameAr: "عيش بلدي", nameEn: "Baladi bread", priceEGP: 2 },
	{ slug: "extra-fino-bread", nameAr: "عيش فينو", nameEn: "Fino bread", priceEGP: 2 },
	{ slug: "extra-dry-bread", nameAr: "عيش ناشف", nameEn: "Crispy bread", priceEGP: 5 },
] as const
export const MAX_MEAL_UNITS = 100
export const MAX_COMPONENT_QUANTITY = 20
export type MealProduct = { id: string; slug: string; nameAr: string; nameEn: string; category: string; priceEGP: number; isAvailable?: boolean; breadParentId?: string }
export function mealKindForSlug(slug: string): MealKind | null {
	return slug === MEALS.tray.slug ? "tray" : slug === MEALS.box.slug ? "box" : null
}
export function breadForSlug(slug: string) { return BREADS.find((bread) => bread.slug === slug) }
function normalizedName(value: string) { return value.normalize("NFKC").replace(/[\u064B-\u065F\u0670\u0640]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه") }
export function isMealFood(kind: MealKind, item: MealProduct): boolean {
	if ((isSandwichBread(item.slug) && !item.breadParentId) || isProductExtra(item.slug) || mealKindForSlug(item.slug) || item.slug === "mix-custom" || item.category === "breakfast_box" || item.category === "beverage" || breadForSlug(item.slug)) return false
	const name = normalizedName(item.nameAr)
	// Do not nest ready-made trays/boxes or reinterpret a sandwich as loose food.
	if (/طبل(?:ي|يه)|بوكس/.test(name) || /^(table|box|breakfast-tray|breakfast-box)(-|$)/.test(item.slug)) return false
	if (/ساند[و]?تش|ساندويتش|سندوتش/.test(name)) return kind === "box" && (item.category === "base_item" || item.category === "mix")
	if (item.category === "addon") return !/عيش|خبز/.test(name)
	if (item.category === "platter") return true
	return kind === "box" && (item.category === "base_item" || item.category === "mix")
}
export function componentPrice(item: MealProduct): number {
	const price = breadForSlug(item.slug)?.priceEGP ?? item.priceEGP
	if (!Number.isFinite(price) || price <= 0) throw new Error("سعر أحد أصناف الفطار غير صالح.")
	return price
}
export type SelectedMealItem = { menuItemId: string; nameAr: string; priceEGP: number }
export function priceMeal(kind: MealKind, ids: string[], products: MealProduct[], allowedIds: string[] | null = null): SelectedMealItem[] {
	if (!ids.length || ids.length > MAX_MEAL_UNITS) throw new Error("اختر أصناف الفطار في حدود الكميات المتاحة.")
	const byId = new Map(products.map((item) => [item.id, item])), counts = new Map<string, number>()
	for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1)
	let foodCount = 0
	const selected = Array.from(counts, ([id, quantity]) => {
		const item = byId.get(id)
		if (!item || item.isAvailable === false) throw new Error("أحد أصناف الفطار غير متاح. راجع التكوين.")
		if (quantity > MAX_COMPONENT_QUANTITY) throw new Error("الحد الأقصى لكل صنف 20 وحدة في التكوين.")
		const bread = breadForSlug(item.slug)
		if (!bread && (!isMealFood(kind, item) || (allowedIds !== null && !allowedIds.includes(item.breadParentId ?? id)))) throw new Error("أحد الأصناف غير مسموح به في هذا التكوين.")
		if (!bread) foodCount += quantity
		return { menuItemId: id, nameAr: `${quantity} × ${bread?.nameAr ?? item.nameAr}`, priceEGP: Math.round(componentPrice(item) * quantity * 100) / 100 }
	})
	if (!foodCount) throw new Error("اختر صنف فطار واحدًا على الأقل؛ العيش وحده ليس طبلية أو بوكس.")
	return selected
}
// Quantity is represented by repeated real product IDs. Existing checkout,
// cart identity and inventory already preserve those repetitions. No cart migration.
export function expandedMealAddons(products: MealProduct[], counts: Record<string, number>): SelectedMealItem[] {
	return products.flatMap((item) => Array.from({ length: counts[item.id] ?? 0 }, () => ({ menuItemId: item.id, nameAr: breadForSlug(item.slug)?.nameAr ?? item.nameAr, priceEGP: componentPrice(item) })))
}
export function mealAddonLabel(addons: Array<{ menuItemId: string; nameAr: string }>): string {
	const grouped = new Map<string, { name: string; count: number }>()
	for (const addon of addons) { const entry = grouped.get(addon.menuItemId); if (entry) entry.count++; else grouped.set(addon.menuItemId, { name: addon.nameAr, count: 1 }) }
	return Array.from(grouped.values(), ({ name, count }) => count > 1 ? `${count} × ${name}` : name).join("، ")
}
