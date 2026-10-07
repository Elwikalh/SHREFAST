import { and, asc, eq, inArray } from "drizzle-orm"
import {
	db,
	menuItems,
	orderChannelEnum,
	orderItems,
	orders,
	orderStatusEnum,
	payments,
} from "@el7bboB/db"

type OrderStatus = (typeof orderStatusEnum.enumValues)[number]
type OrderChannel = (typeof orderChannelEnum.enumValues)[number]

export type StaffOrder = {
	id: string
	displayNumber: string
	status: string
	channel: string
	totalEGP: number
	customerName: string | null
	customerPhone: string | null
	deliveryAddress: string | null
	customerNote: string | null
	createdAt: string
	paymentMethod: string | null
	paymentStatus: string | null
	items: Array<{
		menuItemId?: string
		menuItemSlug?: string
		addonDetails?: Array<{ menuItemId: string; nameAr: string }>
		nameAr: string
		quantity: number
		addons: string[]
		note: string | null
	}>
}

export async function loadStaffOrders({
	branchId,
	statuses,
	channels,
}: {
	branchId: string
	statuses: OrderStatus[]
	channels?: OrderChannel[]
}): Promise<StaffOrder[]> {
	const conditions = [eq(orders.branchId, branchId), inArray(orders.status, statuses)]
	if (channels?.length) conditions.push(inArray(orders.channel, channels))

	const orderRows = await db
		.select()
		.from(orders)
		.where(and(...conditions))
		.orderBy(asc(orders.createdAt))

	const orderIds = orderRows.map((order) => order.id)
	if (orderIds.length === 0) return []

	const [itemRows, paymentRows] = await Promise.all([
		db
			.select({
				orderId: orderItems.orderId,
				quantity: orderItems.quantity,
				menuItemId: orderItems.menuItemId,
				menuItemSlug: menuItems.slug,
				nameAr: menuItems.nameAr,
				note: orderItems.note,
				addonsJson: orderItems.addonsJson,
			})
			.from(orderItems)
			.innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
			.where(inArray(orderItems.orderId, orderIds)),
		db.select().from(payments).where(inArray(payments.orderId, orderIds)),
	])

	return orderRows.map((order) => {
		const payment = paymentRows.find((row) => row.orderId === order.id)
		return {
			id: order.id,
			displayNumber: order.displayNumber,
			status: order.status,
			channel: order.channel,
			totalEGP: Number(order.totalEGP),
			customerName: order.customerName,
			customerPhone: order.customerPhone,
			deliveryAddress: order.deliveryAddress,
			customerNote: order.customerNote,
			createdAt: order.createdAt.toISOString(),
			paymentMethod: payment?.method ?? null,
			paymentStatus: payment?.status ?? null,
			items: itemRows
				.filter((item) => item.orderId === order.id)
				.map((item) => ({
					nameAr: item.nameAr,
					menuItemId: item.menuItemId,
					menuItemSlug: item.menuItemSlug,
					addonDetails: (item.addonsJson ?? []).map((addon) => ({ menuItemId: addon.menuItemId, nameAr: addon.nameAr })),
					quantity: item.quantity,
					note: item.note,
					addons: (item.addonsJson ?? []).map((addon) => addon.nameAr),
				})),
		}
	})
}
