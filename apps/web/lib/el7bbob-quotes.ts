import { randomUUID } from "node:crypto";
import { sql, type SQL } from "drizzle-orm";
import { db } from "@el7bboB/db";
import { ensureTables } from "./wasl-store";
import {
  loadDeliveryPricing,
  previewDeliveryQuote,
} from "./delivery-pricing-settings";
import type { DeliveryEnvelope } from "./sharefast-protocol";
const rows = <T>(r: unknown): T[] =>
  Array.isArray(r) ? (r as T[]) : (r as { rows?: T[] }).rows || [];
export class QuoteError extends Error {
  constructor(
    public code: string,
    public status: number,
  ) {
    super(code);
  }
}
export type QuoteSnapshot = {
  requestKind?: "standalone";
  id: string;
  branchCode: string;
  destZone: string;
  feeEGP: number;
  pricingVersion: number;
  issuedAt: string;
  expiresAt: string;
};
let ensured: Promise<void> | null = null;
export function ensureQuoteTable() {
  if (!ensured)
    ensured = (async () => {
      await ensureTables();
      await db.execute(
        sql`CREATE TABLE IF NOT EXISTS sharefast_el7bbob_quotes(id uuid PRIMARY KEY,merchant_ref text NOT NULL REFERENCES wasl_entities(ref),branch_code text NOT NULL,requested_zone text NOT NULL,pricing_zone text NOT NULL,from_zone text NOT NULL,fee integer NOT NULL,pricing_version integer NOT NULL,issued_at timestamptz NOT NULL DEFAULT now(),expires_at timestamptz NOT NULL DEFAULT now()+interval '10 minutes',external_order_id uuid UNIQUE)`,
      );
      await db.execute(sql`ALTER TABLE sharefast_el7bbob_quotes ADD COLUMN IF NOT EXISTS request_kind text NOT NULL DEFAULT 'food'`);
    })().catch((e) => {
      ensured = null;
      throw e;
    });
  return ensured;
}
type Stored = {
  request_kind: string;
  id: string;
  branch_code: string;
  requested_zone: string;
  fee: number;
  pricing_version: number;
  issued_at: Date | string;
  expires_at: Date | string;
  external_order_id: string | null;
};
const snapshot = (q: Stored): QuoteSnapshot => ({
  ...(q.request_kind === "standalone" ? {requestKind:"standalone" as const}:{}),
  id: q.id,
  branchCode: q.branch_code,
  destZone: q.requested_zone,
  feeEGP: q.fee,
  pricingVersion: q.pricing_version,
  issuedAt: new Date(q.issued_at).toISOString(),
  expiresAt: new Date(q.expires_at).toISOString(),
});
function mapping(raw: string | undefined) {
  if (!raw) return {};
  try {
    const v = JSON.parse(raw);
    if (
      !v ||
      typeof v !== "object" ||
      Array.isArray(v) ||
      Object.values(v).some((x) => typeof x !== "string" || !x.trim())
    )
      throw Error();
    return v as Record<string, string>;
  } catch {
    throw new QuoteError("zone_mapping_unconfigured", 503);
  }
}
export async function issueBridgeQuote(
  branchCode: string,
  destZone: string,
  merchantRef: string,
  requestKind: "food" | "standalone" = "food",
) {
  await ensureQuoteTable();
  const merchant = rows<{ zone: string }>(
    await db.execute(
      sql`SELECT zone FROM wasl_entities WHERE ref=${merchantRef} AND type='merchant'`,
    ),
  )[0];
  if (!merchant) throw new QuoteError("merchant_binding_required", 409);
  const branches = mapping(process.env.SHAREFAST_EL7BBOB_BRANCH_ZONES_JSON);
  const fromZone = Object.hasOwn(branches, branchCode)
    ? branches[branchCode]
    : branchCode === "MAIN"
      ? merchant.zone
      : undefined;
  if (!fromZone) throw new QuoteError("branch_mapping_required", 409);
  // Orders currently inherit the root merchant pickup zone. Cross-city branches need physical branch binding first.
  if (fromZone !== merchant.zone)
    throw new QuoteError("branch_binding_requires_review", 409);
  const aliases = mapping(process.env.SHAREFAST_EL7BBOB_DEST_ZONES_JSON);
  const pricingZone = Object.hasOwn(aliases, destZone)
    ? aliases[destZone]!
    : destZone;
  const current = await loadDeliveryPricing();
  let preview;
  try {
    preview = previewDeliveryQuote(current.settings, fromZone, pricingZone);
  } catch (e) {
    if (e instanceof Error && e.message === "unsupported_zone")
      throw new QuoteError("unsupported_zone", 400);
    throw e;
  }
  const saved = rows<Stored>(
    await db.execute(
      sql`INSERT INTO sharefast_el7bbob_quotes(id,merchant_ref,branch_code,requested_zone,pricing_zone,from_zone,fee,pricing_version,request_kind)VALUES(${randomUUID()}::uuid,${merchantRef},${branchCode},${destZone},${pricingZone},${fromZone},${preview.feeEGP},${current.version},${requestKind})RETURNING *`,
    ),
  )[0]!;
  return snapshot(saved);
}
export async function readBridgeQuote(id: string, merchantRef: string) {
  await ensureQuoteTable();
  const q = rows<Stored>(
    await db.execute(
      sql`SELECT * FROM sharefast_el7bbob_quotes WHERE id=${id}::uuid AND merchant_ref=${merchantRef}`,
    ),
  )[0];
  if (!q) throw new QuoteError("quote_not_found", 404);
  if (q.external_order_id) throw new QuoteError("quote_already_used", 409);
  if (Date.parse(new Date(q.expires_at).toISOString()) <= Date.now())
    throw new QuoteError("quote_expired", 410);
  return snapshot(q);
}
export async function claimBridgeQuote(
  tx: { execute(q: SQL): Promise<unknown> },
  envelope: DeliveryEnvelope,
  merchantRef: string,
) {
  const accepted = envelope.quote;
  if (!accepted) return;
  const q = rows<Stored>(
    await tx.execute(
      sql`SELECT * FROM sharefast_el7bbob_quotes WHERE id=${accepted.id}::uuid AND merchant_ref=${merchantRef} FOR UPDATE`,
    ),
  )[0];
  if (!q) throw new QuoteError("quote_not_found", 409);
  if (
    q.request_kind !== (envelope.requestKind || "food") ||
    q.branch_code !== envelope.branchCode ||
    q.requested_zone !== envelope.destZone ||
    q.fee !== envelope.feeEGP
  )
    throw new QuoteError("quote_mismatch", 409);
  if (q.external_order_id && q.external_order_id !== envelope.externalOrderId)
    throw new QuoteError("quote_already_used", 409);
  // Trusted restaurant stamps acceptance when saving locally. A delayed outbox must preserve that price.
  const at = Date.parse(accepted.acceptedAt);
  if (
    !Number.isFinite(at) ||
    at < Date.parse(new Date(q.issued_at).toISOString()) ||
    at >= Date.parse(new Date(q.expires_at).toISOString())
  )
    throw new QuoteError("quote_acceptance_out_of_window", 409);
  await tx.execute(
    sql`UPDATE sharefast_el7bbob_quotes SET external_order_id=${envelope.externalOrderId}::uuid WHERE id=${accepted.id}::uuid`,
  );
}
