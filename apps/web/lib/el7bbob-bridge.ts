import { sql } from "drizzle-orm";
import { db } from "@el7bboB/db";
import { ensureTables, ensureClientInviteTables } from "./wasl-store";
import {
  payloadHash,
  type DeliveryEnvelope,
  type DeliverySnapshot,
} from "./sharefast-protocol";
const rows = <T>(result: unknown): T[] =>
  Array.isArray(result)
    ? (result as T[])
    : (result as { rows?: T[] }).rows || [];
let ready: Promise<void> | null = null;
export function ensureBridgeTables(): Promise<void> {
  if (!ready)
    ready = (async () => {
      await ensureTables();
      await ensureClientInviteTables();
      await db.execute(sql`CREATE TABLE IF NOT EXISTS sharefast_el7bbob_links (
      external_order_id UUID PRIMARY KEY, payload_hash TEXT NOT NULL, cancel_requested BOOLEAN NOT NULL DEFAULT false,
      order_ref TEXT UNIQUE REFERENCES wasl_orders(ref), created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )`);
      await db.execute(
        sql`ALTER TABLE sharefast_el7bbob_links ADD COLUMN IF NOT EXISTS cancel_requested BOOLEAN NOT NULL DEFAULT false`,
      );
      await db.execute(sql`ALTER TABLE sharefast_el7bbob_links ADD COLUMN IF NOT EXISTS preparation JSONB`);
      await db.execute(sql`CREATE TABLE IF NOT EXISTS sharefast_preparation_events (
        id BIGSERIAL PRIMARY KEY, external_order_id UUID UNIQUE NOT NULL REFERENCES sharefast_el7bbob_links(external_order_id),
        order_ref TEXT UNIQUE NOT NULL REFERENCES wasl_orders(ref), ready_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )`);
    })().catch((error) => {
      ready = null;
      throw error;
    });
  return ready;
}
export class BridgeError extends Error {
  code: string;
  status: number;
  constructor(code: string, status: number) {
    super(code);
    this.code = code;
    this.status = status;
  }
}
export function bridgeConfig() {
  const secret = process.env.SHAREFAST_EL7BBOB_SECRET || "";
  const merchantRef = process.env.SHAREFAST_EL7BBOB_MERCHANT_REF || "";
  if (
    process.env.SHAREFAST_EL7BBOB_ENABLED !== "true" ||
    secret.length < 32 ||
    !merchantRef
  )
    throw new BridgeError("bridge_disabled_or_unconfigured", 503);
  return {
    secret,
    merchantRef,
    companyRef: process.env.SHAREFAST_EL7BBOB_COMPANY_REF || "",
  };
}
type Stored = { ref: string; status: string; courier: string | null };
function snapshot(externalOrderId: string, order: Stored): DeliverySnapshot {
  return {
    externalOrderId,
    ref: order.ref,
    status: order.status,
    courier: order.courier,
  };
}
export async function createBridgeOrder(
  envelope: DeliveryEnvelope,
  merchantRef: string,
  companyRef = "",
) {
  await ensureBridgeTables();
  const hash = payloadHash(envelope);
  return db.transaction(async (tx) => {
    // Unique reservation + row lock serializes concurrent retries. A failed insert rolls back the reservation too.
    await tx.execute(sql`INSERT INTO sharefast_el7bbob_links(external_order_id,payload_hash)
      VALUES (${envelope.externalOrderId}::uuid,${hash}) ON CONFLICT (external_order_id) DO NOTHING`);
    const link = rows<{
      payload_hash: string;
      order_ref: string | null;
      cancel_requested: boolean;
    }>(
      await tx.execute(sql`SELECT payload_hash,order_ref,cancel_requested
      FROM sharefast_el7bbob_links WHERE external_order_id=${envelope.externalOrderId}::uuid FOR UPDATE`),
    )[0];
    if (link?.cancel_requested)
      throw new BridgeError("order_canceled_before_dispatch", 409);
    if (!link || link.payload_hash !== hash)
      throw new BridgeError("idempotency_conflict", 409);
    if (link.order_ref) {
      const existing = rows<Stored>(
        await tx.execute(
          sql`SELECT ref,status,courier FROM wasl_orders WHERE ref=${link.order_ref} AND merchant_ref=${merchantRef}`,
        ),
      )[0];
      if (!existing) throw new BridgeError("binding_conflict", 409);
      return {
        created: false,
        order: snapshot(envelope.externalOrderId, existing),
      };
    }
    const merchant = rows<{ name: string; zone: string }>(
      await tx.execute(
        sql`SELECT name,zone FROM wasl_entities WHERE ref=${merchantRef} AND type='merchant'`,
      ),
    )[0];
    if (!merchant) throw new BridgeError("merchant_binding_required", 409);
    if (
      companyRef &&
      !rows(
        await tx.execute(sql`SELECT 1 FROM wasl_client_invites ci JOIN wasl_entities e ON e.phone=ci.phone
      WHERE e.ref=${merchantRef} AND ci.company_ref=${companyRef} AND ci.status='accepted'`),
      ).length
    )
      throw new BridgeError("company_binding_requires_review", 409);
    // The trusted restaurant's charged delivery fee is a contract amount, not a new quote.
    // No changes to the generic merchant API, pricing guard, sessions or payment confirmations.
    const note = `[الحبوب ${envelope.displayNumber} / ${envelope.branchCode}] ${envelope.note}`;
    const order = rows<Stored>(
      await tx.execute(sql`INSERT INTO wasl_orders
      (ref,merchant_name,merchant_zone,from_addr,dest_zone,to_addr,fee,fee_min,fee_max,pay,kind,customer_phone,customer_name,note,order_total,source,status,merchant_ref,company_ref)
      VALUES ('SX-' || nextval('wasl_order_seq'),${merchant.name},${merchant.zone},${envelope.fromAddr},${envelope.destZone},${envelope.toAddr},
      ${envelope.feeEGP},${envelope.feeEGP},${envelope.feeEGP},${envelope.paymentMethod === "cash" ? "كاش" : "إنستاباي"},'أوردر طعام',
      ${envelope.customerPhone},${envelope.customerName},${note},${envelope.totalEGP},'el7bbob','searching',${merchantRef},${companyRef || null}) RETURNING ref,status,courier`),
    )[0];
    if (!order) throw new Error("insert_failed");
    await tx.execute(
      sql`UPDATE sharefast_el7bbob_links SET order_ref=${order.ref} WHERE external_order_id=${envelope.externalOrderId}::uuid`,
    );
    if (envelope.preparation) await tx.execute(sql`UPDATE sharefast_el7bbob_links SET preparation=${JSON.stringify(envelope.preparation)}::jsonb WHERE external_order_id=${envelope.externalOrderId}::uuid`);
    return { created: true, order: snapshot(envelope.externalOrderId, order) };
  });
}
export async function readBridgeOrder(
  externalOrderId: string,
  merchantRef: string,
) {
  await ensureBridgeTables();
  const order = rows<Stored>(
    await db.execute(sql`SELECT o.ref,o.status,o.courier FROM sharefast_el7bbob_links l
    JOIN wasl_orders o ON o.ref=l.order_ref WHERE l.external_order_id=${externalOrderId}::uuid AND o.merchant_ref=${merchantRef}`),
  )[0];
  if (!order) throw new BridgeError("not_found", 404);
  return snapshot(externalOrderId, order);
}
export async function cancelBridgeOrder(
  externalOrderId: string,
  merchantRef: string,
): Promise<DeliverySnapshot> {
  await ensureBridgeTables();
  return db.transaction(async (tx) => {
    // Reserve a cancellation tombstone even if a timed-out create is not committed yet.
    // CREATE and CANCEL lock the same unique row, so a late POST cannot resurrect it.
    await tx.execute(sql`INSERT INTO sharefast_el7bbob_links(external_order_id,payload_hash,cancel_requested)
      VALUES (${externalOrderId}::uuid,'',true) ON CONFLICT (external_order_id) DO NOTHING`);
    const link = rows<{ order_ref: string | null }>(
      await tx.execute(sql`SELECT order_ref FROM sharefast_el7bbob_links
      WHERE external_order_id=${externalOrderId}::uuid FOR UPDATE`),
    )[0];
    if (!link) throw new Error("reservation_failed");
    if (!link.order_ref) {
      await tx.execute(
        sql`UPDATE sharefast_el7bbob_links SET cancel_requested=true WHERE external_order_id=${externalOrderId}::uuid`,
      );
      return { externalOrderId, ref: null, status: "canceled", courier: null };
    }
    const order = rows<Stored>(
      await tx.execute(sql`SELECT ref,status,courier FROM wasl_orders
      WHERE ref=${link.order_ref} AND merchant_ref=${merchantRef} FOR UPDATE`),
    )[0];
    if (!order) throw new BridgeError("binding_conflict", 409);
    if (
      order.status !== "canceled" &&
      !["searching", "accepted", "pickup"].includes(order.status)
    )
      throw new BridgeError("cancellation_requires_review", 409);
    await tx.execute(
      sql`UPDATE wasl_orders SET status='canceled' WHERE ref=${order.ref}`,
    );
    await tx.execute(
      sql`UPDATE sharefast_el7bbob_links SET cancel_requested=true WHERE external_order_id=${externalOrderId}::uuid`,
    );
    return snapshot(externalOrderId, { ...order, status: "canceled" });
  });
}
