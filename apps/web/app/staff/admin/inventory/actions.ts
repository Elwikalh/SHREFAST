"use server"

import { revalidatePath } from "next/cache"
import { and, eq } from "drizzle-orm"
import { db, inventoryItems, branchInventory, inventoryTransfers, staff } from "@el7bboB/db"
import { requireAdmin } from "@/lib/staff-session"

export type InventoryItemInput = {
	name: string
	unit: string
	unitCostEGP: string
}

export async function createInventoryItem(input: InventoryItemInput) {
	await requireAdmin()

	await db.insert(inventoryItems).values({
		name: input.name,
		unit: input.unit,
		unitCostEGP: input.unitCostEGP,
	})

	revalidatePath("/staff/admin/inventory")
}

export async function updateInventoryItem(id: string, input: InventoryItemInput) {
	await requireAdmin()

	await db
		.update(inventoryItems)
		.set({ name: input.name, unit: input.unit, unitCostEGP: input.unitCostEGP })
		.where(eq(inventoryItems.id, id))

	revalidatePath("/staff/admin/inventory")
}

// Sets the low-stock alert line for one inventory item at one branch.
// Creates the branch-inventory row (starting at zero stock) the first time
// a threshold is set for a branch/item pair that never received stock yet.
export async function setLowStockThreshold(branchId: string, inventoryItemId: string, threshold: string) {
	await requireAdmin()

	await db
		.insert(branchInventory)
		.values({
			branchId,
			inventoryItemId,
			currentStock: "0",
			lowStockThreshold: threshold,
		})
		.onConflictDoUpdate({
			target: [branchInventory.branchId, branchInventory.inventoryItemId],
			set: { lowStockThreshold: threshold, updatedAt: new Date() },
		})

	revalidatePath("/staff/admin/inventory")
}

// Records the main restaurant sending stock to a branch/cart, bumps that
// branch's running stock level by the same amount, and logs the transfer
// for the audit trail.
export async function receiveStock(input: {
	branchId: string
	inventoryItemId: string
	quantity: string
	note: string
}) {
	const staffSession = await requireAdmin()

	const [existing] = await db
		.select()
		.from(branchInventory)
		.where(
			and(
				eq(branchInventory.branchId, input.branchId),
				eq(branchInventory.inventoryItemId, input.inventoryItemId),
			),
		)

	const newStock = (Number(existing?.currentStock ?? 0) + Number(input.quantity)).toString()

	if (existing) {
		await db
			.update(branchInventory)
			.set({ currentStock: newStock, updatedAt: new Date() })
			.where(
				and(
					eq(branchInventory.branchId, input.branchId),
					eq(branchInventory.inventoryItemId, input.inventoryItemId),
				),
			)
	} else {
		await db.insert(branchInventory).values({
			branchId: input.branchId,
			inventoryItemId: input.inventoryItemId,
			currentStock: input.quantity,
			lowStockThreshold: "0",
		})
	}

	const [staffRow] = await db.select().from(staff).where(eq(staff.userId, staffSession.userId))

	await db.insert(inventoryTransfers).values({
		toBranchId: input.branchId,
		inventoryItemId: input.inventoryItemId,
		quantity: input.quantity,
		note: input.note || null,
		transferredByStaffId: staffRow?.id ?? null,
	})

	revalidatePath("/staff/admin/inventory")
}
