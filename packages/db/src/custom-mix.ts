import { db } from "./client"
import { menuItems } from "./schema"

export const CUSTOM_MIX_MENU_SLUG = "mix-custom"
let ensured = false

/** Ensures the zero-priced container used by the customer mix builder exists. */
export async function ensureCustomMixMenuItem() {
	if (ensured) return
	await db.insert(menuItems).values({
		slug: CUSTOM_MIX_MENU_SLUG,
		nameAr: "ميكس حسب اختيارك",
		nameEn: "Build Your Own Mix",
		category: "mix",
		priceEGP: "0",
		costEGP: "0",
		isAvailable: true,
		sortOrder: 0,
		descriptionAr: "اختر نوع الخبز ومكونات الميكس بالطريقة التي تفضلها.",
		descriptionEn: "Choose your bread and build the mix exactly the way you like it.",
	}).onConflictDoUpdate({
		target: menuItems.slug,
		set: {
			nameAr: "ميكس حسب اختيارك",
			nameEn: "Build Your Own Mix",
			category: "mix",
			priceEGP: "0",
			costEGP: "0",
			isAvailable: true,
			sortOrder: 0,
			descriptionAr: "اختر نوع الخبز ومكونات الميكس بالطريقة التي تفضلها.",
			descriptionEn: "Choose your bread and build the mix exactly the way you like it.",
			updatedAt: new Date(),
		},
	})
	ensured = true
}
