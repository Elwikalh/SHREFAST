import { sql } from "drizzle-orm";
import { db } from "@el7bboB/db";
import { BridgeError, ensureBridgeTables } from "./el7bbob-bridge";
const rows = <T>(r: unknown): T[] => Array.isArray(r) ? r as T[] : (r as { rows?: T[] }).rows || [];
export async function markBridgeOrderReady(externalOrderId: string, merchantRef: string) {
  await ensureBridgeTables();
  return db.transaction(async tx => {
    const link = rows<{ order_ref: string | null; cancel_requested: boolean }>(await tx.execute(sql`SELECT order_ref,cancel_requested FROM sharefast_el7bbob_links WHERE external_order_id=${externalOrderId}::uuid FOR UPDATE`))[0];
    if (!link?.order_ref) throw new BridgeError("not_found", 404);
    const order = rows<{ status: string }>(await tx.execute(sql`SELECT status FROM wasl_orders WHERE ref=${link.order_ref} AND merchant_ref=${merchantRef} FOR UPDATE`))[0];
    if (!order) throw new BridgeError("binding_conflict", 409);
    if (link.cancel_requested || ["canceled","delivered","refused","no_answer"].includes(order.status)) throw new BridgeError("preparation_update_not_allowed", 409);
    const event = rows<{ id: string; ready_at: string }>(await tx.execute(sql`INSERT INTO sharefast_preparation_events(external_order_id,order_ref) VALUES (${externalOrderId}::uuid,${link.order_ref}) ON CONFLICT(external_order_id) DO UPDATE SET order_ref=sharefast_preparation_events.order_ref RETURNING id::text,ready_at::text`))[0]!;
    return { externalOrderId, ref: link.order_ref, eventId: event.id, readyAt: event.ready_at };
  });
}
