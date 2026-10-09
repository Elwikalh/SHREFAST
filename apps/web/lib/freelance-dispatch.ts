import { sql } from "drizzle-orm";
import { db } from "@el7bboB/db";
import type { Principal } from "./wasl-auth";
import { ensureTables, ensureCourierTables, type WaslCourierAccountRow, type WaslOrderRow } from "./wasl-store";
import { ensureBridgeTables } from "./el7bbob-bridge";
import { courierCanWork } from "./wasl-validation";
import { verifiedOwnedRoot, ensureOwnedBranches, ownedMerchantSQL } from "./owned-restaurant-policy";
import { dispatchRows as rows, DispatchError, lockCourierAssignment, type DispatchExecutor } from "./courier-assignment-lock";
export { DispatchError } from "./courier-assignment-lock";
let initialized: Promise<void> | undefined;
export function ensureFreelanceDispatch() {
  return initialized ??= (async () => {
    await ensureTables(); await ensureCourierTables(); await ensureBridgeTables();
    await db.execute(sql`CREATE TABLE IF NOT EXISTS sharefast_freelance_merchants(
      merchant_ref text PRIMARY KEY REFERENCES wasl_entities(ref),enabled boolean NOT NULL,
      revision integer NOT NULL,updated_by text NOT NULL REFERENCES wasl_accounts(id),
      updated_at timestamptz NOT NULL DEFAULT now())`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS sharefast_freelance_availability(
      account_id text PRIMARY KEY REFERENCES wasl_accounts(id),courier_ref text UNIQUE NOT NULL REFERENCES wasl_courier_accounts(ref),
      available boolean NOT NULL,revision integer NOT NULL,updated_at timestamptz NOT NULL DEFAULT now())`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS sharefast_freelance_claims(
      order_ref text PRIMARY KEY REFERENCES wasl_orders(ref),account_id text NOT NULL REFERENCES wasl_accounts(id),
      courier_ref text NOT NULL REFERENCES wasl_courier_accounts(ref),claimed_at timestamptz NOT NULL DEFAULT now())`);
    await db.execute(sql`CREATE TABLE IF NOT EXISTS sharefast_freelance_audit(
      id bigserial PRIMARY KEY,actor_id text NOT NULL,kind text NOT NULL,target_ref text NOT NULL,
      previous jsonb,current jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now())`);
  })().catch(error => { initialized = undefined; throw error; });
}
export function parseDispatchSetting(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new DispatchError("invalid_fields",400);
  const v=value as Record<string,unknown>;
  if(Object.keys(v).sort().join(",")!=="enabled,expectedRevision" || typeof v.enabled!=="boolean" ||
    !Number.isSafeInteger(v.expectedRevision) || (v.expectedRevision as number)<0)
    throw new DispatchError("invalid_fields",400);
  return {enabled:v.enabled,expectedRevision:v.expectedRevision as number};
}
export function parseDispatchClaim(value: unknown) {
  if(!value || typeof value!=="object" || Array.isArray(value)) throw new DispatchError("invalid_fields",400);
  const v=value as Record<string,unknown>;
  if(Object.keys(v).join(",")!=="orderRef" || typeof v.orderRef!=="string" || !/^SX-\d+$/.test(v.orderRef))
    throw new DispatchError("invalid_fields",400);
  return v.orderRef;
}
async function merchantIdentity(tx: DispatchExecutor,user: Principal) {
  if(user.role!=="merchant") throw new DispatchError("forbidden",403);
  const found=rows(await tx.execute(sql`SELECT a.id FROM wasl_accounts a JOIN wasl_entities e ON e.ref=a.entity_ref
    WHERE a.id=${user.id} AND a.entity_ref=${user.ref} AND a.role='merchant' AND a.status='active' AND e.type='merchant' FOR SHARE OF a`));
  if(found.length!==1) throw new DispatchError("forbidden",403);
}
async function courierIdentity(tx: DispatchExecutor,user: Principal,lock=false) {
  if(user.role!=="courier") throw new DispatchError("forbidden",403);
  const match=rows<WaslCourierAccountRow>(await tx.execute(sql`SELECT c.* FROM wasl_courier_accounts c JOIN wasl_accounts a ON a.courier_ref=c.ref
    WHERE a.id=${user.id} AND a.courier_ref=${user.ref} AND a.role='courier' AND a.status='active'
    ${lock?sql`FOR UPDATE OF c`:sql``}`));
  if(match.length!==1 || !match[0]) throw new DispatchError("forbidden",403);
  return match[0];
}
async function eligible(tx: DispatchExecutor,account: WaslCourierAccountRow) {
  const saved=rows<{value_json:string}>(await tx.execute(sql`SELECT value_json FROM wasl_platform_settings WHERE key='platform' FOR SHARE`))[0];
  let enabled=false;
  if(saved) {
    try {
      const v=JSON.parse(saved.value_json);
      if(!v || typeof v!=="object" || Array.isArray(v) ||
        ("courier" in v && (!v.courier || typeof v.courier!=="object" || Array.isArray(v.courier) || typeof v.courier.enabled!=="boolean"))) throw Error();
      enabled=v.courier?.enabled ?? false;
    } catch {throw new DispatchError("courier_policy_unavailable",503);}
  }
  if(!account.zone.trim() || !account.governorate.trim() || !courierCanWork(account,{enabled}))
    throw new DispatchError("courier_not_eligible",403);
}
const unassigned=sql`o.status='searching' AND o.courier_ref IS NULL AND (o.courier IS NULL OR btrim(o.courier)='')
  AND (o.company_ref IS NULL OR btrim(o.company_ref)='')`;
// An explicit merchant opt-in OR a signed, persisted restaurant-bridge order.
// There is no implicit consent based on a merchant's name/phone or demo UI preferences.
const consent=sql`EXISTS(SELECT 1 FROM wasl_accounts ma WHERE ma.entity_ref=o.merchant_ref AND ma.role='merchant' AND ma.status='active')
  AND (EXISTS(SELECT 1 FROM sharefast_freelance_merchants fm WHERE fm.merchant_ref=o.merchant_ref AND fm.enabled=true)
    OR EXISTS(SELECT 1 FROM sharefast_el7bbob_links bl WHERE bl.order_ref=o.ref AND bl.cancel_requested=false))`;
async function availability(tx: DispatchExecutor,user: Principal,lock=false) {
  return rows<{available:boolean;revision:number}>(await tx.execute(sql`SELECT available,revision FROM sharefast_freelance_availability
    WHERE account_id=${user.id} AND courier_ref=${user.ref} ${lock?sql`FOR UPDATE`:sql``}`))[0];
}
export async function readDispatchSetting(user: Principal) {
  await ensureFreelanceDispatch();
  if(user.role==="merchant") {
    await merchantIdentity(db,user);
    const row=rows<{enabled:boolean;revision:number}>(await db.execute(sql`SELECT enabled,revision FROM sharefast_freelance_merchants WHERE merchant_ref=${user.ref}`))[0];
    return row || {enabled:false,revision:0};
  }
  await courierIdentity(db,user);
  const row=await availability(db,user);
  return {enabled:row?.available ?? false,revision:row?.revision ?? 0};
}
export async function saveDispatchSetting(user: Principal,value: unknown) {
  const command=parseDispatchSetting(value); await ensureFreelanceDispatch();
  return db.transaction(async tx=>{
    let previous:{enabled:boolean;revision:number}|undefined;
    if(user.role==="merchant") {
      await merchantIdentity(tx,user);
      // Serialize first-insert and revocation against offer claims on the same merchant.
      await tx.execute(sql`SELECT ref FROM wasl_entities WHERE ref=${user.ref} FOR UPDATE`);
      previous=rows<{enabled:boolean;revision:number}>(await tx.execute(sql`SELECT enabled,revision FROM sharefast_freelance_merchants WHERE merchant_ref=${user.ref} FOR UPDATE`))[0];
    } else {
      const account=await courierIdentity(tx,user,true);
      if(command.enabled) await eligible(tx,account); // disabling never requires a paid subscription
      const old=await availability(tx,user,true); previous=old?{enabled:old.available,revision:old.revision}:undefined;
    }
    if((previous?.revision ?? 0)!==command.expectedRevision) throw new DispatchError("settings_changed_reload");
    const next={enabled:command.enabled,revision:command.expectedRevision+1};
    const result=user.role==="merchant" ? await tx.execute(sql`INSERT INTO sharefast_freelance_merchants(merchant_ref,enabled,revision,updated_by)
      VALUES(${user.ref},${next.enabled},${next.revision},${user.id}) ON CONFLICT(merchant_ref) DO UPDATE SET
      enabled=excluded.enabled,revision=excluded.revision,updated_by=excluded.updated_by,updated_at=now() RETURNING merchant_ref`)
      : await tx.execute(sql`INSERT INTO sharefast_freelance_availability(account_id,courier_ref,available,revision)
      VALUES(${user.id},${user.ref},${next.enabled},${next.revision}) ON CONFLICT(account_id) DO UPDATE SET
      available=excluded.available,revision=excluded.revision,updated_at=now() RETURNING account_id`);
    if(!rows(result).length) throw new DispatchError("settings_changed_reload");
    await tx.execute(sql`INSERT INTO sharefast_freelance_audit(actor_id,kind,target_ref,previous,current)
      VALUES(${user.id},${user.role},${user.ref},${previous?JSON.stringify(previous):null}::jsonb,${JSON.stringify(next)}::jsonb)`);
    return next;
  });
}
export async function freelanceOffers(user: Principal) {
  await ensureFreelanceDispatch();const account=await courierIdentity(db,user);await eligible(db,account);
  const current=await availability(db,user);
  if(!current?.available) return {available:false,busy:false,offers:[]};
  const busy=rows(await db.execute(sql`SELECT o.ref FROM wasl_orders o
    WHERE o.status NOT IN ('delivered','canceled','refused','no_answer')
    AND (o.courier_ref=${user.ref} OR EXISTS(SELECT 1 FROM wasl_couriers f WHERE f.ref=o.courier_ref AND f.account_id=${user.id})
      OR (o.courier_ref IS NULL AND o.courier=${account.name})) LIMIT 1`));
  if(busy.length) return {available:true,busy:true,offers:[]};
  const root=await verifiedOwnedRoot();if(root) await ensureOwnedBranches();
  const rank=root?sql`CASE WHEN ${ownedMerchantSQL(root,sql`o.merchant_ref`)} THEN 1 ELSE 0 END`:sql`0`;
  const offers=rows<{ref:string;merchant_name:string;merchant_zone:string;dest_zone:string;fee:number;ready_minutes:number|null;created_at:Date|string;priority:number;ready_at:Date|string|null}>(
    await db.execute(sql`SELECT o.ref,o.merchant_name,o.merchant_zone,o.dest_zone,o.fee,o.ready_minutes,o.created_at,
      ${rank} AS priority,pe.ready_at FROM wasl_orders o JOIN wasl_entities e ON e.ref=o.merchant_ref
      LEFT JOIN sharefast_preparation_events pe ON pe.order_ref=o.ref WHERE ${unassigned} AND (${consent})
      AND e.zone=${account.zone} AND e.governorate=${account.governorate} AND o.merchant_zone=e.zone
      ORDER BY priority DESC,o.created_at ASC,o.id ASC LIMIT 30`));
  return {available:true,busy:false,offers:offers.map(o=>({ref:o.ref,merchantName:o.merchant_name,pickupZone:o.merchant_zone,
    destinationZone:o.dest_zone,feeEGP:o.fee,readyMinutes:o.ready_minutes,createdAt:new Date(o.created_at).toISOString(),
    restaurantPriority:o.priority===1,readyAt:o.ready_at?new Date(o.ready_at).toISOString():null}))};
}
export async function claimFreelanceOffer(user: Principal,value: unknown) {
  const orderRef=parseDispatchClaim(value);await ensureFreelanceDispatch();
  return db.transaction(async tx=>{
    const account=await courierIdentity(tx,user,true);
    // The account lock is shared with existing fleet/manual assignment routes.
    // Lock the order only after the courier to maintain a single lock order.
    const order=rows<WaslOrderRow>(await tx.execute(sql`SELECT * FROM wasl_orders WHERE ref=${orderRef} FOR UPDATE`))[0];
    const previous=rows<{account_id:string;courier_ref:string}>(await tx.execute(sql`SELECT account_id,courier_ref FROM sharefast_freelance_claims WHERE order_ref=${orderRef}`))[0];
    if(previous?.account_id===user.id && previous.courier_ref===user.ref && order?.courier_ref===user.ref)
      return {replayed:true,ref:order.ref,status:order.status};
    if(!order || previous) throw new DispatchError("offer_unavailable");
    await eligible(tx,account);
    const online=await availability(tx,user,true);if(!online?.available) throw new DispatchError("courier_offline");
    // Merchant row serializes opt-out/revocation; no lock on customer data is disclosed.
    await tx.execute(sql`SELECT ref FROM wasl_entities WHERE ref=${order.merchant_ref ?? ""} FOR SHARE`);
    const match=rows(await tx.execute(sql`SELECT o.ref FROM wasl_orders o JOIN wasl_entities e ON e.ref=o.merchant_ref
      WHERE o.ref=${orderRef} AND ${unassigned} AND (${consent})
      AND e.zone=${account.zone} AND e.governorate=${account.governorate} AND o.merchant_zone=e.zone`));
    if(!match.length) throw new DispatchError("offer_unavailable");
    await lockCourierAssignment(tx,user.ref,orderRef);
    const changed=rows(await tx.execute(sql`UPDATE wasl_orders o SET status='accepted',courier_ref=${user.ref},courier=${account.name}
      WHERE o.ref=${orderRef} AND ${unassigned} RETURNING o.ref`));
    if(changed.length!==1) throw new DispatchError("offer_unavailable");
    await tx.execute(sql`INSERT INTO sharefast_freelance_claims(order_ref,account_id,courier_ref) VALUES(${orderRef},${user.id},${user.ref})`);
    await tx.execute(sql`INSERT INTO sharefast_freelance_audit(actor_id,kind,target_ref,previous,current)
      VALUES(${user.id},'claim',${orderRef},${JSON.stringify({status:"searching"})}::jsonb,
      ${JSON.stringify({status:"accepted",courierRef:user.ref})}::jsonb)`);
    return {replayed:false,ref:orderRef,status:"accepted"};
  });
}