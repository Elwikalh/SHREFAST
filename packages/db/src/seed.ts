import { db } from "./client"
import { branches, menuItems, mixItems } from "./schema"

type MenuCategory = (typeof menuItems.$inferInsert)["category"]

type SeedItem = {
	slug: string
	nameAr: string
	nameEn: string
	category: MenuCategory
	priceEGP: string
	costEGP: string
	sortOrder: number
}

// اللوكيد منيو نسخة ١ (أغسطس ٢٠٢٦) — الطعمية مستثناة عمدًا بقرار صاحب المشروع،
// هتتضاف لاحقًا لو ظهر طلب حقيقي عليها. لا تُضِف طعمية هنا بدون تأكيد صريح.
const baseItems: SeedItem[] = [
	{ slug: "foul-sada", nameAr: "فول سادة", nameEn: "Plain Foul", category: "base_item", priceEGP: "12", costEGP: "4.5", sortOrder: 1 },
	{ slug: "foul-zeit-har", nameAr: "فول بالزيت الحار", nameEn: "Foul with Spicy Oil", category: "base_item", priceEGP: "14", costEGP: "5.0", sortOrder: 2 },
	{ slug: "foul-eskandarani", nameAr: "فول إسكندراني", nameEn: "Alexandrian Foul", category: "base_item", priceEGP: "16", costEGP: "6.0", sortOrder: 3 },
	{ slug: "foul-samna-baladi", nameAr: "فول بالسمنة البلدي", nameEn: "Foul with Baladi Ghee", category: "base_item", priceEGP: "18", costEGP: "7.0", sortOrder: 4 },
	{ slug: "batates-mehamara", nameAr: "بطاطس محمرة", nameEn: "Fried Potatoes", category: "base_item", priceEGP: "15", costEGP: "5.5", sortOrder: 5 },
	{ slug: "gebna-beida", nameAr: "جبنة بيضاء", nameEn: "White Cheese", category: "base_item", priceEGP: "14", costEGP: "5.5", sortOrder: 6 },
	{ slug: "gebna-adima", nameAr: "جبنة قديمة / مقلية", nameEn: "Aged / Fried Cheese", category: "base_item", priceEGP: "20", costEGP: "8.5", sortOrder: 7 },
	{ slug: "beid-omelette", nameAr: "بيض عجة بلدي", nameEn: "Baladi Omelette", category: "base_item", priceEGP: "18", costEGP: "8.0", sortOrder: 8 },
	{ slug: "halawa-tahiniya", nameAr: "حلاوة طحينية", nameEn: "Halawa", category: "base_item", priceEGP: "12", costEGP: "4.5", sortOrder: 9 },
	{ slug: "betengan-mikli", nameAr: "باذنجان مقلي", nameEn: "Fried Eggplant", category: "base_item", priceEGP: "14", costEGP: "5.0", sortOrder: 10 },
	{ slug: "babaghanoug", nameAr: "باباغنوج", nameEn: "Baba Ghanoush", category: "base_item", priceEGP: "18", costEGP: "6.5", sortOrder: 11 },
	{ slug: "hummus-tahina", nameAr: "حمص بالطحينة", nameEn: "Hummus with Tahini", category: "base_item", priceEGP: "18", costEGP: "6.0", sortOrder: 12 },
	{ slug: "tuna", nameAr: "تونة", nameEn: "Tuna", category: "base_item", priceEGP: "28", costEGP: "13.0", sortOrder: 13 },
]

const mixes: SeedItem[] = [
	{ slug: "mix-foul-batates", nameAr: "فول بالبطاطس", nameEn: "Foul & Potatoes Mix", category: "mix", priceEGP: "18", costEGP: "6.7", sortOrder: 1 },
	{ slug: "mix-foul-gebna", nameAr: "فول بالجبنة", nameEn: "Foul & Cheese Mix", category: "mix", priceEGP: "20", costEGP: "8.0", sortOrder: 2 },
	{ slug: "mix-betengan-foul", nameAr: "باذنجان بالفول", nameEn: "Eggplant & Foul Mix", category: "mix", priceEGP: "20", costEGP: "7.6", sortOrder: 3 },
	{ slug: "mix-batates-gebna", nameAr: "بطاطس بالجبنة", nameEn: "Potatoes & Cheese Mix", category: "mix", priceEGP: "20", costEGP: "8.2", sortOrder: 4 },
	{ slug: "mix-foul-beid", nameAr: "فول بالبيض", nameEn: "Foul & Egg Mix", category: "mix", priceEGP: "22", costEGP: "9.5", sortOrder: 5 },
	{ slug: "mix-babaghanoug-batates", nameAr: "باباغنوج بالبطاطس", nameEn: "Baba Ghanoush & Potatoes Mix", category: "mix", priceEGP: "22", costEGP: "8.4", sortOrder: 6 },
	{ slug: "mix-hummus-foul", nameAr: "حمص بالفول", nameEn: "Hummus & Foul Mix", category: "mix", priceEGP: "22", costEGP: "7.9", sortOrder: 7 },
	{ slug: "mix-beid-gebna", nameAr: "بيض بالجبنة", nameEn: "Egg & Cheese Mix", category: "mix", priceEGP: "24", costEGP: "10.8", sortOrder: 8 },
	{ slug: "mix-dynamite", nameAr: "ديناميت الحبّوب", nameEn: "El7bboB Dynamite", category: "mix", priceEGP: "30", costEGP: "12.6", sortOrder: 9 },
	{ slug: "mix-tuna-gebna", nameAr: "تونة بالجبنة", nameEn: "Tuna & Cheese Mix", category: "mix", priceEGP: "32", costEGP: "15.4", sortOrder: 10 },
	{ slug: "mix-big", nameAr: "ميكس الحبّوب الكبير", nameEn: "El7bboB Big Mix", category: "mix", priceEGP: "38", costEGP: "16.7", sortOrder: 11 },
]

const platters: SeedItem[] = [
	{ slug: "platter-foul-sada-s", nameAr: "طاسة فول سادة - صغير", nameEn: "Plain Foul Platter - Small", category: "platter", priceEGP: "25", costEGP: "9.0", sortOrder: 1 },
	{ slug: "platter-foul-sada-l", nameAr: "طاسة فول سادة - كبير", nameEn: "Plain Foul Platter - Large", category: "platter", priceEGP: "40", costEGP: "15.0", sortOrder: 2 },
	{ slug: "platter-foul-zeit-har-s", nameAr: "طاسة فول بالزيت الحار - صغير", nameEn: "Spicy Oil Foul Platter - Small", category: "platter", priceEGP: "28", costEGP: "10.0", sortOrder: 3 },
	{ slug: "platter-foul-zeit-har-l", nameAr: "طاسة فول بالزيت الحار - كبير", nameEn: "Spicy Oil Foul Platter - Large", category: "platter", priceEGP: "45", costEGP: "17.0", sortOrder: 4 },
	{ slug: "platter-foul-beid-s", nameAr: "طاسة فول بالبيض - صغير", nameEn: "Foul & Egg Platter - Small", category: "platter", priceEGP: "35", costEGP: "15.5", sortOrder: 5 },
	{ slug: "platter-foul-beid-l", nameAr: "طاسة فول بالبيض - كبير", nameEn: "Foul & Egg Platter - Large", category: "platter", priceEGP: "55", costEGP: "24.0", sortOrder: 6 },
	{ slug: "platter-hummus-s", nameAr: "طاسة حمص - صغير", nameEn: "Hummus Platter - Small", category: "platter", priceEGP: "30", costEGP: "10.0", sortOrder: 7 },
	{ slug: "platter-hummus-l", nameAr: "طاسة حمص - كبير", nameEn: "Hummus Platter - Large", category: "platter", priceEGP: "50", costEGP: "17.0", sortOrder: 8 },
	{ slug: "platter-babaghanoug-s", nameAr: "طاسة باباغنوج - صغير", nameEn: "Baba Ghanoush Platter - Small", category: "platter", priceEGP: "25", costEGP: "9.0", sortOrder: 9 },
	{ slug: "platter-babaghanoug-l", nameAr: "طاسة باباغنوج - كبير", nameEn: "Baba Ghanoush Platter - Large", category: "platter", priceEGP: "45", costEGP: "16.0", sortOrder: 10 },
	{ slug: "platter-batates-s", nameAr: "طاسة بطاطس محمرة - صغير", nameEn: "Fried Potatoes Platter - Small", category: "platter", priceEGP: "25", costEGP: "9.0", sortOrder: 11 },
	{ slug: "platter-batates-l", nameAr: "طاسة بطاطس محمرة - كبير", nameEn: "Fried Potatoes Platter - Large", category: "platter", priceEGP: "40", costEGP: "15.0", sortOrder: 12 },
	{ slug: "platter-tuna-s", nameAr: "طاسة تونة - صغير", nameEn: "Tuna Platter - Small", category: "platter", priceEGP: "45", costEGP: "21.0", sortOrder: 13 },
	{ slug: "platter-tuna-l", nameAr: "طاسة تونة - كبير", nameEn: "Tuna Platter - Large", category: "platter", priceEGP: "75", costEGP: "35.0", sortOrder: 14 },
	{ slug: "platter-salad-s", nameAr: "سلطة طحينة / خضراء - صغير", nameEn: "Tahini / Green Salad - Small", category: "platter", priceEGP: "12", costEGP: "4.0", sortOrder: 15 },
	{ slug: "platter-salad-l", nameAr: "سلطة طحينة / خضراء - كبير", nameEn: "Tahini / Green Salad - Large", category: "platter", priceEGP: "20", costEGP: "7.0", sortOrder: 16 },
	{ slug: "platter-mekhalel-s", nameAr: "مخلل بلدي - صغير", nameEn: "Baladi Pickles - Small", category: "platter", priceEGP: "8", costEGP: "2.5", sortOrder: 17 },
	{ slug: "platter-mekhalel-l", nameAr: "مخلل بلدي - كبير", nameEn: "Baladi Pickles - Large", category: "platter", priceEGP: "15", costEGP: "5.0", sortOrder: 18 },
	{ slug: "tea-small", nameAr: "شاي / نعناع / قرفة - صغير", nameEn: "Tea / Mint / Cinnamon - Small", category: "beverage", priceEGP: "10", costEGP: "2.0", sortOrder: 19 },
	{ slug: "tea-large", nameAr: "شاي / نعناع / قرفة - كبير", nameEn: "Tea / Mint / Cinnamon - Large", category: "beverage", priceEGP: "15", costEGP: "3.0", sortOrder: 20 },
	{ slug: "juice-small", nameAr: "عصير قصب أو ليمون - صغير", nameEn: "Sugarcane or Lemon Juice - Small", category: "beverage", priceEGP: "15", costEGP: "5.0", sortOrder: 21 },
	{ slug: "juice-large", nameAr: "عصير قصب أو ليمون - كبير", nameEn: "Sugarcane or Lemon Juice - Large", category: "beverage", priceEGP: "25", costEGP: "8.5", sortOrder: 22 },
]

const addons: SeedItem[] = [
	{ slug: "addon-egg", nameAr: "بيضة زيادة", nameEn: "Extra Egg", category: "addon", priceEGP: "10", costEGP: "3.5", sortOrder: 1 },
	{ slug: "addon-cheese", nameAr: "جبنة زيادة", nameEn: "Extra Cheese", category: "addon", priceEGP: "8", costEGP: "3.0", sortOrder: 2 },
	{ slug: "addon-green-salad", nameAr: "سلطة خضراء", nameEn: "Green Salad", category: "addon", priceEGP: "8", costEGP: "2.5", sortOrder: 3 },
	{ slug: "addon-tahini", nameAr: "طحينة", nameEn: "Tahini", category: "addon", priceEGP: "6", costEGP: "2.0", sortOrder: 4 },
	{ slug: "addon-pickles", nameAr: "مخلل", nameEn: "Pickles", category: "addon", priceEGP: "5", costEGP: "1.5", sortOrder: 5 },
	{ slug: "addon-bread", nameAr: "عيش زيادة", nameEn: "Extra Bread", category: "addon", priceEGP: "3", costEGP: "1.0", sortOrder: 6 },
	{ slug: "addon-shatta", nameAr: "شطة أو دقة", nameEn: "Chili or Dukkah", category: "addon", priceEGP: "2", costEGP: "0.5", sortOrder: 7 },
	{ slug: "addon-tea", nameAr: "شاي", nameEn: "Tea", category: "addon", priceEGP: "10", costEGP: "2.0", sortOrder: 8 },
	{ slug: "addon-yogurt", nameAr: "زبادي", nameEn: "Yogurt", category: "addon", priceEGP: "12", costEGP: "5.0", sortOrder: 9 },
]

const breakfastBoxes: SeedItem[] = [
	{ slug: "box-fard", nameAr: "بوكس الفرد", nameEn: "Solo Breakfast Box", category: "breakfast_box", priceEGP: "45", costEGP: "18.0", sortOrder: 1 },
	{ slug: "box-etnein", nameAr: "بوكس الاتنين", nameEn: "Couple Breakfast Box", category: "breakfast_box", priceEGP: "75", costEGP: "31.0", sortOrder: 2 },
	{ slug: "box-eila", nameAr: "بوكس العيلة", nameEn: "Family Breakfast Box", category: "breakfast_box", priceEGP: "120", costEGP: "50.0", sortOrder: 3 },
]

const mixFillingsBySlug: Record<string, string[]> = {
	"mix-foul-batates": ["foul-sada", "batates-mehamara"],
	"mix-foul-gebna": ["foul-sada", "gebna-beida"],
	"mix-betengan-foul": ["betengan-mikli", "foul-sada"],
	"mix-batates-gebna": ["batates-mehamara", "gebna-beida"],
	"mix-foul-beid": ["foul-sada", "beid-omelette"],
	"mix-babaghanoug-batates": ["babaghanoug", "batates-mehamara"],
	"mix-hummus-foul": ["hummus-tahina", "foul-sada"],
	"mix-beid-gebna": ["beid-omelette", "gebna-beida"],
	"mix-dynamite": ["foul-sada", "batates-mehamara", "gebna-adima"],
	"mix-tuna-gebna": ["tuna", "gebna-beida"],
	"mix-big": ["foul-sada", "beid-omelette", "batates-mehamara", "gebna-beida", "betengan-mikli"],
}

// أول فرع رئيسي — هيتضاف عليه أي عربات لاحقًا بنفس شكل الـ code القصير
// (spec section ٣: كل فرع له كود قصير يظهر في رقم الأوردر، مثلاً MAIN-٤٢).
const mainBranch = {
	code: "MAIN",
	name: "الحَبّوب - الفرع الرئيسي",
	type: "restaurant" as const,
}

async function seedBranches() {
	await db.insert(branches).values(mainBranch).onConflictDoNothing({ target: branches.code })
}

// Called by bootstrap.ts on every server boot (no-ops once data already
// exists, thanks to onConflictDoNothing) so a fresh production database
// gets branches + the full starter menu automatically.
export async function seedIfEmpty() {
	await seedBranches()

	const allItems = [...baseItems, ...mixes, ...platters, ...addons, ...breakfastBoxes]

	const inserted = await db
		.insert(menuItems)
		.values(allItems)
		.onConflictDoNothing({ target: menuItems.slug })
		.returning({ id: menuItems.id, slug: menuItems.slug })

	const idBySlug = new Map(inserted.map((row) => [row.slug, row.id]))

	if (idBySlug.size === 0) {
		return
	}

	const mixLinkRows = Object.entries(mixFillingsBySlug).flatMap(([mixSlug, fillingSlugs]) => {
		const mixId = idBySlug.get(mixSlug)
		if (!mixId) return []

		return fillingSlugs
			.map((fillingSlug) => idBySlug.get(fillingSlug))
			.filter((fillingId): fillingId is string => Boolean(fillingId))
			.map((fillingId) => ({ mixId, fillingId }))
	})

	if (mixLinkRows.length > 0) {
		await db.insert(mixItems).values(mixLinkRows).onConflictDoNothing()
	}
}

// Allows this file to still be run directly as a one-off script
// (`pnpm db:seed`) without re-running as a side effect whenever some other
// module imports `seedIfEmpty` (e.g. bootstrap.ts on server boot).
const isDirectRun = process.argv[1] && import.meta.url === `file://${process.argv[1]}`

if (isDirectRun) {
	console.log("Seeding El7bboB branches + menu (نسخة ١ — طعمية مستثناة بقرار المالك)...")
	seedIfEmpty()
		.then(() => {
			console.log("Seed finished.")
			process.exit(0)
		})
		.catch((error) => {
			console.error(error)
			process.exit(1)
		})
}
