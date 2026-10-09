import { sql, type SQL } from "drizzle-orm";
export type DispatchExecutor = { execute: (query: SQL) => Promise<unknown> };
export const dispatchRows = <T>(value: unknown): T[] =>
  Array.isArray(value) ? value as T[] : (value as { rows?: T[] }).rows || [];
export class DispatchError extends Error {
  constructor(public code: string, public status = 409) { super(code); }
}
/** All new acceptance paths lock the same person, including linked fleet aliases. */
export async function lockCourierAssignment(tx: DispatchExecutor, reference: string, exceptOrder: string) {
  const accounts = dispatchRows<{ ref: string; name: string }>(await tx.execute(sql`
    SELECT c.ref,c.name FROM wasl_courier_accounts c WHERE c.ref=${reference}
      OR EXISTS(SELECT 1 FROM wasl_accounts a JOIN wasl_couriers f ON f.account_id=a.id
        WHERE a.courier_ref=c.ref AND f.ref=${reference})
    ORDER BY c.ref FOR UPDATE`));
  if (accounts.length > 1) throw new DispatchError("courier_binding_conflict");
  const canonical = accounts[0]?.ref;
  const name = accounts[0]?.name;
  // A fleet member without a platform account cannot claim independent jobs,
  // but still needs a per-person lock for concurrent fleet assignments.
  if (!canonical) await tx.execute(sql`SELECT ref FROM wasl_couriers WHERE ref=${reference} FOR UPDATE`);
  const busy = dispatchRows(await tx.execute(sql`
    SELECT o.ref FROM wasl_orders o WHERE o.ref<>${exceptOrder}
      AND o.status NOT IN ('delivered','canceled','refused','no_answer')
      AND (o.courier_ref=${reference}
        ${canonical ? sql`OR o.courier_ref=${canonical} OR EXISTS(
          SELECT 1 FROM wasl_couriers f JOIN wasl_accounts a ON a.id=f.account_id
          WHERE f.ref=o.courier_ref AND a.courier_ref=${canonical})` : sql``}
        ${name ? sql`OR (o.courier_ref IS NULL AND o.courier=${name})` : sql``})
    LIMIT 1`));
  if (busy.length) throw new DispatchError("courier_busy");
}