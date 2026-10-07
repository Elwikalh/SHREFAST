import { and, eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { branches, db, menuItems, orderItems, orders, payments } from "@el7bboB/db"
import { requireBranchAccess } from "@/lib/staff-session"
import { InvoiceView } from "./invoice-view"

export const dynamic = "force-dynamic"

export default async function OrderInvoicePage({ params }: { params: Promise<{ branchCode: string; orderId: string }> }) {
	const { branchCode, orderId } = await params
	await requireBranchAccess(branchCode)

	if (!/^[0-9a-f-]{36}$/i.test(orderId)) notFound()

	const [branch] = await db.select().from(branches).where(eq(branches.code, branchCode))
	if (!branch) notFound()

	const [order] = await db.select().from(orders).where(and(eq(orders.id, orderId), eq(orders.branchId, branch.id)))
	if (!order) notFound()

	const [[payment], itemRows] = await Promise.all([
		db.select().from(payments).where(eq(payments.orderId, order.id)).limit(1),
		db
			.select({
				nameAr: menuItems.nameAr,
				quantity: orderItems.quantity,
				unitPriceEGP: orderItems.unitPriceEGP,
				addonsJson: orderItems.addonsJson,
				note: orderItems.note,
				lineTotalEGP: orderItems.lineTotalEGP,
			})
			.from(orderItems)
			.innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
			.where(eq(orderItems.orderId, order.id)),
	])

	return (
		<InvoiceView
			branchName={branch.name}
			displayNumber={order.displayNumber}
			createdAt={order.createdAt.toISOString()}
			status={order.status}
			channel={order.channel}
			customerName={order.customerName}
			customerPhone={order.customerPhone}
			deliveryAddress={order.deliveryAddress}
			customerNote={order.customerNote}
			subtotalEGP={Number(order.subtotalEGP)}
			discountEGP={Number(order.discountEGP)}
			discountLabel={order.discountLabel}
			deliveryFeeEGP={Number(order.deliveryFeeEGP)}
			taxEGP={Number(order.taxEGP)}
			totalEGP={Number(order.totalEGP)}
			paymentMethod={payment?.method ?? null}
			paymentStatus={payment?.status ?? null}
			instapayReference={payment?.instapayReference ?? null}
			items={itemRows.map((item) => ({
				nameAr: item.nameAr,
				quantity: item.quantity,
				unitPriceEGP: Number(item.unitPriceEGP),
				addons: (item.addonsJson ?? []).map((addon) => ({ nameAr: addon.nameAr, priceEGP: addon.priceEGP })),
				note: item.note,
				lineTotalEGP: Number(item.lineTotalEGP),
			}))}
		/>
	)
}
