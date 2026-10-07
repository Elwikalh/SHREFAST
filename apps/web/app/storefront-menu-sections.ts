// Presentation-only split: stored categories, links, prices and ordering stay intact.
export type StorefrontSection = "base_item" | "mix" | "packs" | "platter" | "breakfast_box" | "addon" | "beverage"
type Item = { category: Exclude<StorefrontSection, "packs">; nameAr: string; slug: string }
export function storefrontSectionFor(item: Item): StorefrontSection {
	if (item.category !== "platter") return item.category
	const name = item.nameAr.normalize("NFKC").replace(/[\u064B-\u065F\u0670\u0640]/g, "").replace(/ة/g, "ه")
	const isPack = /علب|علبه|باكيت|بكيت|باكت/.test(name)
		|| /(^|[-_])(pack|packet|can|tub)([-_]|$)/.test(item.slug.toLowerCase())
	return isPack ? "packs" : "platter"
}
