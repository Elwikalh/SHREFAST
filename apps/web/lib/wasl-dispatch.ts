// Super X (Wasl) delivery dispatch.
// Isolated by design: fire-and-forget — any failure here is logged only
// and never affects the customer order creation flow.
import { createWaslOrder } from "@/lib/wasl-store"

export function dispatchWaslDelivery(input: Parameters<typeof createWaslOrder>[0]): void {
	void createWaslOrder(input).catch((error) => console.error("[wasl-dispatch] failed", error))
}
