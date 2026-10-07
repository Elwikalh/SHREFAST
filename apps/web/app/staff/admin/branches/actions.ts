"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { db, branches, branchTypeEnum } from "@el7bboB/db"
import { requireAdmin } from "@/lib/staff-session"

type BranchType = (typeof branchTypeEnum.enumValues)[number]

export type BranchInput = {
	code: string
	name: string
	type: BranchType
	address: string
}

export async function createBranch(input: BranchInput) {
	await requireAdmin()

	await db.insert(branches).values({
		code: input.code,
		name: input.name,
		type: input.type,
		address: input.address || null,
	})

	revalidatePath("/staff/admin/branches")
}

export async function updateBranch(id: string, input: BranchInput) {
	await requireAdmin()

	await db
		.update(branches)
		.set({
			code: input.code,
			name: input.name,
			type: input.type,
			address: input.address || null,
		})
		.where(eq(branches.id, id))

	revalidatePath("/staff/admin/branches")
}

// Branches are referenced by orders, staff, and order-number blocks, so we
// never hard-delete one — deactivating keeps history intact while removing
// it from active use (e.g. a cart that closed down).
export async function toggleBranchActive(id: string, isActive: boolean) {
	await requireAdmin()
	await db.update(branches).set({ isActive }).where(eq(branches.id, id))
	revalidatePath("/staff/admin/branches")
}
