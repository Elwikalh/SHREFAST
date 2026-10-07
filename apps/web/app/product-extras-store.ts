import "server-only"
import { inArray } from "drizzle-orm"
import { db, siteSettings } from "@el7bboB/db"
import { parseProductExtras, productExtrasKey, type ProductExtrasConfig } from "./product-extras"
export async function loadProductExtrasConfigs(ids: string[]): Promise<Record<string, ProductExtrasConfig>> {
	if (!ids.length) return {}
	const rows = await db.select().from(siteSettings).where(inArray(siteSettings.id, ids.map(productExtrasKey)))
	const result: Record<string, ProductExtrasConfig> = {}
	for (const id of ids) { const row = rows.find((value) => value.id === productExtrasKey(id)); if (row) result[id] = parseProductExtras(row.heroImageDataUrl) ?? { enabled: false, optionIds: [], availableIds: [] } }
	return result
}
