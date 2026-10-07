import "server-only"
import { asc, like } from "drizzle-orm"
import { db, menuItems, siteSettings } from "@el7bboB/db"
import { parseSandwichBread, type SandwichBreadConfig } from "./sandwich-bread"
export async function loadSandwichBreadCatalog() {
	const [products, rows] = await Promise.all([db.select().from(menuItems).orderBy(asc(menuItems.sortOrder)), db.select().from(siteSettings).where(like(siteSettings.id, "sandwich_bread:%"))])
	const configs: Record<string, SandwichBreadConfig> = {}
	for (const row of rows) { if (!row.id.startsWith("sandwich_bread:")) continue; const config = parseSandwichBread(row.heroImageDataUrl); if (config) configs[row.id.slice("sandwich_bread:".length)] = config }
	return { products, configs }
}
