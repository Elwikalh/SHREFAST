import { sql } from "drizzle-orm";
import { db } from "@el7bboB/db";
import { authorizeWasl, scopedOrders } from "@/lib/wasl-access";
import { ensureBridgeTables } from "@/lib/el7bbob-bridge";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const user = await authorizeWasl(request,"orders");
  if (user instanceof Response) return user;
  if (user.role !== "courier") return Response.json({ok:false,error:"forbidden"},{status:403});
  const reply = (body:unknown,status=200) => Response.json(body,{status,headers:{"Cache-Control":"no-store"}});
  if (process.env.SHAREFAST_EL7BBOB_ENABLED !== "true") return reply({ok:true,enabled:false,orders:[]});
  try {
    await ensureBridgeTables();
    const authorized = (await scopedOrders(user)).filter(o=>!["canceled","delivered","refused","no_answer"].includes(o.status)).map(o=>o.ref);
    if (!authorized.length) return reply({ok:true,enabled:true,orders:[]});
    const result = await db.execute(sql`SELECT l.order_ref AS ref,l.preparation,e.id::text AS "eventId",e.ready_at::text AS "readyAt" FROM sharefast_el7bbob_links l LEFT JOIN sharefast_preparation_events e ON e.external_order_id=l.external_order_id WHERE NOT l.cancel_requested AND l.order_ref IN (SELECT jsonb_array_elements_text(${JSON.stringify(authorized)}::jsonb))`);
    const orders=Array.isArray(result)?result:(result as {rows:unknown[]}).rows;
    return reply({ok:true,enabled:true,orders});
  } catch { return reply({ok:false,error:"storage_unavailable"},503); }
}
