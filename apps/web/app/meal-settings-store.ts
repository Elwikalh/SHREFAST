import "server-only"
import { inArray } from "drizzle-orm"
import { db, siteSettings } from "@el7bboB/db"
import { parseMealSelection, type MealSelections } from "./meal-settings"
export const MEAL_SETTINGS_ROWS = { tray: "breakfast_tray_choices", box: "breakfast_box_choices" } as const
export async function loadMealSelections(): Promise<MealSelections> {
	const rows = await db.select().from(siteSettings).where(inArray(siteSettings.id, Object.values(MEAL_SETTINGS_ROWS)))
	function read(id: string) {
		const row = rows.find((item) => item.id === id)
		return parseMealSelection(row ? row.heroImageDataUrl : undefined)
	}
	return { tray: read(MEAL_SETTINGS_ROWS.tray), box: read(MEAL_SETTINGS_ROWS.box) }
}
