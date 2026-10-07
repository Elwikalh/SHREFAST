import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { db, orders, branches, orderItems, menuItems, payments, siteSettings } from "@el7bboB/db"
import { ConfirmationView } from "./confirmation-view"

// Reads a specific order's live status on every request; must not be
// prerendered at build time.
export const dynamic = "force-dynamic"

export default async function OrderConfirmationPage({
	params,
}: {
	params: Promise<{ orderId: string }>
}) {
	const { orderId } = await params

	const [order] = await db.select().from(orders).where(eq(orders.id, orderId))
	if (!order) notFound()

	const [branch] = await db.select().from(branches).where(eq(branches.id, order.branchId))

	// The payment row decides what the customer is told to do next: paying a
	// cashier, paying the delivery rider, or waiting for a transfer to be
	// confirmed are three different instructions.
	const [payment] = await db.select().from(payments).where(eq(payments.orderId, orderId))
	const paymentMethod = payment?.method === "instapay" ? "instapay" : "cash"

	// Repeat the transfer account here so a customer who left the checkout
	// screen before transferring still has the details in front of them.
	const [settings] =
		paymentMethod === "instapay"
			? await db.select().from(siteSettings).where(eq(siteSettings.id, "default"))
			: []

	const rawItems = await db
		.select({
			quantity: orderItems.quantity,
			lineTotalEGP: orderItems.lineTotalEGP,
			addonsJson: orderItems.addonsJson,
			nameAr: menuItems.nameAr,
		})
		.from(orderItems)
		.innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
		.where(eq(orderItems.orderId, orderId))

	const items = rawItems.map((item) => ({
		nameAr: item.nameAr,
		quantity: item.quantity,
		lineTotalEGP: Number(item.lineTotalEGP),
		addons: (item.addonsJson ?? []).map((addon) => ({ nameAr: addon.nameAr, priceEGP: addon.priceEGP })),
	}))

	return (
		<ConfirmationView
			orderId={order.id}
			branchName={branch?.name ?? ""}
			displayNumber={order.displayNumber}
			totalEGP={Number(order.totalEGP)}
			deliveryFeeEGP={Number(order.deliveryFeeEGP)}
			initialStatus={order.status}
			items={items}
			createdAt={order.createdAt.toISOString()}
			channel={order.channel}
			paymentMethod={paymentMethod}
			paymentConfirmed={payment?.status === "confirmed"}
			deliveryAddress={order.deliveryAddress ?? null}
			customerPhone={order.customerPhone ?? null}
			instapay={
				settings
					? {
							address: settings.instapayAddress ?? null,
							walletNumber: settings.instapayWalletNumber ?? null,
							accountName: settings.instapayAccountName ?? null,
						}
					: null
			}
		/>
	)
}
