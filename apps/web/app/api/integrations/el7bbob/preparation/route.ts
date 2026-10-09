import { bridgeConfig, BridgeError } from "@/lib/el7bbob-bridge";
import { markBridgeOrderReady } from "@/lib/el7bbob-preparation";
import { readLimitedBody, verifySignature, UUID } from "@/lib/sharefast-protocol";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
  try {
    const { secret, merchantRef } = bridgeConfig();
    const raw = await readLimitedBody(request);
    if (!verifySignature(secret, request, raw)) return reply({ok:false,error:"invalid_signature"},401);
    const body = JSON.parse(raw);
    if (!body || typeof body !== "object" || Array.isArray(body) || Object.keys(body).length !== 2 || body.state !== "ready" || typeof body.externalOrderId !== "string" || !UUID.test(body.externalOrderId)) return reply({ok:false,error:"invalid_fields"},400);
    return reply({ok:true,preparation:await markBridgeOrderReady(body.externalOrderId,merchantRef)});
  } catch (e) {
    if (e instanceof BridgeError) return reply({ok:false,error:e.code},e.status);
    if (e instanceof SyntaxError || e instanceof Error && e.message === "body_too_large") return reply({ok:false,error:"invalid_fields"},400);
    return reply({ok:false,error:"storage_unavailable"},503);
  }
}
