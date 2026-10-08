import { PGlite } from "@electric-sql/pglite";
import { PgDialect } from "drizzle-orm/pg-core";
import { type SQL } from "drizzle-orm";
import {
  beforeAll,
  afterAll,
  beforeEach,
  describe,
  it,
  expect,
  vi,
} from "vitest";
const runtime = vi.hoisted(() => ({ execute: vi.fn(), transaction: vi.fn() }));
vi.mock("@el7bboB/db", () => ({ db: runtime }));
vi.mock("../lib/wasl-store", () => ({
  ensureTables: async () => {},
  ensureClientInviteTables: async () => {},
}));
import {
  createBridgeOrder,
  readBridgeOrder,
  cancelBridgeOrder,
  ensureBridgeTables,
  bridgeConfig,
} from "../lib/el7bbob-bridge";
import { parseEnvelope } from "../lib/sharefast-protocol";
const database = new PGlite(),
  dialect = new PgDialect();
const input = parseEnvelope({
  version: 1,
  externalOrderId: "11111111-1111-4111-8111-111111111111",
  displayNumber: "B-261009-0001",
  branchCode: "B",
  destZone: "المنصورة",
  fromAddr: "عنوان المطعم",
  toAddr: "عنوان العميل كامل",
  feeEGP: 0,
  totalEGP: 100,
  paymentMethod: "cash",
  customerName: "عميل اختبار",
  customerPhone: "01000000001",
  note: "",
  source: "client_online",
});
beforeAll(async () => {
  const execute = async (query: SQL) => {
    const q = dialect.sqlToQuery(query);
    return (await database.query(q.sql, q.params)).rows;
  };
  runtime.execute.mockImplementation(execute);
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
  // Minimal schema fixture uses the production columns touched by this integration only.
  await database.exec(`CREATE SEQUENCE wasl_order_seq;
 CREATE TABLE wasl_entities(ref text primary key,type text,name text,zone text,phone text);
 CREATE TABLE wasl_client_invites(company_ref text,phone text,status text);
 CREATE TABLE wasl_orders(ref text primary key,merchant_name text,merchant_zone text,from_addr text,dest_zone text,to_addr text,fee integer,fee_min integer,fee_max integer,pay text,kind text,customer_phone text,customer_name text,note text,order_total integer,source text,status text,merchant_ref text,company_ref text,courier text);
 INSERT INTO wasl_entities VALUES('restaurant','merchant','الحبوب','المنصورة','01000000001');`);
  await ensureBridgeTables();
}, 30000);
beforeEach(async () => {
  await database.exec(
    "DELETE FROM sharefast_el7bbob_links;DELETE FROM wasl_orders;DELETE FROM wasl_client_invites;",
  );
});
afterAll(async () => {
  await database.close();
});
describe("restaurant bridge against embedded PostgreSQL, not production", () => {
  it("is disabled unless explicit server config is supplied", () => {
    delete process.env.SHAREFAST_EL7BBOB_ENABLED;
    expect(() => bridgeConfig()).toThrow();
  });
  it("creates one merchant-bound delivery and preserves charged fees", async () => {
    const x = await createBridgeOrder(input, "restaurant");
    expect(x.created).toBe(true);
    const data = await database.query<{
      fee: number;
      merchant_ref: string;
      merchant_name: string;
    }>("SELECT fee,merchant_ref,merchant_name FROM wasl_orders");
    expect(data.rows[0]).toMatchObject({
      fee: 0,
      merchant_ref: "restaurant",
      merchant_name: "الحبوب",
    });
  });
  it("replays exactly once with the same reference", async () => {
    const a = await createBridgeOrder(input, "restaurant"),
      b = await createBridgeOrder({ ...input }, "restaurant");
    expect(b.created).toBe(false);
    expect(b.order.ref).toBe(a.order.ref);
    expect(
      (await database.query("SELECT * FROM wasl_orders")).rows,
    ).toHaveLength(1);
  });
  it("rejects changed payload under the same ID", async () => {
    await createBridgeOrder(input, "restaurant");
    await expect(
      createBridgeOrder({ ...input, totalEGP: 200 }, "restaurant"),
    ).rejects.toMatchObject({ code: "idempotency_conflict" });
    expect(
      (await database.query("SELECT * FROM wasl_orders")).rows,
    ).toHaveLength(1);
  });
  it("rolls back both link and order when the merchant is missing", async () => {
    await expect(createBridgeOrder(input, "missing")).rejects.toMatchObject({
      code: "merchant_binding_required",
    });
    expect(
      (await database.query("SELECT * FROM sharefast_el7bbob_links")).rows,
    ).toHaveLength(0);
  });
  it("does not expose another merchant through lookup or retry", async () => {
    await createBridgeOrder(input, "restaurant");
    await expect(
      readBridgeOrder(input.externalOrderId, "other"),
    ).rejects.toMatchObject({ code: "not_found" });
    await expect(createBridgeOrder(input, "other")).rejects.toMatchObject({
      code: "binding_conflict",
    });
  });
  it("requires an accepted company association if configured", async () => {
    await expect(
      createBridgeOrder(input, "restaurant", "company"),
    ).rejects.toMatchObject({ code: "company_binding_requires_review" });
    await database.exec(
      "INSERT INTO wasl_client_invites VALUES('company','01000000001','accepted')",
    );
    await createBridgeOrder(input, "restaurant", "company");
    expect(
      (
        await database.query<{ company_ref: string }>(
          "SELECT company_ref FROM wasl_orders",
        )
      ).rows[0]?.company_ref,
    ).toBe("company");
  });
  it("cancels safely and idempotently before the journey starts", async () => {
    await createBridgeOrder(input, "restaurant");
    expect(
      (await cancelBridgeOrder(input.externalOrderId, "restaurant")).status,
    ).toBe("canceled");
    expect(
      (await cancelBridgeOrder(input.externalOrderId, "restaurant")).status,
    ).toBe("canceled");
  });
  it("requires operator review once delivery is heading to the customer", async () => {
    await createBridgeOrder(input, "restaurant");
    await database.exec("UPDATE wasl_orders SET status='heading'");
    await expect(
      cancelBridgeOrder(input.externalOrderId, "restaurant"),
    ).rejects.toMatchObject({ code: "cancellation_requires_review" });
    expect(
      (await readBridgeOrder(input.externalOrderId, "restaurant")).status,
    ).toBe("heading");
  });
  it("does not write restaurant orders or payments", async () => {
    await createBridgeOrder(input, "restaurant");
    const tables = await database.query<{ tablename: string }>(
      "SELECT tablename FROM pg_tables WHERE schemaname='public'",
    );
    expect(
      tables.rows.some(
        (t) => t.tablename === "payments" || t.tablename === "orders",
      ),
    ).toBe(false);
  });
});

it("serializes simultaneous retries into one delivery", async () => {
  const pair = await Promise.all([
    createBridgeOrder(input, "restaurant"),
    createBridgeOrder(input, "restaurant"),
  ]);
  expect(pair[0].order.ref).toBe(pair[1].order.ref);
  expect((await database.query("SELECT * FROM wasl_orders")).rows).toHaveLength(
    1,
  );
});

it("a cancel-before-create tombstone prevents a late POST from resurrecting delivery", async () => {
  const canceled = await cancelBridgeOrder(input.externalOrderId, "restaurant");
  expect(canceled.status).toBe("canceled");
  expect(canceled.ref).toBeNull();
  await expect(createBridgeOrder(input, "restaurant")).rejects.toMatchObject({
    code: "order_canceled_before_dispatch",
  });
  expect((await database.query("SELECT * FROM wasl_orders")).rows).toHaveLength(
    0,
  );
});
it("creation followed by cancellation serializes on the same link", async () => {
  const created = createBridgeOrder(input, "restaurant");
  const canceled = cancelBridgeOrder(input.externalOrderId, "restaurant");
  await created;
  expect((await canceled).status).toBe("canceled");
  expect(
    (await database.query<{ status: string }>("SELECT status FROM wasl_orders"))
      .rows[0]?.status,
  ).toBe("canceled");
});
