import { adminMenuGroup, type AdminMenuGroup, type GroupableItem } from "./menu-admin-groups"

const PREFIXES: Record<AdminMenuGroup, string> = {
	foul: "foul", potatoes: "potato", falafel: "taameya", eggs: "egg", cheese: "cheese",
	eggplant: "eggplant", tuna: "tuna", sandwiches: "sandwich", sweets: "sweet", mixes: "mix",
	packs: "pack", boxes: "box", platters: "platter", drinks: "drink", extras: "extra", other: "item",
}
export function menuCodePrefix(item: GroupableItem): string {
	// A renamed product's previous code must not influence classification.
	return PREFIXES[adminMenuGroup({ ...item, slug: "" })]
}
export function nextMenuCode(item: GroupableItem, reservedCodes: readonly string[]): string {
	const prefix = menuCodePrefix(item)
	const pattern = new RegExp(`^${prefix}-(\\d+)$`)
	let highest = 0
	for (const code of reservedCodes) {
		const digits = pattern.exec(code)?.[1]
		if (!digits) continue
		const number = Number(digits)
		if (!Number.isSafeInteger(number)) throw new Error("تعذر تحديد كود جديد للصنف")
		highest = Math.max(highest, number)
	}
	if (highest >= 2_147_483_646) throw new Error("تعذر تحديد كود جديد للصنف")
	return `${prefix}-${String(highest + 1).padStart(3, "0")}`
}
export function nextMenuSortOrder(category: string, rows: readonly { category: string; sortOrder: number }[]): number {
	let highest = 0
	for (const row of rows) if (row.category === category) highest = Math.max(highest, row.sortOrder)
	if (highest > 2_147_483_637) throw new Error("تعذر تحديد ترتيب جديد للصنف")
	return highest + 10
}
export function compareAdminMenuItems(a: { sortOrder: number; nameAr: string; slug: string }, b: { sortOrder: number; nameAr: string; slug: string }): number {
	return a.sortOrder - b.sortOrder || a.nameAr.localeCompare(b.nameAr, "ar") || a.slug.localeCompare(b.slug)
}
