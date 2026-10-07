import { asc } from "drizzle-orm"
import { ChefHat } from "lucide-react"
import { db, menuItems, inventoryItems, recipeLines } from "@el7bboB/db"
import { requireAdmin } from "@/lib/staff-session"
import { RecipeAdminPanel } from "./recipe-admin-panel"

export const dynamic = "force-dynamic"

export default async function RecipesAdminPage() {
	await requireAdmin()

	const allMenuItems = await db
		.select()
		.from(menuItems)
		.orderBy(asc(menuItems.category), asc(menuItems.sortOrder))
	const allInventoryItems = await db.select().from(inventoryItems).orderBy(asc(inventoryItems.name))
	const allRecipeLines = await db.select().from(recipeLines)

	return (
		<div>
			<div className="card mb-5 flex items-center gap-3 p-5">
				<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--sesame)] text-[var(--amber-deep)]">
					<ChefHat className="h-5 w-5" />
				</span>
				<div>
					<h1 className="text-2xl font-black text-[var(--ink)]">وصفات الأصناف</h1>
					<p className="mt-0.5 text-sm font-bold text-[var(--ink)]/50">
						كل صنف وبياكل كام من المخزون علشان الخصم يتم لوحده
					</p>
				</div>
			</div>

			<RecipeAdminPanel
				menuItems={allMenuItems.map((item) => ({ id: item.id, nameAr: item.nameAr, category: item.category }))}
				inventoryItems={allInventoryItems.map((item) => ({ id: item.id, name: item.name, unit: item.unit }))}
				recipeLines={allRecipeLines.map((line) => ({
					menuItemId: line.menuItemId,
					inventoryItemId: line.inventoryItemId,
					quantity: line.quantity,
				}))}
			/>
		</div>
	)
}
