// Subscription entitlement and waiting-queue rank only. No payment, wage, delivery-fee or assignment writes.
import { sql, type SQL } from "drizzle-orm";
import { db } from "@el7bboB/db";
import { ensureTables, getWaslPlatformSettings } from "./wasl-store";
import { UUID } from "./sharefast-protocol";
import type { OrderPrincipal } from "./wasl-order-scope";
const rows = <T>(r: unknown): T[] =>
  Array.isArray(r) ? (r as T[]) : (r as { rows?: T[] }).rows || [];
export class OwnedPolicyError extends Error {
  constructor(
    public code: string,
    public status = 409,
  ) {
    super(code);
  }
}
export function ownedPolicyEnabled() {
  return process.env.SHAREFAST_EL7BBOB_POLICY_ENABLED === "true";
}
export type RootBinding = { ref: string; accountId: string };
export async function verifiedOwnedRoot(): Promise<RootBinding | null> {
  if (!ownedPolicyEnabled()) return null;
  const ref = process.env.SHAREFAST_EL7BBOB_MERCHANT_REF || "",
    accountId = process.env.SHAREFAST_EL7BBOB_ACCOUNT_ID || "";
  if (!/^SX-[0-9]+$/.test(ref) || !UUID.test(accountId))
    throw new OwnedPolicyError("owned_root_unconfigured", 503);
  await ensureTables();
  const schema = rows<{ accountTable: string | null }>(
    await db.execute(
      sql`SELECT to_regclass('public.wasl_accounts') AS "accountTable"`,
    ),
  )[0];
  if (!schema?.accountTable)
    throw new OwnedPolicyError("owned_root_unverified", 503);
  const match = rows(
    await db.execute(
      sql`SELECT a.id FROM wasl_accounts a JOIN wasl_entities e ON e.ref=a.entity_ref WHERE a.id=${accountId} AND a.entity_ref=${ref} AND a.role='merchant' AND a.status='active' AND e.type='merchant'`,
    ),
  );
  if (match.length !== 1)
    throw new OwnedPolicyError("owned_root_unverified", 503);
  return { ref, accountId };
}
let ensured: Promise<void> | null = null;
export function ensureOwnedBranches() {
  if (!ensured)
    ensured = (async () => {
      await db.execute(
        sql`CREATE TABLE IF NOT EXISTS sharefast_owned_restaurant_branches(merchant_ref text PRIMARY KEY REFERENCES wasl_entities(ref),account_id text UNIQUE NOT NULL REFERENCES wasl_accounts(id),root_ref text NOT NULL REFERENCES wasl_entities(ref),branch_code text NOT NULL,enabled boolean NOT NULL,revision integer NOT NULL,verified_by text NOT NULL,verified_at timestamptz NOT NULL DEFAULT now(),UNIQUE(root_ref,branch_code))`,
      );
      await db.execute(
        sql`CREATE TABLE IF NOT EXISTS sharefast_owned_restaurant_audit(id bigserial PRIMARY KEY,merchant_ref text NOT NULL,root_ref text NOT NULL,actor_id text NOT NULL,revision integer NOT NULL,previous jsonb,current jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now())`,
      );
    })().catch((e) => {
      ensured = null;
      throw e;
    });
  return ensured;
}
export type OwnedBranch = {
  merchant_ref: string;
  account_id: string;
  root_ref: string;
  branch_code: string;
  enabled: boolean;
  revision: number;
  verified_by: string;
  verified_at: Date | string;
};
export async function listOwnedBranches(root: RootBinding) {
  await ensureOwnedBranches();
  return rows<OwnedBranch>(
    await db.execute(
      sql`SELECT * FROM sharefast_owned_restaurant_branches WHERE root_ref=${root.ref} ORDER BY branch_code`,
    ),
  );
}
export type BranchCommand = {
  merchantRef: string;
  accountId: string;
  branchCode: string;
  enabled: boolean;
  expectedRevision: number;
  confirmOwnership: true;
};
export function parseBranchCommand(value: unknown): BranchCommand {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new OwnedPolicyError("invalid_fields", 400);
  const v = value as Record<string, unknown>;
  if (
    Object.keys(v).sort().join(",") !==
      "accountId,branchCode,confirmOwnership,enabled,expectedRevision,merchantRef" ||
    typeof v.merchantRef !== "string" ||
    !/^SX-[0-9]+$/.test(v.merchantRef) ||
    typeof v.accountId !== "string" ||
    !UUID.test(v.accountId) ||
    typeof v.branchCode !== "string" ||
    !v.branchCode.trim() ||
    v.branchCode.length > 80 ||
    typeof v.enabled !== "boolean" ||
    !Number.isSafeInteger(v.expectedRevision) ||
    (v.expectedRevision as number) < 0 ||
    v.confirmOwnership !== true
  )
    throw new OwnedPolicyError("invalid_fields", 400);
  return { ...v, branchCode: (v.branchCode as string).trim() } as BranchCommand;
}
export async function saveOwnedBranch(value: unknown, actorId: string) {
  const v = parseBranchCommand(value);
  if (typeof actorId !== "string" || !actorId || actorId.length > 200)
    throw new OwnedPolicyError("invalid_actor", 400);
  const root = await verifiedOwnedRoot();
  if (!root) throw new OwnedPolicyError("owned_policy_disabled", 503);
  if (
    v.merchantRef === root.ref ||
    v.accountId === root.accountId ||
    v.branchCode === "MAIN"
  )
    throw new OwnedPolicyError("root_binding_immutable");
  await ensureOwnedBranches();
  return db.transaction(async (tx) => {
    const target = rows(
      await tx.execute(
        sql`SELECT a.id FROM wasl_accounts a JOIN wasl_entities e ON e.ref=a.entity_ref WHERE a.id=${v.accountId} AND a.entity_ref=${v.merchantRef} AND a.role='merchant' AND (${!v.enabled} OR a.status='active') AND e.type='merchant'`,
      ),
    );
    if (target.length !== 1)
      throw new OwnedPolicyError("branch_account_unverified");
    const previous = rows<OwnedBranch>(
      await tx.execute(
        sql`SELECT * FROM sharefast_owned_restaurant_branches WHERE merchant_ref=${v.merchantRef} FOR UPDATE`,
      ),
    )[0];
    if (
      previous &&
      (previous.root_ref !== root.ref ||
        previous.account_id !== v.accountId ||
        previous.branch_code !== v.branchCode)
    )
      throw new OwnedPolicyError("branch_binding_immutable");
    if ((previous?.revision ?? 0) !== v.expectedRevision)
      throw new OwnedPolicyError("settings_changed_reload");
    const saved = rows<OwnedBranch>(
      await tx.execute(
        previous
          ? sql`UPDATE sharefast_owned_restaurant_branches SET enabled=${v.enabled},revision=revision+1,verified_by=${actorId},verified_at=now() WHERE merchant_ref=${v.merchantRef} AND root_ref=${root.ref} AND account_id=${v.accountId} AND branch_code=${v.branchCode} AND revision=${v.expectedRevision} RETURNING *`
          : sql`INSERT INTO sharefast_owned_restaurant_branches(merchant_ref,account_id,root_ref,branch_code,enabled,revision,verified_by)VALUES(${v.merchantRef},${v.accountId},${root.ref},${v.branchCode},${v.enabled},1,${actorId}) ON CONFLICT(merchant_ref) DO NOTHING RETURNING *`,
      ),
    )[0];
    if (!saved) throw new OwnedPolicyError("settings_changed_reload");
    await tx.execute(
      sql`INSERT INTO sharefast_owned_restaurant_audit(merchant_ref,root_ref,actor_id,revision,previous,current)VALUES(${v.merchantRef},${root.ref},${actorId},${saved.revision},${previous ? JSON.stringify(previous) : null}::jsonb,${JSON.stringify(saved)}::jsonb)`,
    );
    return saved;
  });
}
export function ownedMerchantSQL(root: RootBinding, merchantRef: SQL) {
  return sql`EXISTS(SELECT 1 FROM wasl_accounts owned_a WHERE owned_a.entity_ref=${merchantRef} AND owned_a.role='merchant' AND owned_a.status='active' AND ((owned_a.id=${root.accountId} AND owned_a.entity_ref=${root.ref}) OR EXISTS(SELECT 1 FROM sharefast_owned_restaurant_branches owned_b WHERE owned_b.account_id=owned_a.id AND owned_b.merchant_ref=owned_a.entity_ref AND owned_b.root_ref=${root.ref} AND owned_b.enabled=true)))`;
}
export async function effectiveSubscription(user: OrderPrincipal) {
  const settings = await getWaslPlatformSettings();
  const global =
    user.role === "admin"
      ? { enabled: false, monthlyFee: 0 }
      : settings[user.role];
  if (
    !global ||
    typeof global.enabled !== "boolean" ||
    !Number.isSafeInteger(global.monthlyFee) ||
    global.monthlyFee < 0 ||
    global.monthlyFee > 100000
  )
    throw new OwnedPolicyError("subscription_settings_invalid", 503);
  let exempt = false,
    rootRef: string | null = null;
  if (user.role === "merchant" && ownedPolicyEnabled()) {
    const root = (await verifiedOwnedRoot())!;
    await ensureOwnedBranches();
    const owns = rows(
      await db.execute(
        sql`SELECT a.id FROM wasl_accounts a WHERE a.id=${user.id} AND a.entity_ref=${user.ref} AND a.role='merchant' AND a.status='active' AND ${ownedMerchantSQL(root, sql`a.entity_ref`)}`,
      ),
    );
    exempt = owns.length === 1;
    if (exempt) rootRef = root.ref;
  }
  return {
    subscriptionRequired: global.enabled && !exempt,
    configuredMonthlyFeeEGP: global.monthlyFee,
    effectiveMonthlyFeeEGP: exempt ? 0 : global.enabled ? global.monthlyFee : 0,
    subscriptionExempt: exempt,
    rootRef,
    deliveryFeesWaived: false,
    courierWagesWaived: false,
    paidStatus: "not_evaluated" as const,
  };
}
