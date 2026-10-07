import { mealKindForSlug } from "../../../meal-config"

type Detail = { menuItemId: string; nameAr: string }
export type PreparationOrder = {
	id: string; displayNumber: string; status: string; branchCode: string; branchName: string
	paymentMethod: string | null; paymentStatus: string | null; customerNote: string | null
	items: Array<{ menuItemId?: string; menuItemSlug?: string; nameAr: string; quantity: number; addons: string[]; addonDetails?: Detail[]; note: string | null }>
}
export type PreparationVariant = {
	quantity: number; waiting: number; preparing: number; addons: string[]; note: string; orderNote: string; source: string
	references: Array<{ id: string; displayNumber: string; quantity: number }>
}
export type PreparationProduct = {
	key: string; nameAr: string; quantity: number; waiting: number; preparing: number; assembly: boolean; variants: PreparationVariant[]
}
export type PreparationBranch = { code: string; name: string; products: PreparationProduct[] }
export type PreparationSummary = { orderCount: number; branches: PreparationBranch[]; incompleteComposition: boolean }

export function needsPreparation(order: PreparationOrder): boolean {
	if (order.status !== "queued" && order.status !== "in_progress") return false
	if (order.paymentMethod === "instapay") return order.paymentStatus === "confirmed"
	return order.paymentMethod === "cash" && ["pending", "awaiting_confirmation", "confirmed"].includes(order.paymentStatus ?? "")
}

export function buildPreparationSummary(orders: PreparationOrder[]): PreparationSummary {
	const branches = new Map<string, PreparationBranch>(), products = new Map<string, PreparationProduct>(), variants = new Map<string, PreparationVariant>(), seen = new Set<string>()
	let orderCount = 0, incompleteComposition = false
	function add(order: PreparationOrder, item: PreparationOrder["items"][number], quantity: number, source: string, assembly: boolean) {
		if (!Number.isSafeInteger(quantity) || quantity <= 0) return
		let branch = branches.get(order.branchCode)
		if (!branch) { branch = { code: order.branchCode, name: order.branchName, products: [] }; branches.set(order.branchCode, branch) }
		const key = JSON.stringify([order.branchCode, item.menuItemId ?? item.nameAr]), waiting = order.status === "queued" ? quantity : 0, preparing = order.status === "in_progress" ? quantity : 0
		let product = products.get(key)
		if (!product) { product = { key, nameAr: item.nameAr, quantity: 0, waiting: 0, preparing: 0, assembly, variants: [] }; products.set(key, product); branch.products.push(product) }
		product.quantity += quantity; product.waiting += waiting; product.preparing += preparing
		// Preserve repeated components and distinguish real IDs when supplied.
		const signature = (item.addonDetails?.map((addon) => JSON.stringify([addon.menuItemId, addon.nameAr])) ?? [...item.addons]).sort()
		const note = item.note?.trim() ?? "", orderNote = order.customerNote?.trim() ?? "", variantKey = JSON.stringify([key, signature, note, orderNote, source])
		let variant = variants.get(variantKey)
		if (!variant) { variant = { quantity: 0, waiting: 0, preparing: 0, addons: [...item.addons], note, orderNote, source, references: [] }; variants.set(variantKey, variant); product.variants.push(variant) }
		variant.quantity += quantity; variant.waiting += waiting; variant.preparing += preparing
		const reference = variant.references.find((value) => value.id === order.id)
		if (reference) reference.quantity += quantity
		else variant.references.push({ id: order.id, displayNumber: order.displayNumber, quantity })
	}
	for (const order of orders) {
		if (seen.has(order.id) || !needsPreparation(order)) continue
		seen.add(order.id); orderCount++
		for (const item of order.items) {
			if (!Number.isSafeInteger(item.quantity) || item.quantity <= 0) continue
			const kind = mealKindForSlug(item.menuItemSlug ?? "")
			add(order, item, item.quantity, "", kind !== null)
			if (!kind) continue
			// Custom tray/box snapshots encode component units as '3 × name'.
			// Keep the container card, and count real food/bread units separately.
			if (!item.addonDetails?.length) { incompleteComposition = true; continue }
			for (const component of item.addonDetails) {
				const match = /^(\d+)\s*×\s*(.+)$/u.exec(component.nameAr), units = Number(match?.[1])
				if (!match?.[2] || !Number.isSafeInteger(units) || units <= 0) { incompleteComposition = true; continue }
				add(order, { menuItemId: component.menuItemId, nameAr: match[2], quantity: units, addons: [], note: item.note }, units * item.quantity, `ضمن ${item.nameAr}`, false)
			}
		}
	}
	for (const branch of branches.values()) branch.products.sort((a, b) => Number(a.assembly) - Number(b.assembly) || b.quantity - a.quantity || a.nameAr.localeCompare(b.nameAr, "ar") || a.key.localeCompare(b.key))
	return { orderCount, branches: Array.from(branches.values()), incompleteComposition }
}
