"use server"

import { revalidatePath } from "next/cache"
import { and, eq } from "drizzle-orm"
import { db, recipeLines } from "@el7bboB/db"
import { requireAdmin } from "@/lib/staff-session"

// Upserts how much of one inventory item goes into one menu item. This is
// what powers automatic stock deduction when an order is placed.
export async function setRecipeLine(menuItemId: string, inventoryItemId: string, quantity: string) {
	await requireAdmin()

	await db
		.insert(recipeLines)
		.values({ menuItemId, inventoryItemId, quantity })
		.onConflictDoUpdate({
			target: [recipeLines.menuItemId, recipeLines.inventoryItemId],
			set: { quantity },
		})

	revalidatePath("/staff/admin/recipes")
}

export async function removeRecipeLine(menuItemId: string, inventoryItemId: string) {
	await requireAdmin()

	await db
		.delete(recipeLines)
		.where(and(eq(recipeLines.menuItemId, menuItemId), eq(recipeLines.inventoryItemId, inventoryItemId)))

	revalidatePath("/staff/admin/recipes")
}
