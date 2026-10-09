import { PGlite } from "@electric-sql/pglite";
import { PgDialect } from "drizzle-orm/pg-core";
import { beforeAll, beforeEach, afterAll, it, expect, vi } from "vitest";
const f = vi.hoisted(() => ({ execute: vi.fn(), transaction: vi.fn() }));
vi.mock("@el7bboB/db", () => ({ db: f }));
import {
  ensureTables,
  ensureCourierTables,
  ensureClientInviteTables,
  saveWaslPlatformSettings,
  getWaslPlatformSettings,
} from "../lib/wasl-store";
import {
  verifiedOwnedRoot,
  ensureOwnedBranches,
  effectiveSubscription,
  saveOwnedBranch,
  listOwnedBranches,
  parseBranchCommand,
} from "../lib/owned-restaurant-policy";
import { waitingDispatchQueue } from "../lib/dispatch-queue";
import { orderVisibilitySQL } from "../lib/wasl-order-scope";
const db = new PGlite(),
  dialect = new PgDialect();
const rootId = "11111111-1111-4111-8111-111111111111",
  childId = "22222222-2222-4222-8222-222222222222",
  otherId = "33333333-3333-4333-8333-333333333333",
  courierId = "44444444-4444-4444-8444-444444444444";
const rootUser = { id: rootId, ref: "SX-2", role: "merchant" as const },
  childUser = { id: childId, ref: "SX-3", role: "merchant" as const },
  otherUser = { id: otherId, ref: "SX-4", role: "merchant" as const };
const command = () => ({
  merchantRef: "SX-3",
  accountId: childId,
  branchCode: "FUTURE",
  enabled: true,
  expectedRevision: 0,
  confirmOwnership: true,
});
beforeAll(async () => {
  f.execute.mockImplementation(async (q: any) => {
    const s = dialect.sqlToQuery(q);
    return (await db.query(s.sql, s.params)).rows;
  });
  f.transaction.mockImplementation((cb) =>
    db.transaction((tx) =>
      cb({
        execute: async (q: any) => {
          const s = dialect.sqlToQuery(q);
          return (await tx.query(s.sql, s.params)).rows;
        },
      }),
    ),
  );
  await ensureTables();
  await ensureCourierTables();
  await ensureClientInviteTables();
  await db.exec(`INSERT INTO wasl_entities(ref,type,name,phone,governorate,zone,address)VALUES('SX-2','merchant','الحبوب','01000000001','الدقهلية','المنصورة','ميدان مشعل'),('SX-3','merchant','فرع','01000000002','الدقهلية','المنصورة','عنوان فرع'),('SX-4','merchant','الحبوب','01000000003','الدقهلية','المنصورة','مطعم مختلف'),('SX-5','company','شركة','01000000004','الدقهلية','المنصورة','عنوان شركة');
 CREATE TABLE wasl_accounts(id text PRIMARY KEY,role text NOT NULL,entity_ref text UNIQUE REFERENCES wasl_entities(ref),courier_ref text,name text,phone text,password_hash text,status text NOT NULL DEFAULT 'active');
 INSERT INTO wasl_accounts(id,role,entity_ref,name,phone,password_hash)VALUES('${rootId}','merchant','SX-2','الحبوب','01000000001','test-unused'),('${childId}','merchant','SX-3','فرع','01000000002','test-unused'),('${otherId}','merchant','SX-4','الحبوب','01000000003','test-unused');INSERT INTO wasl_accounts(id,role,name,phone,password_hash,courier_ref)VALUES('${courierId}','courier','مندوب','01000000005','test-unused','CRX-1');`);
  await ensureOwnedBranches();
});
beforeEach(async () => {
  process.env.SHAREFAST_EL7BBOB_POLICY_ENABLED = "true";
  process.env.SHAREFAST_EL7BBOB_MERCHANT_REF = "SX-2";
  process.env.SHAREFAST_EL7BBOB_ACCOUNT_ID = rootId;
  await db.exec(
    "DELETE FROM sharefast_owned_restaurant_audit;DELETE FROM sharefast_owned_restaurant_branches;DELETE FROM wasl_orders;DELETE FROM wasl_client_invites;UPDATE wasl_accounts SET status='active';",
  );
  await saveWaslPlatformSettings({
    merchant: { enabled: true, monthlyFee: 100 },
    courier: { enabled: true, monthlyFee: 50 },
    company: { enabled: true, monthlyFee: 200 },
  });
});
afterAll(() => {
  delete process.env.SHAREFAST_EL7BBOB_POLICY_ENABLED;
  delete process.env.SHAREFAST_EL7BBOB_ACCOUNT_ID;
  return db.close();
});
it("waives only the verified root merchant subscription, never delivery or courier wages", async () => {
  const x = await effectiveSubscription(rootUser);
  expect(x).toMatchObject({
    subscriptionRequired: false,
    subscriptionExempt: true,
    effectiveMonthlyFeeEGP: 0,
    configuredMonthlyFeeEGP: 100,
    deliveryFeesWaived: false,
    courierWagesWaived: false,
    paidStatus: "not_evaluated",
  });
  expect(await effectiveSubscription(otherUser)).toMatchObject({
    subscriptionRequired: true,
    subscriptionExempt: false,
    effectiveMonthlyFeeEGP: 100,
  });
  expect(
    await effectiveSubscription({
      id: courierId,
      ref: "CRX-1",
      role: "courier",
    }),
  ).toMatchObject({
    subscriptionRequired: true,
    effectiveMonthlyFeeEGP: 50,
    subscriptionExempt: false,
  });
  expect((await getWaslPlatformSettings()).courier).toEqual({
    enabled: true,
    monthlyFee: 50,
  });
});
it("same name/phone-like identity or wrong account ID cannot inherit owner exemption", async () => {
  expect(
    await effectiveSubscription({ ...rootUser, id: otherId }),
  ).toMatchObject({ subscriptionExempt: false, effectiveMonthlyFeeEGP: 100 });
  expect(
    await effectiveSubscription({ ...otherUser, ref: "SX-2" }),
  ).toMatchObject({ subscriptionExempt: false });
});
it("root requires exact active merchant account binding, not name matching", async () => {
  process.env.SHAREFAST_EL7BBOB_ACCOUNT_ID = otherId;
  await expect(verifiedOwnedRoot()).rejects.toMatchObject({
    code: "owned_root_unverified",
  });
  process.env.SHAREFAST_EL7BBOB_ACCOUNT_ID = rootId;
  await db.exec(
    `UPDATE wasl_accounts SET status='suspended' WHERE id='${rootId}'`,
  );
  await expect(verifiedOwnedRoot()).rejects.toMatchObject({
    code: "owned_root_unverified",
  });
});
it("missing configuration fails closed while explicit disabled policy preserves platform settings", async () => {
  delete process.env.SHAREFAST_EL7BBOB_ACCOUNT_ID;
  await expect(effectiveSubscription(rootUser)).rejects.toMatchObject({
    code: "owned_root_unconfigured",
  });
  process.env.SHAREFAST_EL7BBOB_POLICY_ENABLED = "false";
  expect(await verifiedOwnedRoot()).toBeNull();
  expect(await effectiveSubscription(rootUser)).toMatchObject({
    subscriptionExempt: false,
    effectiveMonthlyFeeEGP: 100,
  });
});
it("verified branch account inherits the root policy without any account role promotion", async () => {
  expect((await effectiveSubscription(childUser)).subscriptionExempt).toBe(
    false,
  );
  await saveOwnedBranch(command(), "platform-admin");
  expect(await effectiveSubscription(childUser)).toMatchObject({
    subscriptionExempt: true,
    effectiveMonthlyFeeEGP: 0,
    rootRef: "SX-2",
  });
  expect(
    (await db.query(`SELECT role FROM wasl_accounts WHERE id='${childId}'`))
      .rows[0].role,
  ).toBe("merchant");
  expect(
    (
      await db.query(
        "SELECT actor_id,revision FROM sharefast_owned_restaurant_audit",
      )
    ).rows[0],
  ).toMatchObject({ actor_id: "platform-admin", revision: 1 });
});
it("branch revocation is audited and inactive accounts cannot gain an exemption", async () => {
  await saveOwnedBranch(command(), "platform-admin");
  await db.exec(
    `UPDATE wasl_accounts SET status='suspended' WHERE id='${childId}'`,
  );
  expect((await effectiveSubscription(childUser)).subscriptionExempt).toBe(
    false,
  );
  await saveOwnedBranch(
    { ...command(), enabled: false, expectedRevision: 1 },
    "admin-2",
  );
  expect(
    (await listOwnedBranches((await verifiedOwnedRoot())!))[0],
  ).toMatchObject({ enabled: false, revision: 2 });
  expect(
    (await db.query("SELECT * FROM sharefast_owned_restaurant_audit")).rows,
  ).toHaveLength(2);
});
it("root and existing branch bindings cannot be repointed by a stale or modified form", async () => {
  await saveOwnedBranch(command(), "platform-admin");
  await expect(saveOwnedBranch(command(), "admin-2")).rejects.toMatchObject({
    code: "settings_changed_reload",
  });
  await expect(
    saveOwnedBranch(
      { ...command(), branchCode: "OTHER", expectedRevision: 1 },
      "admin-2",
    ),
  ).rejects.toMatchObject({ code: "branch_binding_immutable" });
  await expect(
    saveOwnedBranch(
      { ...command(), merchantRef: "SX-2", accountId: rootId },
      "admin-2",
    ),
  ).rejects.toMatchObject({ code: "root_binding_immutable" });
  expect(
    (await db.query("SELECT * FROM sharefast_owned_restaurant_audit")).rows,
  ).toHaveLength(1);
});
it("unverified/mismatched/suspended or courier account cannot be enrolled as a merchant branch", async () => {
  for (const c of [
    { ...command(), accountId: otherId },
    { ...command(), accountId: courierId },
  ])
    await expect(saveOwnedBranch(c, "platform-admin")).rejects.toMatchObject({
      code: "branch_account_unverified",
    });
  await db.exec(
    `UPDATE wasl_accounts SET status='suspended' WHERE id='${childId}'`,
  );
  await expect(
    saveOwnedBranch(command(), "platform-admin"),
  ).rejects.toMatchObject({ code: "branch_account_unverified" });
  expect(
    (await db.query("SELECT * FROM sharefast_owned_restaurant_branches")).rows,
  ).toHaveLength(0);
});
it("requires explicit ownership attestation and rejects client root/fee/actor overrides", () => {
  for (const value of [
    { ...command(), confirmOwnership: false },
    { ...command(), rootRef: "other" },
    { ...command(), subscriptionExempt: true },
    { ...command(), verifiedBy: "admin" },
    { ...command(), expectedRevision: 1.5 },
  ])
    expect(() => parseBranchCommand(value)).toThrow();
});
const addOrders = async () =>
  db.exec(
    `INSERT INTO wasl_orders(ref,merchant_name,merchant_zone,from_addr,dest_zone,to_addr,fee,status,merchant_ref,created_at,courier_ref,courier)VALUES('SX-201','مطعم آخر','المنصورة','من','طلخا','إلى',30,'searching','SX-4',now()-interval '3 days',NULL,NULL),('SX-202','الحبوب','المنصورة','من','المنصورة','إلى',15,'searching','SX-2',now()-interval '2 days',NULL,NULL),('SX-203','فرع','المنصورة','من','المنصورة','إلى',20,'searching','SX-3',now()-interval '1 day',NULL,NULL),('SX-204','الحبوب','المنصورة','من','المنصورة','إلى',15,'accepted','SX-2',now(),'CRX-1','مندوب'),('SX-205','الحبوب','المنصورة','من','المنصورة','إلى',15,'searching','SX-2',now(),'CRX-1','مندوب');`,
  );
it("waiting queue ranks verified family first then FIFO, excluding accepted/reserved journeys", async () => {
  await saveOwnedBranch(command(), "platform-admin");
  await addOrders();
  const before = (await db.query("SELECT * FROM wasl_orders ORDER BY id")).rows;
  const q = await waitingDispatchQueue({
    role: "admin",
    id: "admin",
    ref: "admin",
  });
  expect(q.orders.map((x) => x.ref)).toEqual(["SX-202", "SX-203", "SX-201"]);
  expect(q.orders.map((x) => x.restaurantPriority)).toEqual([
    true,
    true,
    false,
  ]);
  expect(
    (await db.query("SELECT * FROM wasl_orders ORDER BY id")).rows,
  ).toEqual(before);
  expect(q.orders[0]).not.toHaveProperty("customerPhone");
  expect(q.orders[0]).not.toHaveProperty("toAddr");
});
it("disabled policy has no priority and retains oldest-first available queue", async () => {
  await addOrders();
  process.env.SHAREFAST_EL7BBOB_POLICY_ENABLED = "false";
  const q = await waitingDispatchQueue({
    role: "admin",
    id: "admin",
    ref: "admin",
  });
  expect(q.priorityEnabled).toBe(false);
  expect(q.orders.map((x) => x.ref)).toEqual(["SX-201", "SX-202", "SX-203"]);
});
it("merchant and company queue preserve their original ownership scope, not global offers", async () => {
  await addOrders();
  expect(
    (await waitingDispatchQueue(rootUser)).orders.map((x) => x.ref),
  ).toEqual(["SX-202"]);
  expect(
    (await waitingDispatchQueue(otherUser)).orders.map((x) => x.ref),
  ).toEqual(["SX-201"]);
  const company = { role: "company" as const, ref: "SX-5", id: "company" };
  expect((await waitingDispatchQueue(company)).orders).toHaveLength(0);
  await db.exec(
    "INSERT INTO wasl_client_invites(ref,company_ref,company_name,merchant_name,phone,zone,status)VALUES('INV-TEST','SX-5','شركة','الحبوب','01000000001','المنصورة','accepted')",
  );
  expect(
    (await waitingDispatchQueue(company)).orders.map((x) => x.ref),
  ).toEqual(["SX-202"]);
});
it("courier cannot read global waiting queue; original courier predicate still grants assigned jobs only", async () => {
  await addOrders();
  const courier = { role: "courier" as const, ref: "CRX-1", id: courierId };
  await expect(waitingDispatchQueue(courier)).rejects.toMatchObject({
    code: "forbidden",
  });
  const query = dialect.sqlToQuery(
    (await import("drizzle-orm"))
      .sql`SELECT o.ref FROM wasl_orders o WHERE (${orderVisibilitySQL(courier)}) ORDER BY o.id`,
  );
  expect(
    (await db.query(query.sql, query.params)).rows.map((x) => x.ref),
  ).toEqual(["SX-204", "SX-205"]);
});
it("same branch code cannot be double-enrolled; failed transaction creates no audit row", async () => {
  await saveOwnedBranch(command(), "platform-admin");
  await expect(
    saveOwnedBranch(
      { ...command(), merchantRef: "SX-4", accountId: otherId },
      "platform-admin",
    ),
  ).rejects.toThrow();
  expect(
    (await db.query("SELECT * FROM sharefast_owned_restaurant_branches")).rows,
  ).toHaveLength(1);
  expect(
    (await db.query("SELECT * FROM sharefast_owned_restaurant_audit")).rows,
  ).toHaveLength(1);
});
it("concurrent admins cannot overwrite a newer branch revision or audit twice", async () => {
  await saveOwnedBranch(command(), "first-admin");
  const results = await Promise.allSettled([
    saveOwnedBranch(
      { ...command(), enabled: false, expectedRevision: 1 },
      "admin-a",
    ),
    saveOwnedBranch(
      { ...command(), enabled: true, expectedRevision: 1 },
      "admin-b",
    ),
  ]);
  expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  expect(results.filter((r) => r.status === "rejected")).toHaveLength(1);
  expect(
    (await db.query("SELECT revision FROM sharefast_owned_restaurant_branches"))
      .rows[0].revision,
  ).toBe(2);
  expect(
    (await db.query("SELECT * FROM sharefast_owned_restaurant_audit")).rows,
  ).toHaveLength(2);
});
it("self-managed settings cannot grant exemption to an unrelated merchant", async () => {
  const { setWaslSetting } = await import("../lib/wasl-store");
  await setWaslSetting("subscription:SX-4", {
    rootRef: "SX-2",
    subscriptionExempt: true,
  });
  expect(await effectiveSubscription(otherUser)).toMatchObject({
    subscriptionExempt: false,
    effectiveMonthlyFeeEGP: 100,
  });
});
it("branch code whitespace cannot bypass the immutable MAIN binding", async () => {
  expect(
    parseBranchCommand({ ...command(), branchCode: " FUTURE " }).branchCode,
  ).toBe("FUTURE");
  await expect(
    saveOwnedBranch({ ...command(), branchCode: " MAIN " }, "platform-admin"),
  ).rejects.toMatchObject({ code: "root_binding_immutable" });
});
