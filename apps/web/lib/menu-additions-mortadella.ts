import { and, eq, like, notLike } from "drizzle-orm"
import { auditLog, db, menuItems, siteSettings } from "@el7bboB/db"
import { SANDWICH_BREAD_PREFIX, SANDWICH_BREADS, sandwichBreadKey, type SandwichBreadKind } from "../app/sandwich-bread"

// One-shot menu gap fill (runs once at boot, guarded by the audit-log marker):
// adds the mortadella line and the paper-menu items that never made it to the
// site, wiring each sandwich to its bread variants exactly like the admin
// sandwich-bread panel does — so the owner can still edit prices there later.
const MARKER = "menu_mortadella_and_paper_gaps_2026_10"

type SandwichSeed = {
	slug: string
	nameAr: string
	// Reuse a hand-added item with this name instead of creating a duplicate.
	matchName?: string
	fino: string
	baladi: string | null
	sortOrder: number
	photo: string
	descriptionAr?: string
}

const SANDWICHES: SandwichSeed[] = [
	{ slug: "mortadella-plain", nameAr: "مورتة", fino: "12", baladi: "16", sortOrder: 235, photo: "mezze.svg" },
	{ slug: "mortadella-roumy", nameAr: "رومي على مورتة", matchName: "رومي على مورتة", fino: "18", baladi: "22", sortOrder: 236, photo: "egg-cheese.svg", descriptionAr: "جبنة رومي على شرائح مورتة" },
	{ slug: "mortadella-nesto", nameAr: "نستو على مورتة", fino: "17", baladi: "21", sortOrder: 237, photo: "egg-cheese.svg", descriptionAr: "جبنة نستو على شرائح مورتة" },
	{ slug: "foul-makhsous", nameAr: "فول مخصوص الحبوب", fino: "14", baladi: "14", sortOrder: 75, photo: "foul-sandwich.svg" },
	{ slug: "foul-sogo2", nameAr: "فول بالسجق البلدي", fino: "16", baladi: "16", sortOrder: 76, photo: "foul-sandwich.svg" },
	{ slug: "taameya-makhsous", nameAr: "طعمية مخصوص الحبوب", fino: "12", baladi: "12", sortOrder: 125, photo: "mezze.svg" },
	{ slug: "zaeem", nameAr: "الزعيم", fino: "16", baladi: "16", sortOrder: 232, photo: "egg-cheese.svg", descriptionAr: "بيض + جبنة قديمة + طعمية" },
	{ slug: "tuna-salad-tahini", nameAr: "تونة بالسلطة والطحينة", fino: "18", baladi: "18", sortOrder: 233, photo: "mezze.svg" },
	{ slug: "halawa-gam", nameAr: "حلاوة بالمربى", fino: "10", baladi: null, sortOrder: 395, photo: "mezze.svg", descriptionAr: "عيش فينو" },
]

// Fixed child ids keep re-runs idempotent and stay compatible with the admin
// sandwich-bread panel, which edits variants by id.
const BREAD_IDS: Record<string, { fino: string; baladi: string }> = {
	"mortadella-plain": { fino: "fe7f6dcc-1fc4-4461-a815-45efc74d717b", baladi: "4bf73889-70b6-4140-9581-d6650e0273d7" },
	"mortadella-roumy": { fino: "0494cd2f-7aca-43f3-8447-addd8249823f", baladi: "62661f1f-559f-43ad-ada7-bf864870635c" },
	"mortadella-nesto": { fino: "fa22cdf5-573f-4947-9134-10da8174c37a", baladi: "4c066512-9ce7-4700-83ec-e50bc58906f6" },
	"foul-makhsous": { fino: "a2cebcd9-b1cb-4fcb-a1c1-7819fe8934cd", baladi: "aae8306d-d364-49f0-b4e7-d4b21e089796" },
	"foul-sogo2": { fino: "4d33c660-0f36-4e07-86bd-ea4dd5dc867d", baladi: "acea1fb7-a58c-4cc3-9a4b-e30040c64eae" },
	"taameya-makhsous": { fino: "16c03383-e675-4d24-974c-5b7c37bfaaad", baladi: "712bc244-6ab3-4be0-a648-7869ba206492" },
	"zaeem": { fino: "f7e1a7da-e81a-452d-a6d1-d3a3b13bd87b", baladi: "07586985-1db4-4688-8a79-0392929123d6" },
	"tuna-salad-tahini": { fino: "08eca472-e61d-45e0-afe4-c4fa20688505", baladi: "94321828-d525-48e3-ae69-af84ee9bc071" },
	"halawa-gam": { fino: "61a8520b-b43b-4011-849e-4558b33e0d35", baladi: "70c235fa-7ff7-4ed5-9849-af8641322149" },
}

const TRAYS = [
	["tray-foul-20", "صينية فول — 20 ساندوتش", "150", 150],
	["tray-taameya-20", "صينية طعمية — 20 ساندوتش", "130", 151],
	["tray-mixed-eco-20", "مشكل اقتصادي — 20 ساندوتش", "140", 152],
	["tray-mixed-special-20", "مشكل مخصوص — 20 ساندوتش", "210", 153],
	["tray-mini-mixed-30", "ميني مشكل — 30 قطعة", "180", 154],
] as const

export async function syncMortadellaAndPaperGaps() {
	const [done] = await db.select({ id: auditLog.id }).from(auditLog).where(eq(auditLog.action, MARKER)).limit(1)
	if (done) return
	await db.transaction(async (tx) => {
		for (const seed of SANDWICHES) {
			const [existing] = seed.matchName
				? await tx.select().from(menuItems).where(and(like(menuItems.nameAr, `${seed.matchName}%`), notLike(menuItems.slug, `${SANDWICH_BREAD_PREFIX}%`))).limit(1)
				: []
			let parentId: string
			if (existing) {
				// Fix the hand-added item in place: keep its slug and any uploaded
				// photo, just make sure it is visible and priced.
				parentId = existing.id
				await tx.update(menuItems).set({ priceEGP: seed.fino, isAvailable: true, sortOrder: seed.sortOrder, descriptionAr: existing.descriptionAr ?? seed.descriptionAr ?? null, updatedAt: new Date() }).where(eq(menuItems.id, existing.id))
			} else {
				parentId = crypto.randomUUID()
				await tx.insert(menuItems).values({ id: parentId, slug: seed.slug, nameAr: seed.nameAr, nameEn: seed.nameAr, category: "base_item", priceEGP: seed.fino, costEGP: "0", isAvailable: true, sortOrder: seed.sortOrder, photoDataUrl: `/food/${seed.photo}`, descriptionAr: seed.descriptionAr ?? null, descriptionEn: null, updatedAt: new Date() }).onConflictDoNothing()
				const [inserted] = await tx.select({ id: menuItems.id }).from(menuItems).where(eq(menuItems.slug, seed.slug)).limit(1)
				if (!inserted) continue
				parentId = inserted.id
			}
			const kinds: SandwichBreadKind[] = seed.baladi === null ? ["fino"] : ["fino", "baladi"]
			const variants: Array<{ id: string; kind: SandwichBreadKind; available: boolean }> = []
			const ids = BREAD_IDS[seed.slug]
			if (!ids) continue
			for (const kind of kinds) {
				const id = ids[kind]
				const label = SANDWICH_BREADS[kind]
				const parentName = existing ? existing.nameAr.trim() : seed.nameAr
				await tx.insert(menuItems).values({ id, slug: SANDWICH_BREAD_PREFIX + id, nameAr: `${parentName} — ${label.nameAr}`, nameEn: `${parentName} — ${label.nameEn}`, category: "base_item", priceEGP: kind === "fino" ? seed.fino : seed.baladi ?? seed.fino, costEGP: "0", isAvailable: false, sortOrder: seed.sortOrder, updatedAt: new Date() }).onConflictDoNothing()
				variants.push({ id, kind, available: true })
			}
			const value = JSON.stringify({ version: 1, enabled: true, variants })
			await tx.insert(siteSettings).values({ id: sandwichBreadKey(parentId), heroImageDataUrl: value }).onConflictDoUpdate({ target: siteSettings.id, set: { heroImageDataUrl: value, updatedAt: new Date() } })
		}
		for (const [slug, nameAr, priceEGP, sortOrder] of TRAYS) {
			const values = { slug, nameAr, nameEn: nameAr, category: "platter" as const, priceEGP, costEGP: "0", isAvailable: true, sortOrder, photoDataUrl: "/food/mezze.svg", descriptionAr: "للمحلات والتجمعات — يُفضّل الطلب مسبقًا", descriptionEn: null, updatedAt: new Date() }
			await tx.insert(menuItems).values(values).onConflictDoUpdate({ target: menuItems.slug, set: values })
		}
		await tx.insert(auditLog).values({ action: MARKER, entityType: "menu", entityId: "mortadella+paper-gaps", reason: "Mortadella line, missing paper-menu sandwiches, and distribution trays", metadataJson: { sandwiches: SANDWICHES.length, trays: TRAYS.length } })
	})
}
