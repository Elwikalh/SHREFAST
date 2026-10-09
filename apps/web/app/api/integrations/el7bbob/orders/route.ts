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
async function handle(request: Request): Promise<Response> {
  try {
    const { secret, merchantRef, companyRef, requireQuotes } = bridgeConfig();
    const raw = await readLimitedBody(request);
    if (!verifySignature(secret, request, raw))
      return reply({ ok: false, error: "invalid_signature" }, 401);
    if (request.method === "POST") {
      const envelope = parseEnvelope(JSON.parse(raw));
      if(envelope.requestKind)throw new Error("invalid_fields");
      if(requireQuotes&&!envelope.quote)return reply({ok:false,error:"quote_required"},409);
      const result = await createBridgeOrder(envelope, merchantRef, companyRef);
      return reply(
        { ok: true, order: result.order },
        result.created ? 201 : 200,
      );
    }
    let externalOrderId: unknown;
    if (request.method === "GET") {
      const u = new URL(request.url);
      if (
        [...u.searchParams.keys()].some((k) => k !== "externalOrderId") ||
        u.searchParams.getAll("externalOrderId").length !== 1
      )
        throw new Error("invalid_fields");
      externalOrderId = u.searchParams.get("externalOrderId");
    } else {
      const body: unknown = JSON.parse(raw);
      if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body) ||
        Object.keys(body).length !== 1
      )
        throw new Error("invalid_fields");
      externalOrderId = (body as Record<string, unknown>).externalOrderId;
    }
    if (typeof externalOrderId !== "string" || !UUID.test(externalOrderId))
      throw new Error("invalid_fields");
    const order =
      request.method === "GET"
        ? await readBridgeOrder(externalOrderId, merchantRef)
        : await cancelBridgeOrder(externalOrderId, merchantRef);
    return reply({ ok: true, order });
  } catch (error) {
    if (error instanceof BridgeError)
      return reply({ ok: false, error: error.code }, error.status);
    if (
      error instanceof SyntaxError ||
      error instanceof TypeError ||
      (error instanceof Error &&
        ["invalid_fields", "whole_egp_required", "body_too_large"].includes(
          error.message,
        ))
    )
      return reply({ ok: false, error: "invalid_fields" }, 400);
    // Do not log raw payloads, customer details or authentication headers.
    console.error("[el7bbob-bridge] storage operation failed");
    return reply({ ok: false, error: "storage_unavailable" }, 503);
  }
}
export const POST = handle;
export const GET = handle;
export const PATCH = handle;
