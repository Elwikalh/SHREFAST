export type Money = number // EGP, stored to the nearest half-pound

export type OrderChannel = "in_store" | "cart_kiosk" | "online_pickup" | "online_delivery"

export type PaymentMethod = "cash" | "instapay"

export type PaymentStatus = "pending" | "awaiting_confirmation" | "confirmed" | "failed" | "refunded"

export type OrderStatus =
	| "pending_payment"
	| "queued"
	| "in_progress"
	| "ready"
	| "completed"
	| "cancelled"

export type MenuItemInput = {
	priceEGP: Money
	costEGP: Money
}

export type MarginResult = {
	marginPercent: number
	isBelowThreshold: boolean
}
