import { PGlite } from "@electric-sql/pglite";
import { PgDialect } from "drizzle-orm/pg-core";
import { type SQL } from "drizzle-orm";
import { beforeAll, afterAll, it, expect, vi } from "vitest";
const runtime = vi.hoisted(() => ({ execute: vi.fn(), transaction: vi.fn() }));
vi.mock("@el7bboB/db", () => ({ db: runtime }));
// Deliberately do NOT mock wasl-store: use its existing production DDL against local PGlite.
import {
  ensureBridgeTables,
  createBridgeOrder,
  cancelBridgeOrder,
} from "../lib/el7bbob-bridge";
import { parseEnvelope } from "../lib/sharefast-protocol";
const database = new PGlite(),
  dialect = new PgDialect();
const input = parseEnvelope({
  version: 1,
  externalOrderId: "33333333-3333-4333-8333-333333333333",
  displayNumber: "B-261009-0002",
  branchCode: "B",
  destZone: "المنصورة",
  fromAddr: "عنوان المطعم",
  toAddr: "عنوان العميل كامل",
  feeEGP: 10,
  totalEGP: 100,
  paymentMethod: "instapay",
  customerName: "عميل اختبار",
  customerPhone: "01000000001",
  note: "",
  source: "owner_whatsapp",
});
beforeAll(async () => {
  runtime.execute.mockImplementation(async (query: SQL) => {
    const q = dialect.sqlToQuery(query);
    return (await database.query(q.sql, q.params)).rows;
  });
  runtime.transaction.mockImplementation(
    (
      callback: (tx: {
        execute: (q: SQL) => Promise<unknown>;
      }) => Promise<unknown>,
    ) =>
      database.transaction((tx) =>
        callback({
          execute: async (query) => {
            const q = dialect.sqlToQuery(query);
            return (await tx.query(q.sql, q.params)).rows;
          },
        }),
      ),
  );
  await ensureBridgeTables();
  await database.exec(
    "INSERT INTO wasl_entities(ref,type,name,phone,governorate,zone,address) VALUES('full-schema-restaurant','merchant','الحبوب','01000000001','الدقهلية','المنصورة','عنوان اختبار')",
  );
}, 30000);
afterAll(async () => {
  await database.close();
});
it("creates delivery on the actual existing Wasl schema without repricing", async () => {
  const result = await createBridgeOrder(input, "full-schema-restaurant");
  expect(result.created).toBe(true);
  const saved = await database.query<{
    fee: number;
    order_total: number;
    merchant_ref: string;
  }>("SELECT fee,order_total,merchant_ref FROM wasl_orders");
  expect(saved.rows[0]).toMatchObject({
    fee: 10,
    order_total: 100,
    merchant_ref: "full-schema-restaurant",
  });
});
it("cancels on the actual existing schema without restaurant payment writes", async () => {
  expect(
    (await cancelBridgeOrder(input.externalOrderId, "full-schema-restaurant"))
      .status,
  ).toBe("canceled");
  const tables = await database.query<{ tablename: string }>(
    "SELECT tablename FROM pg_tables WHERE schemaname='public'",
  );
  expect(
    tables.rows.some(
      (t) => t.tablename === "orders" || t.tablename === "payments",
    ),
  ).toBe(false);
});
it("atomically consumes a frozen quote with one delivery on actual Wasl DDL",async()=>{
 const {issueBridgeQuote}=await import("../lib/el7bbob-quotes");const q=await issueBridgeQuote("MAIN","ميدان مشعل","full-schema-restaurant");
 const e=parseEnvelope({...input,externalOrderId:"44444444-4444-4444-8444-444444444444",branchCode:"MAIN",destZone:q.destZone,feeEGP:q.feeEGP,totalEGP:100+q.feeEGP,quote:{id:q.id,acceptedAt:new Date().toISOString()}});
 const a=await createBridgeOrder(e,"full-schema-restaurant");const b=await createBridgeOrder(e,"full-schema-restaurant");expect(b.created).toBe(false);expect(b.order.ref).toBe(a.order.ref);
 expect((await database.query("SELECT external_order_id FROM sharefast_el7bbob_quotes WHERE id=$1",[q.id])).rows[0].external_order_id).toBe(e.externalOrderId);
 expect((await database.query("SELECT fee,order_total FROM wasl_orders WHERE ref=$1",[a.order.ref])).rows[0]).toMatchObject({fee:15,order_total:115});
 await expect(createBridgeOrder({...e,externalOrderId:"55555555-5555-4555-8555-555555555555"},"full-schema-restaurant")).rejects.toMatchObject({code:"quote_already_used"});
 expect((await database.query("SELECT * FROM sharefast_el7bbob_links WHERE external_order_id='55555555-5555-4555-8555-555555555555'")).rows).toHaveLength(0);
});
