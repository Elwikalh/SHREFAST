// Ordering channels. A channel is never asked for: it is implied by how the
// customer arrived — a scanned point-of-sale link, or the public site.
export type Channel = "in_store" | "cart_kiosk" | "online_pickup" | "online_delivery"

// A point of sale is either the restaurant itself or a smaller selling point.
export type PointOfSaleType = "restaurant" | "cart"

export const CHANNEL_LABELS: Record<Channel, string> = {
	in_store: "طلب من داخل المحل",
	cart_kiosk: "طلب من نقطة البيع",
	online_pickup: "استلام من المكان",
	online_delivery: "توصيل للبيت",
}

// The scanned link carries the point of sale, so the channel comes from what
// that point of sale is — the customer is never asked where they are.
export function channelForPointOfSale(type: PointOfSaleType): Channel {
	return type === "cart" ? "cart_kiosk" : "in_store"
}

// Anyone reaching the public site (Google, Facebook) is ordering to their home.
export const DELIVERY_CHANNEL: Channel = "online_delivery"

// Single source of truth for the delivery fee: the checkout screen and the
// server that writes the order must never disagree, otherwise the customer
// confirms one number and sees another on the confirmation screen.
export const DELIVERY_FEE_EGP = 15

// Permanent ordering link of one point of sale — this exact path is what its
// printed QR code contains, so its shape must stay stable.
export function pointOfSalePath(code: string): string {
	return `/order/${code}`
}
