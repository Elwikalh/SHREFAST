import { NextResponse } from "next/server";
import { db } from "@el7bboB/db";
import { sql } from "drizzle-orm";
import { authorizeWasl, ownedCourier } from "@/lib/wasl-access";
import { readJsonRecord } from "@/lib/wasl-validation";
import { lockCourierAssignment, DispatchError } from "@/lib/courier-assignment-lock";
export async function POST(request: Request) {
	const user = await authorizeWasl(request, "company/assign");
	if (user instanceof Response) return user;
	try {
		const body = await readJsonRecord(request);
		const courier = await ownedCourier(user, String(body.courierRef || ""));
		if (!courier)
			return NextResponse.json(
				{ ok: false, error: "courier_not_found" },
				{ status: 404 },
			);
		if (courier.status !== "active")
			return NextResponse.json(
				{ ok: false, error: "courier_not_active" },
				{ status: 409 },
			);
		const result = await db.transaction(async tx => {
      await lockCourierAssignment(tx, courier.ref, String(body.orderRef || ""));
      const active = await tx.execute(sql`SELECT ref FROM wasl_couriers WHERE ref=${courier.ref} AND owner_ref=${user.ref} AND status='active' FOR SHARE`);
      if (!Array.isArray(active) || !active.length) throw new DispatchError("courier_not_active");
      return tx.execute(sql`UPDATE wasl_orders SET company_ref = ${user.ref}, courier_ref = ${courier.ref}, courier = ${courier.name}, status = 'accepted'
   WHERE ref = ${String(body.orderRef || "")} AND status = 'searching'
   AND (company_ref = ${user.ref} OR EXISTS (SELECT 1 FROM wasl_entities e JOIN wasl_client_invites ci ON ci.phone = e.phone AND ci.status = 'accepted' WHERE e.ref = wasl_orders.merchant_ref AND ci.company_ref = ${user.ref})) RETURNING ref`);
    });
		if (!Array.isArray(result) || !result.length)
			return NextResponse.json(
				{ ok: false, error: "order_not_found_or_conflict" },
				{ status: 409 },
			);
		return NextResponse.json({ ok: true, courier });
	} catch (error) {
    if (error instanceof DispatchError) return NextResponse.json({ok:false,error:error.code},{status:error.status});
		return NextResponse.json(
			{ ok: false, error: "db_unavailable" },
			{ status: 503 },
		);
	}
}
