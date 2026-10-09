import { PGlite } from "@electric-sql/pglite";
import { PgDialect } from "drizzle-orm/pg-core";
import { sql, type SQL } from "drizzle-orm";
import { beforeAll, beforeEach, afterAll, expect, it, vi } from "vitest";
import type { Principal } from "../lib/wasl-auth";
const f=vi.hoisted(()=>({execute:vi.fn(),transaction:vi.fn(),failClaim:false}));
vi.mock("@el7bboB/db",()=>({db:f}));
import {ensureFreelanceDispatch,readDispatchSetting,saveDispatchSetting,freelanceOffers,claimFreelanceOffer,parseDispatchClaim,parseDispatchSetting} from "../lib/freelance-dispatch";
import {lockCourierAssignment} from "../lib/courier-assignment-lock";
import {orderVisibilitySQL} from "../lib/wasl-order-scope";
const database=new PGlite(),dialect=new PgDialect();
const principal=(id:string,ref:string,role:Principal["role"]):Principal=>({id,ref,role,name:"test",phone:"01000000001",zone:"untrusted",governorate:"untrusted",address:"",status:"active",phoneVerified:false});
const merchant=principal("11111111-1111-4111-8111-111111111111","SX-2","merchant"),courier=principal("courier-id","CRX-1","courier"),second=principal("courier-2","CRX-2","courier");
async function run(q:SQL){const compiled=dialect.sqlToQuery(q);return(await database.query(compiled.sql,compiled.params)).rows;}
beforeAll(async()=>{
  f.execute.mockImplementation(run);
  f.transaction.mockImplementation((cb:(tx:{execute:(q:SQL)=>Promise<unknown>})=>Promise<unknown>)=>database.transaction(tx=>cb({
    execute:async(q)=>{const compiled=dialect.sqlToQuery(q);if(f.failClaim && compiled.sql.includes("INSERT INTO sharefast_freelance_claims")){f.failClaim=false;throw Error("injected write failure");}return(await tx.query(compiled.sql,compiled.params)).rows;}
  })));
  // Minimal auth fixture; all order/courier/bridge DDL comes from the real store.
  const {ensureTables,ensureCourierTables}=await import("../lib/wasl-store");await ensureTables();await ensureCourierTables();
  await database.exec(`CREATE TABLE wasl_accounts(id text PRIMARY KEY,role text NOT NULL,entity_ref text,courier_ref text,name text,status text NOT NULL DEFAULT 'active');
    INSERT INTO wasl_entities(ref,type,name,phone,governorate,zone,address)VALUES
    ('SX-2','merchant','الحبوب','01000000001','الدقهلية','المنصورة','PRIVATE PICKUP'),
    ('SX-3','merchant','مطعم آخر','01000000002','الدقهلية','المنصورة','PRIVATE OTHER'),
    ('SX-4','merchant','مكان آخر','01000000003','القاهرة','المعادي','PRIVATE CAIRO');
    INSERT INTO wasl_courier_accounts(ref,name,phone,password_hash,governorate,zone,status)VALUES
    ('CRX-1','مندوب أول','01000000004','unused','الدقهلية','المنصورة','active'),
    ('CRX-2','مندوب ثان','01000000005','unused','الدقهلية','المنصورة','active');
    INSERT INTO wasl_accounts(id,role,entity_ref,courier_ref,name)VALUES
    ('${merchant.id}','merchant','SX-2',NULL,'الحبوب'),('other-id','merchant','SX-3',NULL,'آخر'),
    ('cairo-id','merchant','SX-4',NULL,'آخر'),('courier-id','courier',NULL,'CRX-1','مندوب'),
    ('courier-2','courier',NULL,'CRX-2','مندوب');`);
  await ensureFreelanceDispatch();
},30000);
beforeEach(async()=>{
  f.failClaim=false;delete process.env.SHAREFAST_EL7BBOB_POLICY_ENABLED;
  await database.exec(`DELETE FROM sharefast_freelance_audit;DELETE FROM sharefast_freelance_claims;DELETE FROM sharefast_freelance_availability;
    DELETE FROM sharefast_freelance_merchants;DELETE FROM sharefast_preparation_events;DELETE FROM sharefast_el7bbob_links;
    DELETE FROM wasl_orders;DELETE FROM wasl_couriers;DELETE FROM wasl_platform_settings;
    UPDATE wasl_accounts SET status='active';UPDATE wasl_courier_accounts SET status='active',zone='المنصورة',governorate='الدقهلية',sub_active=false,sub_until=NULL;`);
});
afterAll(()=>database.close());
async function order(ref="SX-100",merchantRef="SX-2"){
  await database.query(`INSERT INTO wasl_orders(ref,merchant_ref,merchant_name,merchant_zone,from_addr,dest_zone,to_addr,fee,order_total,customer_phone,customer_name,note,ready_minutes)
    SELECT $1,ref,name,zone,address,'ميدان مشعل','PRIVATE CUSTOMER ADDRESS',20,120,'PRIVATE PHONE','PRIVATE NAME','PRIVATE NOTE',15 FROM wasl_entities WHERE ref=$2`,[ref,merchantRef]);
}
async function open(){
  await saveDispatchSetting(merchant,{enabled:true,expectedRevision:0});
  await saveDispatchSetting(courier,{enabled:true,expectedRevision:0});
}
it("defaults to explicit offline and merchant opt-out, with no orders offered",async()=>{
  await order();expect(await readDispatchSetting(merchant)).toEqual({enabled:false,revision:0});
  expect(await freelanceOffers(courier)).toEqual({available:false,busy:false,offers:[]});
});
it("saves audited server-owned settings and rejects stale revisions",async()=>{
  expect(await saveDispatchSetting(merchant,{enabled:true,expectedRevision:0})).toEqual({enabled:true,revision:1});
  await expect(saveDispatchSetting(merchant,{enabled:false,expectedRevision:0})).rejects.toMatchObject({code:"settings_changed_reload"});
  expect((await database.query("SELECT * FROM sharefast_freelance_audit")).rows).toHaveLength(1);
});
it("rejects role, identity and body overrides",async()=>{
  for(const actor of [principal("merchant-id","SX-3","merchant"),principal("courier-id","CRX-2","courier"),principal("merchant-id","SX-2","admin")])
    await expect(readDispatchSetting(actor)).rejects.toMatchObject({code:"forbidden"});
  expect(()=>parseDispatchSetting({enabled:true,expectedRevision:0,merchantRef:"SX-3"})).toThrow();
  expect(()=>parseDispatchClaim({orderRef:"SX-100",courierRef:"CRX-2"})).toThrow();
  expect(()=>parseDispatchClaim({orderRef:" SX-100"})).toThrow();
});
it("redacts customer data and uses persisted geography, not browser-supplied geography",async()=>{
  await open();await order();
  const result=await freelanceOffers(courier);expect(result.offers).toHaveLength(1);
  expect(result.offers[0]).toMatchObject({ref:"SX-100",pickupZone:"المنصورة",feeEGP:20,readyMinutes:15,readyAt:null});
  expect(JSON.stringify(result)).not.toMatch(/PRIVATE|order_total|customer_phone|customer_name|note|from_addr|to_addr/);
});
it("requires merchant consent and does not expose other cities or invalid merchant accounts",async()=>{
  await open();await order();await order("SX-101","SX-3");await order("SX-102","SX-4");
  await database.exec(`UPDATE wasl_accounts SET status='inactive' WHERE id='${merchant.id}'`);
  expect((await freelanceOffers(courier)).offers).toHaveLength(0);
});
it("keeps company and reserved courier orders out of independent offers",async()=>{
  await open();await order();await order("SX-101");await order("SX-102");
  await database.exec(`UPDATE wasl_orders SET company_ref='company' WHERE ref='SX-101';UPDATE wasl_orders SET courier='reserved name' WHERE ref='SX-102'`);
  expect((await freelanceOffers(courier)).offers.map(o=>o.ref)).toEqual(["SX-100"]);
  await expect(claimFreelanceOffer(courier,{orderRef:"SX-101"})).rejects.toMatchObject({code:"offer_unavailable"});
});
it("checks active subscription and fails closed on malformed policy",async()=>{
  await database.exec(`INSERT INTO wasl_platform_settings VALUES('platform','{"courier":{"enabled":true}}')`);
  await expect(saveDispatchSetting(courier,{enabled:true,expectedRevision:0})).rejects.toMatchObject({code:"courier_not_eligible"});
  await database.exec(`UPDATE wasl_courier_accounts SET sub_active=true,sub_until=now()+interval '1 hour' WHERE ref='CRX-1'`);
  await saveDispatchSetting(courier,{enabled:true,expectedRevision:0});
  await database.exec(`UPDATE wasl_platform_settings SET value_json='not-json'`);
  await expect(freelanceOffers(courier)).rejects.toMatchObject({code:"courier_policy_unavailable"});
  // Turning off stays possible even when a subscription expires or policy is malformed.
  expect(await saveDispatchSetting(courier,{enabled:false,expectedRevision:1})).toMatchObject({enabled:false});
});
it("atomically assigns exactly once and preserves fee, total and payment",async()=>{
  await open();await order();
  expect(await claimFreelanceOffer(courier,{orderRef:"SX-100"})).toEqual({replayed:false,ref:"SX-100",status:"accepted"});
  expect(await claimFreelanceOffer(courier,{orderRef:"SX-100"})).toMatchObject({replayed:true,status:"accepted"});
  expect((await database.query("SELECT status,courier_ref,fee,order_total,pay FROM wasl_orders")).rows[0])
    .toMatchObject({status:"accepted",courier_ref:"CRX-1",fee:20,order_total:120,pay:"كاش"});
  expect((await database.query("SELECT * FROM sharefast_freelance_claims")).rows).toHaveLength(1);
});
it("rejects two couriers claiming one order without preemption",async()=>{
  await open();await saveDispatchSetting(second,{enabled:true,expectedRevision:0});await order();
  const results=await Promise.allSettled([claimFreelanceOffer(courier,{orderRef:"SX-100"}),claimFreelanceOffer(second,{orderRef:"SX-100"})]);
  expect(results.filter(r=>r.status==="fulfilled")).toHaveLength(1);
  expect(results.filter(r=>r.status==="rejected")).toHaveLength(1);
  expect((await database.query("SELECT * FROM sharefast_freelance_claims")).rows).toHaveLength(1);
});
it("rejects two jobs for one courier and hides offers while busy",async()=>{
  await open();await order();await order("SX-101");
  const results=await Promise.allSettled([claimFreelanceOffer(courier,{orderRef:"SX-100"}),claimFreelanceOffer(courier,{orderRef:"SX-101"})]);
  expect(results.filter(r=>r.status==="fulfilled")).toHaveLength(1);
  expect(results.filter(r=>r.status==="rejected")).toHaveLength(1);
  expect(await freelanceOffers(courier)).toMatchObject({busy:true,offers:[]});
});
it("allows a new job after a terminal outcome, not on a countdown or failed polling",async()=>{
  await open();await order();await order("SX-101");await claimFreelanceOffer(courier,{orderRef:"SX-100"});
  await database.exec(`UPDATE wasl_orders SET status='delivered' WHERE ref='SX-100'`);
  expect((await freelanceOffers(courier)).offers.map(o=>o.ref)).toEqual(["SX-101"]);
  await claimFreelanceOffer(courier,{orderRef:"SX-101"});
});
it("recovers lost acknowledgement even after offline or subscription change",async()=>{
  await open();await order();await claimFreelanceOffer(courier,{orderRef:"SX-100"});
  await saveDispatchSetting(courier,{enabled:false,expectedRevision:1});
  await database.exec(`UPDATE wasl_courier_accounts SET status='suspended' WHERE ref='CRX-1'`);
  expect(await claimFreelanceOffer(courier,{orderRef:"SX-100"})).toMatchObject({replayed:true,status:"accepted"});
});
it("revocation prevents new claims but does not cancel an accepted journey",async()=>{
  await open();await order();await order("SX-101");await claimFreelanceOffer(courier,{orderRef:"SX-100"});
  await saveDispatchSetting(merchant,{enabled:false,expectedRevision:1});
  expect((await database.query<{status:string}>(`SELECT status FROM wasl_orders WHERE ref='SX-100'`)).rows[0]?.status).toBe("accepted");
  await database.exec(`UPDATE wasl_orders SET status='delivered' WHERE ref='SX-100'`);
  await expect(claimFreelanceOffer(courier,{orderRef:"SX-101"})).rejects.toMatchObject({code:"offer_unavailable"});
});
it("signed bridge orders inherit dispatch consent but tombstones forbid claiming",async()=>{
  await saveDispatchSetting(courier,{enabled:true,expectedRevision:0});await order();
  await database.exec(`INSERT INTO sharefast_el7bbob_links(external_order_id,payload_hash,order_ref)VALUES('11111111-1111-4111-8111-111111111111','fixture','SX-100')`);
  expect((await freelanceOffers(courier)).offers).toHaveLength(1);
  await database.exec(`UPDATE sharefast_el7bbob_links SET cancel_requested=true`);
  expect((await freelanceOffers(courier)).offers).toHaveLength(0);
  await expect(claimFreelanceOffer(courier,{orderRef:"SX-100"})).rejects.toMatchObject({code:"offer_unavailable"});
});
it("locks linked fleet aliases too: a fleet task prevents a freelance claim",async()=>{
  await open();await order();await order("SX-101");
  await database.exec(`INSERT INTO wasl_couriers(ref,owner_ref,owner_type,owner_name,name,phone,zone,invite_code,status,account_id)
    VALUES('FLEET-1','SX-2','merchant','الحبوب','مندوب','01000000004','المنصورة','fixture','active','courier-id');
    UPDATE wasl_orders SET status='accepted',courier_ref='FLEET-1',courier='مندوب' WHERE ref='SX-101'`);
  await expect(claimFreelanceOffer(courier,{orderRef:"SX-100"})).rejects.toMatchObject({code:"courier_busy"});
});
it("a freelance task blocks a fleet assignment through the shared lock",async()=>{
  await open();await order();await claimFreelanceOffer(courier,{orderRef:"SX-100"});
  await database.exec(`INSERT INTO wasl_couriers(ref,owner_ref,owner_type,owner_name,name,phone,zone,invite_code,status,account_id)
    VALUES('FLEET-1','SX-2','merchant','الحبوب','مندوب','01000000004','المنصورة','fixture','active','courier-id')`);
  await expect(f.transaction((tx:{execute:(q:SQL)=>Promise<unknown>})=>lockCourierAssignment(tx,"FLEET-1","SX-101")))
    .rejects.toMatchObject({code:"courier_busy"});
});
it("rolls the assignment back if claim ledger persistence fails",async()=>{
  await open();await order();f.failClaim=true;
  await expect(claimFreelanceOffer(courier,{orderRef:"SX-100"})).rejects.toThrow("injected write failure");
  expect((await database.query("SELECT status,courier_ref FROM wasl_orders")).rows[0]).toMatchObject({status:"searching",courier_ref:null});
  expect((await database.query("SELECT * FROM sharefast_freelance_claims")).rows).toHaveLength(0);
});
it("reveals private order details through the original scoped list only after acceptance",async()=>{
  await open();await order();
  const compiled=dialect.sqlToQuery(sql`SELECT o.ref,o.customer_phone FROM wasl_orders o WHERE ${orderVisibilitySQL(courier)}`);
  expect((await database.query(compiled.sql,compiled.params)).rows).toHaveLength(0);
  await claimFreelanceOffer(courier,{orderRef:"SX-100"});
  expect((await database.query(compiled.sql,compiled.params)).rows).toHaveLength(1);
  const other=dialect.sqlToQuery(sql`SELECT o.ref FROM wasl_orders o WHERE ${orderVisibilitySQL(second)}`);
  expect((await database.query(other.sql,other.params)).rows).toHaveLength(0);
});
it("ranks verified owned-family waiting jobs first, without taking an accepted journey",async()=>{
  process.env.SHAREFAST_EL7BBOB_POLICY_ENABLED="true";process.env.SHAREFAST_EL7BBOB_MERCHANT_REF="SX-2";process.env.SHAREFAST_EL7BBOB_ACCOUNT_ID=merchant.id;
  await open();await saveDispatchSetting(principal("other-id","SX-3","merchant"),{enabled:true,expectedRevision:0});
  await order("SX-99","SX-3");await order("SX-100");
  await database.exec(`UPDATE wasl_orders SET created_at=now()-interval '1 hour' WHERE ref='SX-99'`);
  const offers=(await freelanceOffers(courier)).offers;expect(offers.map(o=>o.ref)).toEqual(["SX-100","SX-99"]);
  expect(offers[0]?.restaurantPriority).toBe(true);
  await claimFreelanceOffer(courier,{orderRef:"SX-99"});
  expect(await freelanceOffers(courier)).toMatchObject({busy:true,offers:[]});
  expect((await database.query("SELECT status FROM wasl_orders WHERE ref='SX-100'")).rows[0]).toMatchObject({status:"searching"});
});
it("name-only legacy assignment blocks acceptance conservatively but never grants private visibility",async()=>{
  await open();await order();await order("SX-101");
  await database.exec(`UPDATE wasl_orders SET status='accepted',courier='مندوب أول',courier_ref=NULL WHERE ref='SX-101'`);
  await expect(claimFreelanceOffer(courier,{orderRef:"SX-100"})).rejects.toMatchObject({code:"courier_busy"});
  const compiled=dialect.sqlToQuery(sql`SELECT o.ref FROM wasl_orders o WHERE ${orderVisibilitySQL(courier)}`);
  expect((await database.query(compiled.sql,compiled.params)).rows).toHaveLength(0);
});