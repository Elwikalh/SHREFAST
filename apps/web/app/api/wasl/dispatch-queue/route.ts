import { authorizeWasl } from "@/lib/wasl-access";
import { waitingDispatchQueue } from "@/lib/dispatch-queue";
import { OwnedPolicyError } from "@/lib/owned-restaurant-policy";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const access = await authorizeWasl(request, "orders");
  if (access instanceof Response) return access;
  const reply = (body: unknown, status = 200) =>
    Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
  if (!["admin", "merchant", "company"].includes(access.role))
    return reply({ ok: false, error: "forbidden" }, 403);
  if (new URL(request.url).searchParams.size)
    return reply({ ok: false, error: "invalid_fields" }, 400);
  try {
    return reply({ ok: true, ...(await waitingDispatchQueue(access)) });
  } catch (e) {
    return reply(
      {
        ok: false,
        error: e instanceof OwnedPolicyError ? e.code : "queue_unavailable",
      },
      e instanceof OwnedPolicyError ? e.status : 503,
    );
  }
}
