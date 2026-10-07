import "server-only"
import { db, menuItems } from "@el7bboB/db"
import { BREADS, MEALS } from "./meal-config"

// Idempotent inserts only: never reset an existing product, image, price,
// availability or owner's later changes. No schema/seed/payment changes.
export async function ensureBreakfastBuilderItems(): Promise<void> {
	await db.insert(menuItems).values([
		...Object.values(MEALS).map((meal) => ({ slug: meal.slug, nameAr: meal.nameAr, nameEn: meal.nameEn, category: meal.category, priceEGP: "0", costEGP: "0", isAvailable: true, sortOrder: 0 })),
		...BREADS.map((bread) => ({ slug: bread.slug, nameAr: bread.nameAr, nameEn: bread.nameEn, category: "addon" as const, priceEGP: String(bread.priceEGP), costEGP: "0", isAvailable: true, sortOrder: 70 })),
	]).onConflictDoNothing({ target: menuItems.slug })
}
