import { bridgeConfig, BridgeError } from "@/lib/el7bbob-bridge";
import {
  issueBridgeQuote,
  readBridgeQuote,
  QuoteError,
} from "@/lib/el7bbob-quotes";
import {
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
    const { secret, merchantRef } = bridgeConfig();
    const raw = await readLimitedBody(request);
    if (!verifySignature(secret, request, raw))
      return reply({ ok: false, error: "invalid_signature" }, 401);
    if (request.method === "GET") {
      const params = new URL(request.url).searchParams;
      const id = params.get("id");
      if (
        [...params.keys()].some((k) => k !== "id") ||
        params.getAll("id").length !== 1 ||
        !id ||
        !UUID.test(id)
      )
        throw Error("invalid_fields");
      return reply({ ok: true, quote: await readBridgeQuote(id, merchantRef) });
    }
    const v = JSON.parse(raw);
    if (
      !v ||
      typeof v !== "object" ||
      Array.isArray(v) ||
      Object.keys(v).sort().join(",") !== "branchCode,destZone" ||
      typeof v.branchCode !== "string" ||
      !v.branchCode.trim() ||
      v.branchCode.length > 80 ||
      typeof v.destZone !== "string" ||
      !v.destZone.trim() ||
      v.destZone.length > 100
    )
      throw Error("invalid_fields");
    return reply(
      {
        ok: true,
        quote: await issueBridgeQuote(v.branchCode, v.destZone, merchantRef),
      },
      201,
    );
  } catch (e) {
    if (e instanceof QuoteError || e instanceof BridgeError)
      return reply({ ok: false, error: e.code }, e.status);
    if (
      e instanceof SyntaxError ||
      (e instanceof Error &&
        ["invalid_fields", "body_too_large"].includes(e.message))
    )
      return reply({ ok: false, error: "invalid_fields" }, 400);
    return reply({ ok: false, error: "storage_unavailable" }, 503);
  }
}
export const POST = handle;
export const GET = handle;
