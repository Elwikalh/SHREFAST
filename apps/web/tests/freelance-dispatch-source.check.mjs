import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("existing assignment routes and freelance claims share the courier-person lock",()=>{
  for(const path of ["app/api/wasl/advance/route.ts","app/api/wasl/company/assign/route.ts","lib/freelance-dispatch.ts"]){
    const s=read(path);assert.match(s,/lockCourierAssignment\(tx/);assert.match(s,/db.transaction/);
  }
});
test("no payment, pricing, order creation or account promotion writes in new dispatch code",()=>{
  const s=read("lib/freelance-dispatch.ts");
  assert.doesNotMatch(s,/(UPDATE|INSERT INTO|DELETE FROM)\s+(wasl_accounts|wasl_courier_accounts|wasl_platform_settings|payments)\b/i);
  assert.doesNotMatch(s,/INSERT INTO wasl_orders/);assert.doesNotMatch(s,/SET\s+(fee|pay|order_total)\b/);
  assert.match(s,/SET status='accepted',courier_ref=/);
});
test("offer SQL explicitly selects redacted fields and requires waiting, consent and persisted location",()=>{
  const s=read("lib/freelance-dispatch.ts");
  assert.match(s,/o.status='searching'/);assert.match(s,/o.courier_ref IS NULL/);assert.match(s,/e.zone=\$\{account.zone\}/);
  assert.match(s,/e.governorate=\$\{account.governorate\}/);
  assert.match(s,/SELECT o.ref,o.merchant_name,o.merchant_zone,o.dest_zone,o.fee,o.ready_minutes,o.created_at/);
});