export const MENU_ITEM_REFERENCED_MESSAGE = "مينفعش تحذف الصنف ده لأنه مرتبط بطلبات أو ميكسات أو وصفات — استخدم زرار الإخفاء بدل الحذف"

// Drizzle can wrap PostgreSQL errors in .cause. Never expose error messages,
// SQL, connection strings, or parameters to the browser or application logs.
export function databaseErrorCode(error: unknown): string | null {
	let current: unknown = error
	const seen = new Set<object>()
	for (let depth = 0; depth < 6; depth++) {
		if (current === null || typeof current !== "object" || seen.has(current)) break
		seen.add(current)
		const candidate = current as { code?: unknown; cause?: unknown }
		if (typeof candidate.code === "string" && /^[A-Z0-9]{5}$/.test(candidate.code)) return candidate.code
		current = candidate.cause
	}
	return null
}
