"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { db, staff, staffRoleEnum } from "@el7bboB/db"
import { requireAdmin } from "@/lib/staff-session"

type StaffRole = (typeof staffRoleEnum.enumValues)[number]

function resolveBranchId(role: StaffRole, branchId: string | null) {
	if (role === "admin") return null
	if (!branchId) throw new Error("لازم تحدد الفرع لأي دور غير الأدمن")
	return branchId
}

// Turns a pending signup (a `user` row with no `staff` row) into an active
// staff member with a role and a branch. Admin-only — re-checked here even
// though the panel that calls this is already admin-gated.
export async function assignStaff(input: {
	userId: string
	name: string
	role: StaffRole
	branchId: string | null
}) {
	await requireAdmin()

	await db.insert(staff).values({
		userId: input.userId,
		name: input.name,
		role: input.role,
		branchId: resolveBranchId(input.role, input.branchId),
	})

	revalidatePath("/staff/admin")
}

export async function updateStaffAssignment(input: {
	staffId: string
	role: StaffRole
	branchId: string | null
}) {
	await requireAdmin()

	await db
		.update(staff)
		.set({ role: input.role, branchId: resolveBranchId(input.role, input.branchId) })
		.where(eq(staff.id, input.staffId))

	revalidatePath("/staff/admin")
}

export async function removeStaffAccess(staffId: string) {
	await requireAdmin()
	await db.delete(staff).where(eq(staff.id, staffId))
	revalidatePath("/staff/admin")
}
