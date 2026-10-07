import { and, eq, inArray } from "drizzle-orm"
import { db, branchInventory, recipeLines } from "@el7bboB/db"

export type InventoryOrderLine = {
	menuItemId: string
	quantity: number
	addonMenuItemIds?: string[]
}

/**
 * Applies recipe consumption to a branch after an order is accepted.
 * Delivery and cashier orders call the same stock primitive, while keeping
 * their validation, payment and lifecycle rules completely separate.
 */
export async function deductBranchStockForOrder(branchId: string, lines: InventoryOrderLine[]) {
	const timesUsedByMenuItemId = new Map<string, number>()

	for (const line of lines) {
		timesUsedByMenuItemId.set(
			line.menuItemId,
			(timesUsedByMenuItemId.get(line.menuItemId) ?? 0) + line.quantity,
		)
		for (const addonId of line.addonMenuItemIds ?? []) {
			timesUsedByMenuItemId.set(addonId, (timesUsedByMenuItemId.get(addonId) ?? 0) + line.quantity)
		}
	}

	const menuItemIds = Array.from(timesUsedByMenuItemId.keys())
	if (menuItemIds.length === 0) return

	const matchingRecipeLines = await db
		.select()
		.from(recipeLines)
		.where(inArray(recipeLines.menuItemId, menuItemIds))

	const consumedByInventoryItemId = new Map<string, number>()
	for (const recipeLine of matchingRecipeLines) {
		const consumed = Number(recipeLine.quantity) * (timesUsedByMenuItemId.get(recipeLine.menuItemId) ?? 0)
		consumedByInventoryItemId.set(
			recipeLine.inventoryItemId,
			(consumedByInventoryItemId.get(recipeLine.inventoryItemId) ?? 0) + consumed,
		)
	}

	for (const [inventoryItemId, consumedQuantity] of consumedByInventoryItemId) {
		const condition = and(
			eq(branchInventory.branchId, branchId),
			eq(branchInventory.inventoryItemId, inventoryItemId),
		)
		const [stockRow] = await db.select().from(branchInventory).where(condition)
		const currentStock = Number(stockRow?.currentStock ?? 0)
		const newStock = (currentStock - consumedQuantity).toString()

		if (stockRow) {
			await db.update(branchInventory).set({ currentStock: newStock, updatedAt: new Date() }).where(condition)
		} else {
			await db.insert(branchInventory).values({
				branchId,
				inventoryItemId,
				currentStock: newStock,
				lowStockThreshold: "0",
			})
		}
	}
}
