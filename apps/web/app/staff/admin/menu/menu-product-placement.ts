import { adminMenuGroup, normalizeMenuSearch, ADMIN_MENU_GROUPS, type GroupableItem } from "./menu-admin-groups"

type Category = "base_item" | "mix" | "platter" | "breakfast_box" | "addon" | "beverage"
const categories = new Set<string>(["base_item", "mix", "platter", "breakfast_box", "addon", "beverage"])
export function inferNewProductCategory(nameAr: string, existing: readonly GroupableItem[]): Category {
	const name = normalizeMenuSearch(nameAr).replace(/\s+/g, " ")
	if (!name) return "base_item"
	// Reuse a matching known product's category, never modify that product.
	const exact = existing.find((item) => normalizeMenuSearch(item.nameAr).replace(/\s+/g, " ") === name)
	if (exact && categories.has(exact.category)) return exact.category as Category
	// Packaging and explicit types take precedence over filling ingredients.
	if (/^(بوكس|بوكسات)(?:\s|$)/.test(name)) return "breakfast_box"
	if (/^(علبه|علب|باكيت|باكت|بكيت|طبلية|طبليه|طبق|اطباق|طاسه)(?:\s|$)/.test(name)) return "platter"
	if (/^(روقان|ميكس)(?:\s|$)/.test(name) && !/^ميكس جبن(?:\s|$)/.test(name)) return "mix"
	if (/^(اضافه|اضافات|زياده)(?:\s|$)|(?:\s)(اضافي|اضافيه|زياده)$/.test(name)) return "addon"
	if (/^(شاي|قهوه|مياه|ماء|عصير|بيبسي|كوكاكولا|كولا|سبرايت|فانتا|ميرندا|سفن اب|نسكافيه|كابتشينو|مشروب)(?:\s|$)/.test(name)) return "beverage"
	if (/^(ساندوتش|ساندويتش)(?:\s|$)/.test(name)) return "base_item"
	if (adminMenuGroup({ nameAr, nameEn: "", slug: "", category: "base_item" }) !== "sandwiches") return "base_item"
	// A distinctive existing-name prefix can identify a custom drink/extra
	// family. Don't use generic ingredient matches to invent recipes.
	const similar = existing.filter((item) => {
		const known = normalizeMenuSearch(item.nameAr).replace(/\s+/g, " ")
		return known.length >= 5 && name.startsWith(`${known} `) && (item.category === "beverage" || item.category === "addon")
	}).sort((a, b) => b.nameAr.length - a.nameAr.length)[0]
	if (similar) return similar.category as Category
	return "base_item"
}
export function newProductPlacementLabel(item: GroupableItem): string {
	const group = adminMenuGroup({ ...item, slug: "" })
	return ADMIN_MENU_GROUPS.find((option) => option.value === group)?.label ?? "أصناف أخرى"
}
