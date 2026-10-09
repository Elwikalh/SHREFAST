import { beforeEach, it, expect, vi } from "vitest";
const f = vi.hoisted(() => ({
  authorize: vi.fn(),
  policy: vi.fn(),
  enabled: vi.fn(),
  queue: vi.fn(),
  root: vi.fn(),
  list: vi.fn(),
  save: vi.fn(),
  execute: vi.fn(),
}));
vi.mock("@el7bboB/db", () => ({ db: { execute: f.execute } }));
vi.mock("@/lib/wasl-access", () => ({ authorizeWasl: f.authorize }));
vi.mock("@/lib/dispatch-queue", () => ({ waitingDispatchQueue: f.queue }));
vi.mock("@/lib/owned-restaurant-policy", async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    effectiveSubscription: f.policy,
    ownedPolicyEnabled: f.enabled,
    verifiedOwnedRoot: f.root,
    listOwnedBranches: f.list,
    saveOwnedBranch: f.save,
  };
});
import { GET as subscriptionGET } from "../app/api/wasl/subscription-policy/route";
import { GET as queueGET } from "../app/api/wasl/dispatch-queue/route";
import {
  GET as adminGET,
  POST as adminPOST,
} from "../app/api/wasl/admin/owned-restaurants/route";
import {
  OwnedPolicyError,
  parseBranchCommand,
} from "../lib/owned-restaurant-policy";
const user = { id: "server-user", ref: "SX-2", role: "merchant" },
  body = {
    merchantRef: "SX-3",
    accountId: "22222222-2222-4222-8222-222222222222",
    branchCode: "NEW",
    enabled: true,
    expectedRevision: 0,
    confirmOwnership: true,
  };
const req = (path: string, raw?: string) =>
  new Request("https://test.invalid/api/wasl/" + path, {
    method: raw === undefined ? "GET" : "POST",
    ...(raw === undefined ? {} : { body: raw }),
  });
beforeEach(() => {
  vi.clearAllMocks();
  f.authorize.mockResolvedValue(user);
  f.policy.mockResolvedValue({
    subscriptionExempt: true,
    effectiveMonthlyFeeEGP: 0,
    deliveryFeesWaived: false,
    courierWagesWaived: false,
    paidStatus: "not_evaluated",
  });
  f.enabled.mockReturnValue(true);
  f.queue.mockResolvedValue({ priorityEnabled: true, orders: [] });
  f.root.mockResolvedValue({ ref: "SX-2", accountId: "root-server-config" });
  f.list.mockResolvedValue([]);
  f.save.mockImplementation(async (v) => {
    parseBranchCommand(v);
    return { merchant_ref: v.merchantRef, revision: 1 };
  });
});
it("requires an authenticated session before any policy or queue data", async () => {
  f.authorize.mockResolvedValue(
    Response.json({ error: "auth" }, { status: 401 }),
  );
  for (const [handler, path] of [
    [subscriptionGET, "subscription-policy"],
    [queueGET, "dispatch-queue"],
    [adminGET, "admin/owned-restaurants"],
  ] as const)
    expect((await handler(req(path))).status).toBe(401);
  expect(f.policy).not.toHaveBeenCalled();
  expect(f.queue).not.toHaveBeenCalled();
  expect(f.root).not.toHaveBeenCalled();
});
it("subscription identity is server-derived and cannot be overridden by URL", async () => {
  const r = await subscriptionGET(req("subscription-policy"));
  expect(r.status).toBe(200);
  expect(r.headers.get("cache-control")).toBe("no-store");
  expect(f.policy).toHaveBeenCalledWith(user);
  expect(
    (
      await subscriptionGET(
        req("subscription-policy?ref=other&accountId=admin"),
      )
    ).status,
  ).toBe(400);
});
it("policy errors never fabricate a zero fee or confirmed payment", async () => {
  f.policy.mockRejectedValueOnce(
    new OwnedPolicyError("owned_root_unverified", 503),
  );
  const r = await subscriptionGET(req("subscription-policy"));
  expect(r.status).toBe(503);
  expect(await r.json()).toEqual({ ok: false, error: "owned_root_unverified" });
});
it("courier cannot use an operator waiting queue as a global customer-data feed", async () => {
  f.authorize.mockResolvedValue({ ...user, role: "courier" });
  expect((await queueGET(req("dispatch-queue"))).status).toBe(403);
  expect(f.queue).not.toHaveBeenCalled();
});
it("queue ignores no actor override and uses the original authorized principal", async () => {
  const r = await queueGET(req("dispatch-queue"));
  expect(r.status).toBe(200);
  expect(f.authorize).toHaveBeenCalledWith(expect.any(Request), "orders");
  expect(f.queue).toHaveBeenCalledWith(user);
  expect(r.headers.get("cache-control")).toBe("no-store");
  expect((await queueGET(req("dispatch-queue?companyRef=other"))).status).toBe(
    400,
  );
});
it("storage errors do not reveal SQL, customer data or secrets in queue output", async () => {
  f.queue.mockRejectedValue(Error("private SQL/password/customer"));
  const r = await queueGET(req("dispatch-queue"));
  expect(r.status).toBe(503);
  expect(await r.text()).not.toContain("private");
});
it("only platform admin may read or change verified branch policy", async () => {
  for (const role of ["merchant", "company", "courier"]) {
    f.authorize.mockResolvedValue({ ...user, role });
    expect((await adminGET(req("admin/owned-restaurants"))).status).toBe(403);
    expect(
      (await adminPOST(req("admin/owned-restaurants", JSON.stringify(body))))
        .status,
    ).toBe(403);
  }
  expect(f.root).not.toHaveBeenCalled();
  expect(f.save).not.toHaveBeenCalled();
});
it("admin saves audit actor from session, not from the body, with same-origin auth resource", async () => {
  const admin = { id: "server-admin", ref: "admin", role: "admin" };
  f.authorize.mockResolvedValue(admin);
  expect(
    (await adminPOST(req("admin/owned-restaurants", JSON.stringify(body))))
      .status,
  ).toBe(200);
  expect(f.authorize).toHaveBeenCalledWith(
    expect.any(Request),
    "admin/control",
  );
  expect(f.save).toHaveBeenCalledWith(body, "server-admin");
});
it("branch policy cannot be self-claimed by injecting fee/root/actor or omitting ownership attestation", async () => {
  f.authorize.mockResolvedValue({ ...user, role: "admin" });
  for (const bad of [
    { ...body, rootRef: "other" },
    { ...body, actorId: "owner" },
    { ...body, subscriptionExempt: true },
    { ...body, confirmOwnership: false },
  ])
    expect(
      (await adminPOST(req("admin/owned-restaurants", JSON.stringify(bad))))
        .status,
    ).toBe(400);
  expect(f.execute).not.toHaveBeenCalled();
});
it("malformed and oversized bodies are rejected before saving", async () => {
  f.authorize.mockResolvedValue({ ...user, role: "admin" });
  for (const raw of ["{", "x".repeat(20000)])
    expect((await adminPOST(req("admin/owned-restaurants", raw))).status).toBe(
      400,
    );
  expect(f.save).not.toHaveBeenCalled();
});
it("stale revision or unique branch collision produces reviewable conflicts, not leaked queries", async () => {
  f.authorize.mockResolvedValue({ ...user, role: "admin" });
  f.save.mockRejectedValueOnce(new OwnedPolicyError("settings_changed_reload"));
  expect(
    (await adminPOST(req("admin/owned-restaurants", JSON.stringify(body))))
      .status,
  ).toBe(409);
  f.save.mockRejectedValueOnce({
    cause: { code: "23505", message: "private SQL" },
  });
  const r = await adminPOST(
    req("admin/owned-restaurants", JSON.stringify(body)),
  );
  expect(r.status).toBe(409);
  expect(await r.json()).toEqual({
    ok: false,
    error: "branch_binding_conflict",
  });
});
it("disabled policy is reported without exposing or automatically creating branch bindings", async () => {
  f.authorize.mockResolvedValue({ ...user, role: "admin" });
  f.root.mockResolvedValue(null);
  const r = await adminGET(req("admin/owned-restaurants"));
  expect(await r.json()).toEqual({
    ok: true,
    enabled: false,
    root: null,
    branches: [],
  });
  expect(f.list).not.toHaveBeenCalled();
});
