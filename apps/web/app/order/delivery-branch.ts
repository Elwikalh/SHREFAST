import { and, asc, eq } from "drizzle-orm"
import { db, branches } from "@el7bboB/db"

export type DeliveryBranch = {
	id: string
	code: string
	name: string
	// Used by the storefront footer; null until an address is filled in from the
	// points-of-sale admin screen.
	address: string | null
}

// A customer arriving from Google, Facebook or a shared link has no point of
// sale in the URL, and asking them which kitchen should cook is meaningless
// to them. The restaurant that serves delivery is resolved here instead: the
// oldest active restaurant, falling back to any active point of sale so the
// site still takes orders on a fresh install.
export async function loadDeliveryBranch(): Promise<DeliveryBranch | null> {
	const [restaurant] = await db
		.select()
		.from(branches)
		.where(and(eq(branches.isActive, true), eq(branches.type, "restaurant")))
		.orderBy(asc(branches.createdAt))

	if (restaurant) {
		return {
			id: restaurant.id,
			code: restaurant.code,
			name: restaurant.name,
			address: restaurant.address ?? null,
		}
	}

	const [fallback] = await db
		.select()
		.from(branches)
		.where(eq(branches.isActive, true))
		.orderBy(asc(branches.createdAt))

	return fallback
		? {
				id: fallback.id,
				code: fallback.code,
				name: fallback.name,
				address: fallback.address ?? null,
			}
		: null
}
