import { asc } from "drizzle-orm"
import { db, branches } from "@el7bboB/db"
import { requireAdmin } from "@/lib/staff-session"
import { BranchesAdminPanel } from "./branches-admin-panel"

// Always resolves the current admin session and the latest branch list, so
// this must never be statically cached.
export const dynamic = "force-dynamic"

export default async function BranchesAdminPage() {
	await requireAdmin()

	const allBranches = await db
		.select()
		.from(branches)
		.orderBy(asc(branches.type), asc(branches.name))

	return (
		<BranchesAdminPanel
			branches={allBranches.map((branch) => ({
				id: branch.id,
				code: branch.code,
				name: branch.name,
				type: branch.type,
				address: branch.address,
				isActive: branch.isActive,
			}))}
		/>
	)
}
