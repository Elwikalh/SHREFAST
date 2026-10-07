export type OrderNumberBlock = {
	branchCode: string
	rangeStart: number
	rangeEnd: number
	nextValue: number
}

export type AllocationResult = {
	value: number
	displayNumber: string
	block: OrderNumberBlock
}

// When a day's block runs out we silently extend it by this many numbers
// instead of rejecting orders — a busy day must never block checkout.
const BLOCK_EXTENSION = 100

/**
 * Pure allocation logic for a pre-reserved per-branch number block. The
 * caller (packages/db src/order-numbers.ts) wraps this in a locked
 * transaction (SELECT ... FOR UPDATE) so concurrent orders never collide.
 * Because the logic is pure, the same function also powers the offline
 * queue: a cart/branch can keep allocating from an already-fetched block
 * locally while offline, then reconcile once it reconnects.
 *
 * If the block is exhausted (nextValue > rangeEnd) the range is extended
 * forward by BLOCK_EXTENSION numbers and the caller persists the new
 * rangeEnd — previously this threw and customers could not order at all
 * for the rest of the day.
 */
export function allocateFromBlock(block: OrderNumberBlock, businessDate: Date): AllocationResult {
	let { rangeStart, rangeEnd } = block
	const { nextValue } = block

	if (nextValue > rangeEnd) {
		rangeStart = rangeEnd + 1
		rangeEnd = rangeEnd + BLOCK_EXTENSION
	}

	return {
		value: nextValue,
		displayNumber: formatDisplayNumber(block.branchCode, businessDate, nextValue),
		block: { branchCode: block.branchCode, rangeStart, rangeEnd, nextValue: nextValue + 1 },
	}
}

/**
 * Display number format: BRANCH-YYMMDD-NNNN (e.g. MAIN-251005-0007).
 * The date is the branch's business day in Africa/Cairo, passed in as a
 * UTC-midnight Date by the caller, so getUTC* getters return the intended
 * calendar day. Numbers are unique per branch per business day and never
 * repeat within the same day — older orders keep their legacy "BRANCH-N"
 * numbers untouched; every screen prints the stored string as-is.
 */
export function formatDisplayNumber(branchCode: string, businessDate: Date, value: number): string {
	const year = String(businessDate.getUTCFullYear() % 100).padStart(2, "0")
	const month = String(businessDate.getUTCMonth() + 1).padStart(2, "0")
	const day = String(businessDate.getUTCDate()).padStart(2, "0")
	return `${branchCode}-${year}${month}${day}-${String(value).padStart(4, "0")}`
}