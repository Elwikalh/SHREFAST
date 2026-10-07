"use server"

import { eq } from "drizzle-orm"
import { db, orders, payments } from "@el7bboB/db"

// Polled every few seconds from the confirmation screen so the customer sees
// their order move from "queued" to "ready" — and their InstaPay transfer get
// confirmed — live, without refreshing.
export async function getOrderProgress(orderId: string): Promise<{ status: string; paymentConfirmed: boolean } | null> {
	const [order] = await db.select({ status: orders.status }).from(orders).where(eq(orders.id, orderId))
	if (!order) return null
	const [payment] = await db.select({ status: payments.status }).from(payments).where(eq(payments.orderId, orderId))
	return { status: order.status, paymentConfirmed: payment?.status === "confirmed" }
}
