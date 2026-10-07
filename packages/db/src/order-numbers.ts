import { and, eq } from "drizzle-orm"
import { allocateFromBlock, formatDisplayNumber } from "@el7bboB/core"
import { db } from "./client"
import { orderNumberBlocks } from "./schema"

const DEFAULT_BLOCK_SIZE = 100

/**
 * The business day follows Africa/Cairo, not UTC. Using the UTC date used
 * to reset each branch's daily counter at 03:00 Cairo time, so late-night
 * orders shared a number series with the previous evening — several open
 * orders could show the exact same number on the same screen.
 */
function todayAsDate(): Date {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Africa/Cairo",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(new Date())
	const pick = (type: string): number => Number(parts.find((part) => part.type === type)?.value)
	return new Date(Date.UTC(pick("year"), pick("month") - 1, pick("day")))
}

/**
 * Atomically allocates the next order display number for a branch inside a
 * `SELECT ... FOR UPDATE` transaction, so concurrent orders (e.g. the kiosk
 * and a cart on the same branch) never receive the same number.
 *
 * If no block exists yet for the branch today, one is created starting at 1.
 * Exhausted blocks are extended automatically (see allocateFromBlock), so a
 * busy day can never reject new orders.
 */
export async function allocateOrderNumber(branchId: string, branchCode: string): Promise<string> {
	const businessDate = todayAsDate()

	return db.transaction(async (tx) => {
		const [existing] = await tx
			.select()
			.from(orderNumberBlocks)
			.where(and(eq(orderNumberBlocks.branchId, branchId), eq(orderNumberBlocks.businessDate, businessDate)))
			.for("update")

		if (!existing) {
			const [created] = await tx
				.insert(orderNumberBlocks)
				.values({
					branchId,
					rangeStart: 1,
					rangeEnd: DEFAULT_BLOCK_SIZE,
					nextValue: 2,
					businessDate,
				})
				.returning()

			if (!created) throw new Error("Failed to create order number block")

			return formatDisplayNumber(branchCode, businessDate, 1)
		}

		const allocation = allocateFromBlock(
			{
				branchCode,
				rangeStart: existing.rangeStart,
				rangeEnd: existing.rangeEnd,
				nextValue: existing.nextValue,
			},
			businessDate,
		)

		await tx
			.update(orderNumberBlocks)
			.set({
				rangeStart: allocation.block.rangeStart,
				rangeEnd: allocation.block.rangeEnd,
				nextValue: allocation.block.nextValue,
			})
			.where(eq(orderNumberBlocks.id, existing.id))

		return allocation.displayNumber
	})
}