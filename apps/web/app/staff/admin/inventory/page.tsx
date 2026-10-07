import { asc, eq } from "drizzle-orm"
import { Boxes } from "lucide-react"
import { db, inventoryItems, branches, branchInventory } from "@el7bboB/db"
import { requireAdmin } from "@/lib/staff-session"
import { InventoryAdminPanel } from "./inventory-admin-panel"

export const dynamic = "force-dynamic"

export default async function InventoryAdminPage() {
	await requireAdmin()

	const allItems = await db.select().from(inventoryItems).orderBy(asc(inventoryItems.name))
	const allBranches = await db
		.select()
		.from(branches)
		.where(eq(branches.isActive, true))
		.orderBy(asc(branches.name))
	const allStock = await db.select().from(branchInventory)

	return (
		<div>
			{/* Every admin screen now opens with the same heading band, so moving
				between them feels like one product. */}
			<div className="card mb-5 flex items-center gap-3 p-5">
				<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--sesame)] text-[var(--amber-deep)]">
					<Boxes className="h-5 w-5" />
				</span>
				<div>
					<h1 className="text-2xl font-black text-[var(--ink)]">المخزون والتوريد</h1>
					<p className="mt-0.5 text-sm font-bold text-[var(--ink)]/50">
						الخامات ورصيد كل نقطة بيع وحد التنبيه للنقص
					</p>
				</div>
			</div>

			<InventoryAdminPanel
				items={allItems.map((item) => ({
					id: item.id,
					name: item.name,
					unit: item.unit,
					unitCostEGP: item.unitCostEGP,
				}))}
				branches={allBranches.map((branch) => ({ id: branch.id, name: branch.name }))}
				stock={allStock.map((row) => ({
					branchId: row.branchId,
					inventoryItemId: row.inventoryItemId,
					currentStock: row.currentStock,
					lowStockThreshold: row.lowStockThreshold,
				}))}
			/>
		</div>
	)
}
