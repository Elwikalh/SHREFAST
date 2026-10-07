// Admin-only navigation groups. Never change stored category, price, or sortOrder.
export const ADMIN_MENU_GROUPS = [
	{ value: "foul", label: "الفول" },
	{ value: "potatoes", label: "البطاطس" },
	{ value: "falafel", label: "الطعمية" },
	{ value: "eggs", label: "البيض" },
	{ value: "cheese", label: "الجبنة" },
	{ value: "eggplant", label: "الباذنجان" },
	{ value: "tuna", label: "التونة" },
	{ value: "sandwiches", label: "باقي الساندوتشات" },
	{ value: "sweets", label: "الحلو" },
	{ value: "mixes", label: "الميكسات / روقان الحبوب" },
	{ value: "packs", label: "العلب والباكيت" },
	{ value: "boxes", label: "بوكسات الساندوتشات" },
	{ value: "platters", label: "طبلية الفطار والأطباق" },
	{ value: "drinks", label: "المشروبات" },
	{ value: "extras", label: "الإضافات والمقبلات" },
	{ value: "other", label: "أصناف أخرى" },
] as const
export type AdminMenuGroup = (typeof ADMIN_MENU_GROUPS)[number]["value"]
export type GroupableItem = { slug: string; nameAr: string; nameEn: string; category: string }
export function normalizeMenuSearch(value: string): string {
	return value.toLowerCase().normalize("NFKC").replace(/[\u064B-\u065F\u0670\u0640]/g, "")
		.replace(/[أإآٱ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").trim()
}
export function matchesMenuSearch(item: GroupableItem, query: string): boolean {
	const haystack = normalizeMenuSearch(`${item.nameAr} ${item.nameEn} ${item.slug}`)
	return normalizeMenuSearch(query).split(/\s+/).every((term) => haystack.includes(term))
}
export function adminMenuGroup(item: GroupableItem): AdminMenuGroup {
	const name = normalizeMenuSearch(item.nameAr)
	const slug = item.slug.toLowerCase()
	// Existing category takes precedence over ingredients in a compound name.
	if (item.category === "breakfast_box") return "boxes"
	if (item.category === "beverage") return "drinks"
	if (item.category === "addon") return "extras"
	if (item.category === "mix") return "mixes"
	if (item.category === "platter") {
		return /علب|علبه|باكيت|بكيت|باكت/.test(name) || /(^|[-_])(pack|packet|can|tub)([-_]|$)/.test(slug)
			? "packs" : "platters"
	}
	if (item.category !== "base_item") return "other"
	if (/حلاوه|مربي|عسل|سكلنس/.test(name) || /halawa|honey|jam|sakalance|sweet/.test(slug)) return "sweets"
	// Match the main ingredient at the start, not a filling mentioned later:
	// فول بالبطاطس stays with foul; بيض بالجبنة stays with eggs.
	const main = name.replace(/^(ساندوتش|ساندويتش)\s+/, "")
	if (/^فول/.test(main) || /^(foul|ful)[-_]/.test(slug)) return "foul"
	if (/^بطاطس/.test(main) || /^(batates|potato)[-_]/.test(slug)) return "potatoes"
	if (/^طعميه/.test(main) || /^(taamia|falafel)[-_]/.test(slug)) return "falafel"
	if (/^بيض/.test(main) || /^(beid|egg)[-_]/.test(slug)) return "eggs"
	if (/^جبنه|^ميكس جبن/.test(main) || /^(gebna|cheese)[-_]/.test(slug)) return "cheese"
	if (/^باذنجان|^بتنجان|^باباغنوج/.test(main) || /^(betengan|eggplant|babaghanoug)/.test(slug)) return "eggplant"
	if (/^تونه/.test(main) || /^tuna(?:[-_]|$)/.test(slug)) return "tuna"
	return "sandwiches"
}
