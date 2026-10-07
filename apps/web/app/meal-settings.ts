import type { MealKind } from "./meal-config"
export type MealSelections = Record<MealKind, string[] | null>
export const MAX_MEAL_CHOICES = 1000
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// An absent row preserves the existing automatic choices. A saved empty list
// means no food choices; malformed persisted data fails closed, never broadens.
export function parseMealSelection(text: string | null | undefined): string[] | null {
	if (text === undefined) return null
	try {
		const value: unknown = JSON.parse(text ?? "null")
		if (!value || typeof value !== "object" || Array.isArray(value)) return []
		const record = value as Record<string, unknown>, ids = record.allowedIds
		if (record.version !== 1 || !Array.isArray(ids) || ids.length > MAX_MEAL_CHOICES || ids.some((id: unknown) => typeof id !== "string" || !uuid.test(id))) return []
		return Array.from(new Set(ids as string[]))
	} catch { return [] }
}
