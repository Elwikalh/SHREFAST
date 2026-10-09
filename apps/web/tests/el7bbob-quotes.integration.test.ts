import type { SQL } from "drizzle-orm";
import type { QuoteSnapshot } from "../lib/el7bbob-quotes";
import { PGlite } from "@electric-sql/pglite";
import { PgDialect } from "drizzle-orm/pg-core";
import { beforeAll, beforeEach, afterAll, it, expect, vi } from "vitest";
const f = vi.hoisted(() => ({ execute: vi.fn(), transaction: vi.fn() }));
vi.mock("@el7bboB/db", () => ({ db: f }));
vi.mock("../lib/wasl-store", () => ({
  ensureTables: async () => {},
  WASL_ZONES: { المنصورة: [31, 31], طلخا: [31.1, 31] },
}));
import {
  ensureQuoteTable,
  issueBridgeQuote,
  readBridgeQuote,
  claimBridgeQuote,
} from "../lib/el7bbob-quotes";
import {
  saveDeliveryPricing,
  DEFAULT_DELIVERY_PRICING,
  ensureDeliveryPricing,
} from "../lib/delivery-pricing-settings";
import { parseEnvelope } from "../lib/sharefast-protocol";
const db = new PGlite(),
  dialect = new PgDialect();
const exec = async (q: SQL) => {
  const s = dialect.sqlToQuery(q);
  return (await db.query(s.sql, s.params)).rows;
};
type TestExecutor = { execute: typeof exec };
const transaction = (cb: (tx: TestExecutor) => Promise<unknown>) =>
  db.transaction((tx) =>
    cb({
      execute: async (q: SQL) => {
        const s = dialect.sqlToQuery(q);
        return (await tx.query(s.sql, s.params)).rows;
      },
    }),
  );
const orderId = "11111111-1111-4111-8111-111111111111",
  otherId = "22222222-2222-4222-8222-222222222222";
function envelope(q: QuoteSnapshot) {
  return parseEnvelope({
    version: 1,
    externalOrderId: orderId,
    displayNumber: "MAIN-TEST",
    branchCode: q.branchCode,
    destZone: q.destZone,
    fromAddr: "ميدان مشعل",
    toAddr: "عنوان اختبار فقط",
    feeEGP: q.feeEGP,
    totalEGP: 100,
    paymentMethod: "cash",
    customerName: "اختبار",
    customerPhone: "01000000001",
    note: "",
    source: "client_online",
    quote: { id: q.id, acceptedAt: new Date().toISOString() },
  });
}
beforeAll(async () => {
  f.execute.mockImplementation(exec);
  f.transaction.mockImplementation(transaction);
  await db.exec(
    "CREATE TABLE wasl_entities(ref text PRIMARY KEY,type text,zone text);INSERT INTO wasl_entities VALUES('restaurant','merchant','المنصورة'),('other','merchant','المنصورة'),('courier','courier','المنصورة');",
  );
  await ensureQuoteTable();
  await ensureDeliveryPricing();
});
beforeEach(async () => {
  vi.useRealTimers();
  delete process.env.SHAREFAST_EL7BBOB_BRANCH_ZONES_JSON;
  delete process.env.SHAREFAST_EL7BBOB_DEST_ZONES_JSON;
  await db.exec(
    "DELETE FROM sharefast_el7bbob_quotes;DELETE FROM sharefast_delivery_pricing_history;DELETE FROM sharefast_delivery_pricing;",
  );
});
afterAll(() => db.close());
it("binds MAIN to server-owned restaurant and uses known neighborhood price", async () => {
  const q = await issueBridgeQuote("MAIN", "ميدان مشعل", "restaurant");
  expect(q.feeEGP).toBe(15);
  expect(q.pricingVersion).toBe(0);
  expect(Date.parse(q.expiresAt) - Date.parse(q.issuedAt)).toBe(600000);
  await expect(
    issueBridgeQuote("MAIN", "ميدان مشعل", "courier"),
  ).rejects.toMatchObject({ code: "merchant_binding_required" });
});
it("rejects unenrolled branches, unknown destinations and invalid mapping", async () => {
  await expect(
    issueBridgeQuote("FUTURE", "ميدان مشعل", "restaurant"),
  ).rejects.toMatchObject({ code: "branch_mapping_required" });
  await expect(
    issueBridgeQuote("MAIN", "unknown", "restaurant"),
  ).rejects.toMatchObject({ code: "unsupported_zone" });
  process.env.SHAREFAST_EL7BBOB_BRANCH_ZONES_JSON = "[]";
  await expect(
    issueBridgeQuote("MAIN", "ميدان مشعل", "restaurant"),
  ).rejects.toMatchObject({ code: "zone_mapping_unconfigured" });
});
it("allows explicitly enrolled branches and destination aliases only from server config", async () => {
  process.env.SHAREFAST_EL7BBOB_BRANCH_ZONES_JSON = JSON.stringify({
    NEW: "المنصورة",
  });
  process.env.SHAREFAST_EL7BBOB_DEST_ZONES_JSON = JSON.stringify({
    alias: "ميدان مشعل",
  });
  expect(await issueBridgeQuote("NEW", "alias", "restaurant")).toMatchObject({
    branchCode: "NEW",
    destZone: "alias",
    feeEGP: 15,
  });
});
it("freezes price/version while newer quotes reflect audited admin edits", async () => {
  const q = await issueBridgeQuote("MAIN", "ميدان مشعل", "restaurant");
  await saveDeliveryPricing(
    {
      ...DEFAULT_DELIVERY_PRICING,
      zoneOverrides: { "المنصورة|ميدان مشعل": 28 },
    },
    0,
    "admin-test",
  );
  expect(await readBridgeQuote(q.id, "restaurant")).toMatchObject({
    feeEGP: 15,
    pricingVersion: 0,
  });
  expect(
    await issueBridgeQuote("MAIN", "ميدان مشعل", "restaurant"),
  ).toMatchObject({ feeEGP: 28, pricingVersion: 1 });
});
it("does not expose quotes across merchant identities or after expiration", async () => {
  const q = await issueBridgeQuote("MAIN", "ميدان مشعل", "restaurant");
  await expect(readBridgeQuote(q.id, "other")).rejects.toMatchObject({
    code: "quote_not_found",
  });
  vi.spyOn(Date, "now").mockReturnValue(Date.parse(q.expiresAt));
  await expect(readBridgeQuote(q.id, "restaurant")).rejects.toMatchObject({
    code: "quote_expired",
  });
  vi.restoreAllMocks();
});
it("allows late outbox delivery only for acceptance inside original quote window", async () => {
  const q = await issueBridgeQuote("MAIN", "ميدان مشعل", "restaurant"),
    e = envelope(q);
  vi.spyOn(Date, "now").mockReturnValue(Date.parse(q.expiresAt) + 3600000);
  await transaction((tx: TestExecutor) => claimBridgeQuote(tx, e, "restaurant"));
  expect(
    (await db.query<{external_order_id: string}>("SELECT external_order_id FROM sharefast_el7bbob_quotes"))
      .rows[0]?.external_order_id,
  ).toBe(orderId);
  vi.restoreAllMocks();
});
it("rejects price/zone/branch/root tampering and acceptance outside the window", async () => {
  const q = await issueBridgeQuote("MAIN", "ميدان مشعل", "restaurant"),
    e = envelope(q);
  for (const patch of [
    { feeEGP: 30 },
    { destZone: "طلخا" },
    { branchCode: "NEW" },
  ])
    await expect(
      transaction((tx: TestExecutor) =>
        claimBridgeQuote(tx, { ...e, ...patch }, "restaurant"),
      ),
    ).rejects.toMatchObject({ code: "quote_mismatch" });
  await expect(
    transaction((tx: TestExecutor) => claimBridgeQuote(tx, e, "other")),
  ).rejects.toMatchObject({ code: "quote_not_found" });
  for (const at of [
    new Date(Date.parse(q.issuedAt) - 1).toISOString(),
    q.expiresAt,
    "not-a-date",
  ])
    await expect(
      transaction((tx: TestExecutor) =>
        claimBridgeQuote(
          tx,
          { ...e, quote: { id: q.id, acceptedAt: at } },
          "restaurant",
        ),
      ),
    ).rejects.toMatchObject({ code: "quote_acceptance_out_of_window" });
});
it("one quote cannot fund two orders but exact claim replay is safe", async () => {
  const q = await issueBridgeQuote("MAIN", "ميدان مشعل", "restaurant"),
    e = envelope(q);
  await transaction((tx: TestExecutor) => claimBridgeQuote(tx, e, "restaurant"));
  await transaction((tx: TestExecutor) => claimBridgeQuote(tx, e, "restaurant"));
  await expect(
    transaction((tx: TestExecutor) =>
      claimBridgeQuote(tx, { ...e, externalOrderId: otherId }, "restaurant"),
    ),
  ).rejects.toMatchObject({ code: "quote_already_used" });
  await expect(readBridgeQuote(q.id, "restaurant")).rejects.toMatchObject({
    code: "quote_already_used",
  });
});
it("rolls claim back when delivery creation fails in the same transaction", async () => {
  const q = await issueBridgeQuote("MAIN", "ميدان مشعل", "restaurant"),
    e = envelope(q);
  await expect(
    transaction(async (tx: TestExecutor) => {
      await claimBridgeQuote(tx, e, "restaurant");
      throw Error("create failed");
    }),
  ).rejects.toThrow("create failed");
  expect((await readBridgeQuote(q.id, "restaurant")).id).toBe(q.id);
});

it("does not price a cross-city branch while delivery still inherits the root pickup zone", async () => {
  process.env.SHAREFAST_EL7BBOB_BRANCH_ZONES_JSON = JSON.stringify({
    NEW: "طلخا",
  });
  await expect(
    issueBridgeQuote("NEW", "طلخا", "restaurant"),
  ).rejects.toMatchObject({ code: "branch_binding_requires_review" });
});

it("food and standalone quote purposes cannot be exchanged",async()=>{const food=await issueBridgeQuote("MAIN","ميدان مشعل","restaurant"),standalone=await issueBridgeQuote("MAIN","ميدان مشعل","restaurant","standalone");expect(standalone.requestKind).toBe("standalone");expect(food.requestKind).toBeUndefined();await expect(transaction((tx: TestExecutor)=>claimBridgeQuote(tx,{...envelope(food),requestKind:"standalone",source:"staff_standalone"},"restaurant"))).rejects.toMatchObject({code:"quote_mismatch"});await expect(transaction((tx: TestExecutor)=>claimBridgeQuote(tx,envelope(standalone),"restaurant"))).rejects.toMatchObject({code:"quote_mismatch"});await transaction((tx: TestExecutor)=>claimBridgeQuote(tx,{...envelope(standalone),requestKind:"standalone",source:"staff_standalone"},"restaurant"));});
