import { authorizeWasl } from "@/lib/wasl-access";
import { readLimitedBody } from "@/lib/sharefast-protocol";
import {
  verifiedOwnedRoot,
  listOwnedBranches,
  saveOwnedBranch,
  OwnedPolicyError,
} from "@/lib/owned-restaurant-policy";
export const dynamic = "force-dynamic";
const reply = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
async function handle(request: Request) {
  const access = await authorizeWasl(request, "admin/control");
  if (access instanceof Response) return access;
  if (access.role !== "admin")
    return reply({ ok: false, error: "forbidden" }, 403);
  if (new URL(request.url).searchParams.size)
    return reply({ ok: false, error: "invalid_fields" }, 400);
  try {
    if (request.method === "GET") {
      const root = await verifiedOwnedRoot();
      return reply({
        ok: true,
        enabled: !!root,
        root,
        branches: root ? await listOwnedBranches(root) : [],
      });
    }
    return reply({
      ok: true,
      branch: await saveOwnedBranch(
        JSON.parse(await readLimitedBody(request)),
        access.id,
      ),
    });
  } catch (e) {
    if (e instanceof OwnedPolicyError)
      return reply({ ok: false, error: e.code }, e.status);
    if (
      e instanceof SyntaxError ||
      (e instanceof Error && e.message === "body_too_large")
    )
      return reply({ ok: false, error: "invalid_fields" }, 400);
    const code =
      (e as { code?: string; cause?: { code?: string } })?.code ||
      (e as { cause?: { code?: string } })?.cause?.code;
    return reply(
      {
        ok: false,
        error:
          code === "23505" ? "branch_binding_conflict" : "policy_unavailable",
      },
      code === "23505" ? 409 : 503,
    );
  }
}
export const GET = handle;
export const POST = handle;
