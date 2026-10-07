export const SANDWICH_BREAD_PREFIX = "sandwich-bread-"
export const sandwichBreadKey = (id: string) => `sandwich_bread:${id}`
export const SANDWICH_BREADS = { baladi: { nameAr: "رغيف بلدي نصين", nameEn: "Baladi loaf — two halves" }, fino: { nameAr: "رغيف فينو", nameEn: "Fino roll" } } as const
export type SandwichBreadKind = keyof typeof SANDWICH_BREADS
export type SandwichBreadConfig = { enabled: boolean; variants: Array<{ id: string; kind: SandwichBreadKind; available: boolean }> }
export type SandwichBreadChoice = { id: string; kind: SandwichBreadKind; nameAr: string; nameEn: string; priceEGP: number }
export type BreadProduct = { id: string; slug: string; nameAr: string; nameEn: string; category: string; priceEGP: string | number; isAvailable?: boolean }
export const isSandwichBread = (slug: string) => slug.startsWith(SANDWICH_BREAD_PREFIX)
export const sandwichBreadEligible = (item: { slug: string; category: string }) => !isSandwichBread(item.slug) && item.slug !== "mix-custom" && (item.category === "base_item" || item.category === "mix")
export function parseSandwichBread(text: string | null | undefined): SandwichBreadConfig | null {
	if (text === undefined) return null
	try {
		const v: unknown = JSON.parse(text ?? "null")
		if (v && typeof v === "object" && !Array.isArray(v)) {
			const row = v as Record<string, unknown>
			if (row.version === 1 && typeof row.enabled === "boolean" && Array.isArray(row.variants) && row.variants.length <= 2) {
				const variants: SandwichBreadConfig["variants"] = []
				for (const raw of row.variants) {
					if (!raw || typeof raw !== "object") throw new Error()
					const r = raw as Record<string, unknown>
					if (typeof r.id !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(r.id) || (r.kind !== "baladi" && r.kind !== "fino") || typeof r.available !== "boolean" || variants.some(x => x.id === r.id || x.kind === r.kind)) throw new Error()
					variants.push({ id: r.id, kind: r.kind, available: r.available })
				}
				return { enabled: row.enabled, variants }
			}
		}
	} catch { /* Never silently restore a base price for corrupted settings. */ }
	return { enabled: true, variants: [] }
}
export function breadChoices(parent: BreadProduct, products: BreadProduct[], config: SandwichBreadConfig | null | undefined): SandwichBreadChoice[] {
	if (!parent.isAvailable || !sandwichBreadEligible(parent) || !config?.enabled) return []
	// Customer-facing order is fixed even if an older admin configuration
	// stored the variants in a different order.
	const orderedVariants = [...config.variants].sort((a, b) =>
		a.kind === b.kind ? 0 : a.kind === "fino" ? -1 : 1,
	)
	return orderedVariants.flatMap(v => {
		const child = products.find(p => p.id === v.id), price = Number(child?.priceEGP)
		return v.available && child?.slug === SANDWICH_BREAD_PREFIX + v.id && child.category === parent.category && Number.isFinite(price) && price > 0 && price <= 10000 ? [{ id: v.id, kind: v.kind, ...SANDWICH_BREADS[v.kind], priceEGP: price }] : []
	})
}
export function resolveBreadSale(id: string, products: BreadProduct[], configs: Record<string, SandwichBreadConfig>): { product: BreadProduct; parent: BreadProduct; choice: SandwichBreadChoice | null } {
	const item = products.find(p => p.id === id)
	if (!item) throw new Error("الصنف غير متاح. راجع المنيو.")
	if (!isSandwichBread(item.slug)) {
		if (!item.isAvailable || (sandwichBreadEligible(item) && configs[id]?.enabled)) throw new Error("اختار نوع العيش المتاح لهذا الساندوتش من المنيو.")
		return { product: item, parent: item, choice: null }
	}
	for (const parent of products) {
		if (!configs[parent.id]?.variants.some(v => v.id === id)) continue
		const choice = breadChoices(parent, products, configs[parent.id]).find(v => v.id === id)
		if (choice) return { product: { ...item, nameAr: `${parent.nameAr} — ${choice.nameAr}`, nameEn: `${parent.nameEn} — ${choice.nameEn}`, isAvailable: true }, parent, choice }
	}
	throw new Error("نوع العيش ده لم يعد متاحًا للصنف. راجع السلة.")
}
export function expandBreadProducts<T extends BreadProduct>(items: T[], allProducts: BreadProduct[], configs: Record<string, SandwichBreadConfig>): Array<T & { breadParentId?: string }> {
	return items.filter(p => !isSandwichBread(p.slug)).flatMap(item => {
		if (!sandwichBreadEligible(item) || !configs[item.id]?.enabled) return [item]
		return breadChoices(item, allProducts, configs[item.id]).map(choice => ({ ...item, id: choice.id, slug: SANDWICH_BREAD_PREFIX + choice.id, nameAr: `${item.nameAr} — ${choice.nameAr}`, nameEn: `${item.nameEn} — ${choice.nameEn}`, priceEGP: choice.priceEGP as T["priceEGP"], breadParentId: item.id }))
	})
}
