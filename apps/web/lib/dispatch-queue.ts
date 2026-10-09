// Read-only auxiliary waiting queue. Original orders list, assignments and accepted journeys remain untouched.
import { sql } from "drizzle-orm";
import { db } from "@el7bboB/db";
import {
  ensureTables,
  ensureClientInviteTables,
  ensureCourierTables,
} from "./wasl-store";
import { orderVisibilitySQL, type OrderPrincipal } from "./wasl-order-scope";
import {
  verifiedOwnedRoot,
  ensureOwnedBranches,
  ownedMerchantSQL,
  OwnedPolicyError,
} from "./owned-restaurant-policy";
const rows = <T>(r: unknown): T[] =>
  Array.isArray(r) ? (r as T[]) : (r as { rows?: T[] }).rows || [];
export async function waitingDispatchQueue(user: OrderPrincipal) {
  if (!["admin", "merchant", "company"].includes(user.role))
    throw new OwnedPolicyError("forbidden", 403);
  await ensureTables();
  await ensureClientInviteTables();
  await ensureCourierTables();
  const root = await verifiedOwnedRoot();
  if (root) await ensureOwnedBranches();
  const rank = root
    ? sql`CASE WHEN ${ownedMerchantSQL(root, sql`o.merchant_ref`)} THEN 1 ELSE 0 END`
    : sql`0`;
  const data = rows<{
    ref: string;
    merchant_name: string;
    merchant_zone: string;
    dest_zone: string;
    fee: number;
    created_at: Date | string;
    dispatch_priority: number;
  }>(
    await db.execute(
      sql`SELECT o.ref,o.merchant_name,o.merchant_zone,o.dest_zone,o.fee,o.created_at,${rank} AS dispatch_priority FROM wasl_orders o WHERE (${orderVisibilitySQL(user)}) AND o.status='searching' AND o.courier_ref IS NULL AND (o.courier IS NULL OR btrim(o.courier)='') ORDER BY dispatch_priority DESC,o.created_at ASC,o.id ASC LIMIT 50`,
    ),
  );
  return {
    priorityEnabled: !!root,
    orders: data.map((r) => ({
      ref: r.ref,
      merchantName: r.merchant_name,
      pickupZone: r.merchant_zone,
      destZone: r.dest_zone,
      feeEGP: r.fee,
      createdAt: new Date(r.created_at).toISOString(),
      restaurantPriority: r.dispatch_priority === 1,
    })),
  };
}
