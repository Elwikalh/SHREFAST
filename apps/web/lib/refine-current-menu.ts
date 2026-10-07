import { eq, inArray } from "drizzle-orm"
import { auditLog, db, menuItems } from "@el7bboB/db"

const MARKER = "menu_orderable_sizes_2026_09"
const oldSlugs = ["tub-foul", "tub-potato", "tub-eggplant", "mix-el7bbob-tub"]
const sizes = [
	["tub-foul-small", "علبة فول الحبوب — صغيرة", "15", "foul-pan.svg", 10],
	["tub-foul-medium", "علبة فول الحبوب — وسط", "25", "foul-pan.svg", 11],
	["tub-foul-large", "علبة فول الحبوب — كبيرة", "40", "foul-pan.svg", 12],
	["tub-potato-small", "علبة بطاطس — صغيرة", "15", "potato.svg", 40],
	["tub-potato-large", "علبة بطاطس — كبيرة", "25", "potato.svg", 41],
	["tub-eggplant-small", "علبة باذنجان — صغيرة", "15", "babaganoug.svg", 50],
	["tub-eggplant-large", "علبة باذنجان — كبيرة", "25", "babaganoug.svg", 51],
	["mix-el7bbob-small", "ميكس الحبوب — صغير", "30", "mezze.svg", 90],
	["mix-el7bbob-large", "ميكس الحبوب — كبير", "50", "mezze.svg", 91],
] as const

export async function refineCurrentMenu() {
	const [done] = await db.select({ id: auditLog.id }).from(auditLog).where(eq(auditLog.action, MARKER)).limit(1)
	if (done) return
	await db.transaction(async (tx) => {
		await tx.update(menuItems).set({ isAvailable: false, updatedAt: new Date() }).where(inArray(menuItems.slug, oldSlugs))
		for (const [slug, nameAr, priceEGP, image, sortOrder] of sizes) {
			const values = { slug, nameAr, nameEn: nameAr, category: "platter" as const, priceEGP, costEGP: "0", isAvailable: true, sortOrder, photoDataUrl: `/food/${image}`, descriptionAr: null, descriptionEn: null, updatedAt: new Date() }
			await tx.insert(menuItems).values(values).onConflictDoUpdate({ target: menuItems.slug, set: values })
		}
		await tx.insert(auditLog).values({ action: MARKER, entityType: "menu", entityId: "sizes", reason: "Split packaged items into independently priced orderable sizes", metadataJson: { created: sizes.length } })
	})
}
