import { PGlite } from "@electric-sql/pglite";
import { PgDialect } from "drizzle-orm/pg-core";
import { sql, type SQL } from "drizzle-orm";
import {
	beforeAll,
	afterAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
const runtime = vi.hoisted(() => ({ execute: vi.fn(), transaction: vi.fn() }));
vi.mock("@el7bboB/db", () => ({ db: runtime }));
import { ensureAuthTables, createSession } from "../lib/wasl-auth";
import {
	ensureClientInviteTables,
	ensureCourierTables,
	ensurePartnershipTables,
} from "../lib/wasl-store";
import { POST as register } from "../app/api/wasl/auth/register/route";
import { POST as login } from "../app/api/wasl/auth/login/route";
import { POST as logout } from "../app/api/wasl/auth/logout/route";
import { GET as me } from "../app/api/wasl/auth/me/route";
import {
	GET as orders,
	POST as createOrder,
} from "../app/api/wasl/orders/route";
import { GET as entities } from "../app/api/wasl/entities/route";
import { GET as admin } from "../app/api/wasl/admin/control/route";
import { POST as assign } from "../app/api/wasl/company/assign/route";
import { POST as advance } from "../app/api/wasl/advance/route";
import { POST as join } from "../app/api/wasl/couriers/join/route";
const database = new PGlite(),
	dialect = new PgDialect();
async function execute(query: SQL) {
	const compiled = dialect.sqlToQuery(query);
	return (await database.query(compiled.sql, compiled.params)).rows;
}
const profile = {
	role: "merchant",
	name: "نشاط اختبار",
	phone: "01000000001",
	password: "test-only-password-42",
	governorate: "القاهرة",
	zone: "المعادي",
	address: "عنوان اختبار محلي",
	consent: true,
};
function req(
	path: string,
	body?: unknown,
	cookie = "",
	origin = "http://localhost",
) {
	return new Request("http://localhost/api/wasl/" + path, {
		method: body === undefined ? "GET" : "POST",
		...(body === undefined ? {} : { body: JSON.stringify(body) }),
		headers: { origin, cookie, "content-type": "application/json" },
	});
}
function cookie(response: Response) {
	return response.headers.get("set-cookie")!.split(";")[0]!;
}
async function account(overrides: Record<string, unknown> = {}) {
	const result = await register(
		req("auth/register", { ...profile, ...overrides }),
	);
	expect(result.status).toBe(201);
	return { cookie: cookie(result), user: (await result.json()).user };
}
beforeAll(async () => {
	runtime.execute.mockImplementation(execute);
	runtime.transaction.mockImplementation(
		(
			callback: (tx: {
				execute: (query: SQL) => Promise<unknown>;
			}) => Promise<unknown>,
		) =>
			database.transaction((tx) =>
				callback({
					execute: async (query: SQL) => {
						const compiled = dialect.sqlToQuery(query);
						return (await tx.query(compiled.sql, compiled.params)).rows;
					},
				}),
			),
	);
	await ensureAuthTables();
	await ensureClientInviteTables();
	await ensureCourierTables();
	await ensurePartnershipTables();
}, 30000);
beforeEach(async () => {
	await database.exec(
		"DELETE FROM wasl_orders; DELETE FROM wasl_partnership_invites; DELETE FROM wasl_partnership_members; DELETE FROM wasl_partnerships; DELETE FROM wasl_client_invites; DELETE FROM wasl_couriers; DELETE FROM wasl_accounts; DELETE FROM wasl_courier_accounts; DELETE FROM wasl_entities; DELETE FROM wasl_auth_limits;",
	);
});
afterAll(async () => {
	await database.close();
});
describe("registration and opaque sessions against embedded PostgreSQL", () => {
	it("creates a merchant and HttpOnly cookie without returning a password or token", async () => {
		const response = await register(req("auth/register", profile));
		expect(response.status).toBe(201);
		expect(response.headers.get("set-cookie")).toContain("HttpOnly");
		expect(response.headers.get("set-cookie")).toContain("SameSite=lax");
		const json = await response.json();
		expect(json.token).toBeUndefined();
		expect(json.password).toBeUndefined();
		expect(
			(await (await me(req("auth/me", undefined, cookie(response)))).json())
				.user.role,
		).toBe("merchant");
	});
	it("creates company coverage and courier identity atomically", async () => {
		await account({ role: "company", coverage: ["المعادي"] });
		const courier = await account({
			role: "courier",
			phone: "01000000002",
			nationalId: "29901010000001",
		});
		const result = await me(req("auth/me", undefined, courier.cookie));
		const data = await result.json();
		expect(data.user.nationalId).toBeUndefined();
		expect(data.user.address).toBe(profile.address);
	});
	it("rolls back the extra entity on a duplicate account", async () => {
		await account();
		expect((await register(req("auth/register", profile))).status).toBe(409);
		const counts = await database.query<{ n: number }>(
			"SELECT count(*)::int AS n FROM wasl_entities",
		);
		expect(counts.rows[0]!.n).toBe(1);
	});
	it("does not allow public admin signup", async () => {
		expect(
			(await register(req("auth/register", { ...profile, role: "admin" })))
				.status,
		).toBe(400);
	});
	it("never claims an old business record by phone alone", async () => {
		await execute(
			sql`INSERT INTO wasl_entities(ref,type,name,phone,governorate,zone,address) VALUES ('legacy','merchant','قديم',${profile.phone},'القاهرة','المعادي','عنوان')`,
		);
		expect((await register(req("auth/register", profile))).status).toBe(409);
	});
	it("rejects null, oversized and malformed data", async () => {
		expect((await register(req("auth/register", null))).status).toBe(400);
		expect(
			(
				await register(
					req("auth/register", { ...profile, name: "x".repeat(70000) }),
				)
			).status,
		).toBe(400);
	});
	it("checks login passwords and revokes logout sessions", async () => {
		await account();
		expect(
			(
				await login(
					req("auth/login", {
						role: "merchant",
						phone: profile.phone,
						password: "wrong",
					}),
				)
			).status,
		).toBe(401);
		const response = await login(
			req("auth/login", {
				role: "merchant",
				phone: profile.phone,
				password: profile.password,
			}),
		);
		expect(response.status).toBe(200);
		const session = cookie(response);
		expect((await logout(req("auth/logout", {}, session))).status).toBe(200);
		expect((await me(req("auth/me", undefined, session))).status).toBe(401);
	});
	it("rejects expired or forged cookies", async () => {
		const a = await account();
		await database.exec(
			"UPDATE wasl_sessions SET expires_at = now() - interval '1 minute'",
		);
		expect((await me(req("auth/me", undefined, a.cookie))).status).toBe(401);
		expect(
			(
				await me(
					req("auth/me", undefined, "sharefast_session=" + "f".repeat(64)),
				)
			).status,
		).toBe(401);
	});
	it("rejects cross-origin writes before creating an account", async () => {
		expect(
			(
				await register(
					req("auth/register", profile, "", "https://attacker.invalid"),
				)
			).status,
		).toBe(403);
	});
	it("rate limits repeated login attempts", async () => {
		for (let i = 0; i < 10; i++)
			expect(
				(
					await login(
						req("auth/login", {
							role: "merchant",
							phone: profile.phone,
							password: "wrong",
						}),
					)
				).status,
			).toBe(401);
		const response = await login(
			req("auth/login", {
				role: "merchant",
				phone: profile.phone,
				password: "wrong",
			}),
		);
		expect(response.status).toBe(429);
		expect(response.headers.get("retry-after")).toBe("900");
	});
});
describe("server-side isolation and atomic dispatch", () => {
	const order = {
		destZone: "المقطم",
		toAddr: "عنوان العميل للاختبار",
		fee: 30,
		merchant: "اسم غير موثوق",
		merchantZone: "وسط البلد",
		fromAddr: "عنوان مزور",
	};
	it("blocks anonymous data and non-admin administration", async () => {
		expect((await orders(req("orders"))).status).toBe(401);
		const a = await account();
		expect(
			(await admin(req("admin/control", undefined, a.cookie))).status,
		).toBe(403);
	});
	it("uses session identity and hides another merchant's data even with a forged query", async () => {
		const a = await account(),
			b = await account({ phone: "01000000002", name: "نشاط ثان" });
		const response = await createOrder(req("orders", order, a.cookie));
		expect(response.status).toBe(201);
		const saved = (await response.json()).order;
		expect(saved.merchant).toBe(profile.name);
		expect(
			(
				await (
					await orders(
						req(
							"orders?merchant=" + encodeURIComponent(profile.name),
							undefined,
							b.cookie,
						),
					)
				).json()
			).orders,
		).toHaveLength(0);
		expect(
			(
				await (await entities(req("entities", undefined, b.cookie))).json()
			).entities.map((x: { ref: string }) => x.ref),
		).toEqual([b.user.ref]);
	});
	it("assigns only active owned couriers, once, and binds delivery to its account", async () => {
		const merchant = await account(),
			company = await account({
				role: "company",
				phone: "01000000002",
				coverage: ["المعادي"],
			}),
			driver = await account({
				role: "courier",
				phone: "01000000003",
				nationalId: "29901010000001",
			});
		await execute(
			sql`INSERT INTO wasl_client_invites(ref,company_ref,company_name,merchant_name,phone,zone,status) VALUES ('ci',${company.user.ref},'شركة','نشاط',${profile.phone},'المعادي','accepted')`,
		);
		await execute(
			sql`INSERT INTO wasl_couriers(ref,owner_ref,owner_type,owner_name,name,phone,zone,vehicle,status,invite_code) VALUES ('driver',${company.user.ref},'company','شركة','مندوب','01000000003','المعادي','moto','invited','ABC123')`,
		);
		expect(
			(
				await join(
					req(
						"couriers/join",
						{ phone: "01000000003", code: "ABC123" },
						driver.cookie,
					),
				)
			).status,
		).toBe(200);
		const newOrder = (
			await (await createOrder(req("orders", order, merchant.cookie))).json()
		).order;
		const payload = { orderRef: newOrder.ref, courierRef: "driver" };
		expect(
			(await assign(req("company/assign", payload, company.cookie))).status,
		).toBe(200);
		expect(
			(await assign(req("company/assign", payload, company.cookie))).status,
		).toBe(409);
		expect(
			(await (await orders(req("orders", undefined, driver.cookie))).json())
				.orders,
		).toHaveLength(1);
		expect(
			(
				await advance(
					req(
						"advance",
						{ ref: newOrder.ref, status: "delivered" },
						driver.cookie,
					),
				)
			).status,
		).toBe(409);
		for (const status of ["pickup", "heading", "arrived", "delivered"])
			expect(
				(
					await advance(
						req("advance", { ref: newOrder.ref, status }, driver.cookie),
					)
				).status,
			).toBe(200);
	});
	it("does not expose private phone-based invitations to unverified accounts", async () => {
		const a = await account();
		const { GET } = await import("../app/api/wasl/clients/route");
		const response = await GET(req("clients", undefined, a.cookie));
		expect(response.status).toBe(403);
		expect((await response.json()).error).toBe("phone_verification_required");
	});
	it("persists explicit consent without pretending phone verification", async () => {
		const a = await account();
		const result = await database.query<{
			consent_version: string;
			phone_verified_at: null;
		}>("SELECT consent_version,phone_verified_at FROM wasl_accounts");
		expect(result.rows[0]!.consent_version).toBe("registration-v1");
		expect(result.rows[0]!.phone_verified_at).toBeNull();
		expect(
			(await (await me(req("auth/me", undefined, a.cookie))).json()).user
				.phoneVerified,
		).toBe(false);
	});
	it("does not allow expired paid courier subscriptions to bypass UI eligibility", async () => {
		const a = await account({ role: "courier", nationalId: "29901010000001" });
		const { saveWaslPlatformSettings } = await import("../lib/wasl-store");
		await saveWaslPlatformSettings({
			courier: { enabled: true, monthlyFee: 10 },
			merchant: { enabled: false, monthlyFee: 0 },
			company: { enabled: false, monthlyFee: 0 },
		});
		expect(
			(
				await advance(
					req("advance", { ref: "unknown", status: "pickup" }, a.cookie),
				)
			).status,
		).toBe(403);
		await saveWaslPlatformSettings({
			courier: { enabled: false, monthlyFee: 0 },
			merchant: { enabled: false, monthlyFee: 0 },
			company: { enabled: false, monthlyFee: 0 },
		});
	});
	it("blocks a foreign owner ref", async () => {
		const a = await account();
		const { GET } = await import("../app/api/wasl/couriers/route");
		expect(
			(await GET(req("couriers?ownerRef=somebody-else", undefined, a.cookie)))
				.status,
		).toBe(403);
	});
	it("does not grant administration just by changing a client role", async () => {
		const a = await account();
		expect(
			(
				await login(
					req("auth/login", {
						role: "admin",
						phone: profile.phone,
						password: profile.password,
					}),
				)
			).status,
		).toBe(401);
		const token = await createSession(a.user.id);
		expect(token.length).toBe(64);
	});
});

it("canonicalizes international phone numbers in courier invitations", async () => {
	const company = await account({ role: "company", coverage: ["المعادي"] });
	const { POST } = await import("../app/api/wasl/couriers/route");
	const response = await POST(
		req(
			"couriers",
			{
				ownerRef: company.user.ref,
				ownerType: "merchant",
				ownerName: "اسم مزور",
				name: "مندوب اختبار",
				phone: "+20 1000000003",
				zone: "المعادي",
			},
			company.cookie,
		),
	);
	expect(response.status).toBe(200);
	const result = await response.json();
	expect(result.courier.phone).toBe("01000000003");
	expect(result.courier.ownerName).toBe(profile.name);
});


describe("minimal registration persists across fresh login sessions", () => {
 for (const role of ["merchant", "company", "courier"] as const) {
  it(`persists ${role} account and profile without browser storage`, async()=>{
   const phone = role === "merchant" ? "01000000101" : role === "company" ? "01000000102" : "01000000103";
   const a=await account({role,phone,address:role==="merchant"?"عنوان الاستلام":"",coverage:[],nationalId:undefined});
   await logout(req("auth/logout",{},a.cookie));
   expect((await me(req("auth/me",undefined,a.cookie))).status).toBe(401);
   const response=await login(req("auth/login",{role,phone:"+20"+phone.slice(1),password:profile.password}));
   expect(response.status).toBe(200);
   const again=await (await me(req("auth/me",undefined,cookie(response)))).json();
   expect(again.user.id).toBe(a.user.id);expect(again.user.name).toBe(profile.name);expect(again.user.phone).toBe(phone);
   expect(again.user.phoneVerified).toBe(false);
   const table=role==="courier"?"wasl_courier_accounts":"wasl_entities";
   const saved=await database.query(`SELECT name,phone,zone,address FROM ${table} WHERE ref=$1`,[a.user.ref]);
   expect(saved.rows[0]).toMatchObject({name:profile.name,phone,zone:profile.zone,address:role==="merchant"?"عنوان الاستلام":""});
  });
 }
});
