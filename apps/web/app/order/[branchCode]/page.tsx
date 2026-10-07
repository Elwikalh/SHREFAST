import { redirect } from "next/navigation"

// Public ordering is delivery-only. Old branch/QR links no longer create an
// in-store order; they land on the public delivery menu instead.
export default function LegacyPointOfSaleOrderPage() {
	redirect("/#menu")
}
