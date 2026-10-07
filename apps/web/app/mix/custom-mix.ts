import { eq } from "drizzle-orm"
import { db, menuItems } from "@el7bboB/db"
import {
	CUSTOM_MIX_NAME_AR,
	CUSTOM_MIX_NAME_EN,
	CUSTOM_MIX_SLUG,
} from "./mix-config"

// The "ميكس على مزاجك" order is a normal menu item with a zero base price whose
// real price is the sum of the components the customer picks. Reusing the
// add-on mechanism means the server keeps re-pricing every component from the
// database, and stock deduction and the kitchen ticket work with no new
// plumbing at all.

/**
 * Makes sure the container item exists, without any manual step in the admin
 * panel: it is created on the first page load after deploy and then simply
 * found on every later load. Its price stays 0 because the components carry
 * the price.
 */
export async function ensureCustomMixItem(): Promise<void> {
	const [existing] = await db
		.select({ id: menuItems.id })
		.from(menuItems)
		.where(eq(menuItems.slug, CUSTOM_MIX_SLUG))

	if (existing) return

	await db
		.insert(menuItems)
		.values({
			slug: CUSTOM_MIX_SLUG,
			nameAr: CUSTOM_MIX_NAME_AR,
			nameEn: CUSTOM_MIX_NAME_EN,
			category: "mix",
			priceEGP: "0",
			costEGP: "0",
			isAvailable: true,
			sortOrder: 0,
			descriptionAr: "اختار المكونات اللي انت عايزها واحنا نلفها لك زي ما طلبت.",
			descriptionEn: "Pick your own fillings and we roll it exactly your way.",
		})
		.onConflictDoNothing()
}
