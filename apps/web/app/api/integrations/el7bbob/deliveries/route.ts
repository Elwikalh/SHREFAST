import {
  bridgeConfig,
  BridgeError,
  createBridgeOrder,
  readBridgeOrder,
  cancelBridgeOrder,
} from "@/lib/el7bbob-bridge";
import {
  parseEnvelope,
  readLimitedBody,
  verifySignature,
  UUID,
} from "@/lib/sharefast-protocol";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
const reply = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
async function handle(request: Request) {
  try {
    const { secret, merchantRef, companyRef } = bridgeConfig();
    const raw = await readLimitedBody(request);
    if (!verifySignature(secret, request, raw))
      return reply({ ok: false, error: "invalid_signature" }, 401);
    if (request.method === "POST") {
      const e = parseEnvelope(JSON.parse(raw));
      if (e.requestKind !== "standalone") throw Error("invalid_fields");
      if (!e.quote) return reply({ ok: false, error: "quote_required" }, 409);
      const r = await createBridgeOrder(e, merchantRef, companyRef);
      return reply({ ok: true, order: r.order }, r.created ? 201 : 200);
    }
    let id: unknown, branch: unknown;
    if (request.method === "GET") {
      const q = new URL(request.url).searchParams;
      if (
        [...q.keys()].some(
          (k) => !["externalOrderId", "branchCode"].includes(k),
        ) ||
        q.getAll("externalOrderId").length !== 1 ||
        q.getAll("branchCode").length !== 1
      )
        throw Error("invalid_fields");
      id = q.get("externalOrderId");
      branch = q.get("branchCode");
    } else {
      const v = JSON.parse(raw);
      if (
        !v ||
        typeof v !== "object" ||
        Array.isArray(v) ||
        Object.keys(v).sort().join(",") !== "branchCode,externalOrderId"
      )
        throw Error("invalid_fields");
      id = v.externalOrderId;
      branch = v.branchCode;
    }
    if (
      typeof id !== "string" ||
      !UUID.test(id) ||
      typeof branch !== "string" ||
      !branch.trim() ||
      branch.length > 80
    )
      throw Error("invalid_fields");
    const scope = { requestKind: "standalone" as const, branchCode: branch };
    const order =
      request.method === "GET"
        ? await readBridgeOrder(id, merchantRef, scope)
        : await cancelBridgeOrder(id, merchantRef, scope);
    return reply({ ok: true, order });
  } catch (e) {
    if (e instanceof BridgeError)
      return reply({ ok: false, error: e.code }, e.status);
    if (
      e instanceof SyntaxError ||
      e instanceof TypeError ||
      (e instanceof Error &&
        ["invalid_fields", "whole_egp_required", "body_too_large"].includes(
          e.message,
        ))
    )
      return reply({ ok: false, error: "invalid_fields" }, 400);
    return reply({ ok: false, error: "storage_unavailable" }, 503);
  }
}
export const POST = handle;
export const GET = handle;
export const PATCH = handle;
