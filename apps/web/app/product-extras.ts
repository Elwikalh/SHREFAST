import { isSandwichBread } from "./sandwich-bread"
export const PRODUCT_EXTRA_PREFIX = "product-extra-"
export const productExtrasKey = (id: string) => `product_extras:${id}`
export type ProductExtrasConfig = { enabled: boolean; optionIds: string[]; availableIds: string[] }
export type ProductExtraOption = { id: string; nameAr: string; nameEn: string; priceEGP: number }
export function isProductExtra(slug: string) { return slug.startsWith(PRODUCT_EXTRA_PREFIX) }
export function extrasEligible(slug: string, category: string) { return !isSandwichBread(slug) && !isProductExtra(slug) && category !== "addon" && slug !== "mix-custom" && slug !== "breakfast-tray-custom" && slug !== "breakfast-box-custom" }
export function parseProductExtras(text: string | null | undefined): ProductExtrasConfig | null {
	if (text === undefined) return null
	try {
		const value: unknown = JSON.parse(text ?? "null")
		if (value && typeof value === "object" && !Array.isArray(value)) {
			const row = value as Record<string, unknown>
			if (row.version === 1 && typeof row.enabled === "boolean" && Array.isArray(row.optionIds) && Array.isArray(row.availableIds) && row.optionIds.length <= 10 && row.optionIds.every((id: unknown) => typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) && row.availableIds.every((id: unknown) => typeof id === "string" && (row.optionIds as string[]).includes(id))) return { enabled: row.enabled, optionIds: Array.from(new Set(row.optionIds as string[])), availableIds: Array.from(new Set(row.availableIds as string[])) }
		}
	} catch { /* Invalid stored configuration fails closed. */ }
	return { enabled: false, optionIds: [], availableIds: [] }
}
export function acceptsProductExtra(config: ProductExtrasConfig | null, addon: { id: string; slug: string }) {
	return config ? config.enabled && config.availableIds.includes(addon.id) : !isProductExtra(addon.slug)
}
