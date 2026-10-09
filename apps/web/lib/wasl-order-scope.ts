// Shared SQL ownership predicate only. Never changes visibility based on display names/phones supplied by a client.
import { sql } from "drizzle-orm";
export type OrderPrincipal = {
  id: string;
  role: "admin" | "merchant" | "company" | "courier";
  ref: string;
};
export function orderVisibilitySQL(user: OrderPrincipal) {
  return user.role === "admin"
    ? sql`TRUE`
    : user.role === "merchant"
      ? sql`o.merchant_ref = ${user.ref}`
      : user.role === "courier"
        ? sql`o.courier_ref = ${user.ref} OR EXISTS (SELECT 1 FROM wasl_couriers c WHERE c.ref = o.courier_ref AND c.account_id = ${user.id} AND c.status = 'active')`
        : sql`o.company_ref = ${user.ref} OR EXISTS (
  SELECT 1 FROM wasl_entities e JOIN wasl_client_invites ci ON ci.phone = e.phone AND ci.status = 'accepted'
  WHERE e.ref = o.merchant_ref AND ci.company_ref = ${user.ref})`;
}
