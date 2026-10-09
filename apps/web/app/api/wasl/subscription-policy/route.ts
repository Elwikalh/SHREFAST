import { authorizeWasl } from "@/lib/wasl-access";
import {
  effectiveSubscription,
  ownedPolicyEnabled,
  OwnedPolicyError,
} from "@/lib/owned-restaurant-policy";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const access = await authorizeWasl(request, "subscription-policy");
  if (access instanceof Response) return access;
  const reply = (body: unknown, status = 200) =>
    Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
  if (new URL(request.url).searchParams.size)
    return reply({ ok: false, error: "invalid_fields" }, 400);
  try {
    return reply({
      ok: true,
      policyEnabled: ownedPolicyEnabled(),
      policy: await effectiveSubscription(access),
    });
  } catch (e) {
    return reply(
      {
        ok: false,
        error: e instanceof OwnedPolicyError ? e.code : "policy_unavailable",
      },
      e instanceof OwnedPolicyError ? e.status : 503,
    );
  }
}
