import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@el7bboB/db";
import { authorizeWasl, ownedCourier } from "@/lib/wasl-access";
import { readJsonRecord, courierCanWork } from "@/lib/wasl-validation";
import { lockCourierAssignment, DispatchError } from "@/lib/courier-assignment-lock";
import {
	waslOrderToClient,
	ensureCourierTables,
	getWaslCourierAccount,
	getWaslPlatformSettings,
	type WaslOrderRow,
} from "@/lib/wasl-store";
export const dynamic = "force-dynamic";
const transitions: Record<string, string[]> = {
	searching: ["accepted", "canceled"],
	accepted: ["pickup", "canceled"],
	pickup: ["heading", "canceled"],
	heading: ["arrived"],
	arrived: ["delivered", "refused", "no_answer"],
};
export async function POST(request: Request) {
	const user = await authorizeWasl(request, "advance");
	if (user instanceof Response) return user;
	try {
		if (user.role === "courier") {
			const account = await getWaslCourierAccount(user.ref),
				settings = (await getWaslPlatformSettings()).courier;
			if (!account || !courierCanWork(account, settings))
				return NextResponse.json(
					{ ok: false, error: "courier_not_eligible" },
					{ status: 403 },
				);
		}
		const body = await readJsonRecord(request),
			ref = String(body.ref || ""),
			status = String(body.status || "");
		const allowedFrom = Object.keys(transitions).filter((key) =>
			transitions[key]?.includes(status),
		);
		if (!ref || !allowedFrom.length)
			return NextResponse.json(
				{ ok: false, error: "bad_status" },
				{ status: 400 },
			);
		let courierRef: string | null = user.role === "courier" ? user.ref : null,
			courierName: string | null = user.role === "courier" ? user.name : null;
		if (user.role === "merchant" || user.role === "company") {
			if (status === "accepted") {
				const courier = await ownedCourier(user, String(body.courierRef || ""));
				if (!courier || courier.status !== "active")
					return NextResponse.json(
						{ ok: false, error: "courier_not_active" },
						{ status: 409 },
					);
				courierRef = courier.ref;
				courierName = courier.name;
			} else if (status !== "canceled")
				return NextResponse.json(
					{ ok: false, error: "forbidden" },
					{ status: 403 },
				);
		}
		await ensureCourierTables();
		const owner =
			user.role === "admin"
				? sql`TRUE`
				: user.role === "merchant"
					? sql`merchant_ref = ${user.ref}`
					: user.role === "company"
						? sql`company_ref = ${user.ref}`
						: sql`courier_ref = ${user.ref} OR EXISTS (SELECT 1 FROM wasl_couriers c WHERE c.ref = wasl_orders.courier_ref AND c.account_id = ${user.id} AND c.status = 'active')`;
		const result = await db.transaction(async tx => {
      if (status === "accepted" && courierRef) await lockCourierAssignment(tx, courierRef, ref);
      if (status === "accepted" && courierRef && (user.role === "merchant" || user.role === "company")) {
        const active = await tx.execute(sql`SELECT ref FROM wasl_couriers WHERE ref=${courierRef} AND owner_ref=${user.ref} AND status='active' FOR SHARE`);
        if (!Array.isArray(active) || !active.length) throw new DispatchError("courier_not_active");
      }
      return tx.execute(sql`UPDATE wasl_orders SET status = ${status},
   courier_ref = COALESCE(${courierRef}, courier_ref), courier = COALESCE(${courierName}, courier)
   ${status === "arrived" ? sql`, arrived_at = now()` : sql``}
   ${["delivered", "refused", "no_answer"].includes(status) ? sql`, outcome = ${status}` : sql``}
   WHERE ref = ${ref} AND (${owner}) AND status IN (${sql.join(
			allowedFrom.map((x) => sql`${x}`),
			sql`, `,
		)}) RETURNING *`);
    });
		const row = Array.isArray(result)
			? (result[0] as WaslOrderRow | undefined)
			: undefined;
		if (!row)
			return NextResponse.json(
				{ ok: false, error: "order_conflict_or_forbidden" },
				{ status: 409 },
			);
		return NextResponse.json({ ok: true, order: waslOrderToClient(row) });
	} catch (error) {
    if (error instanceof DispatchError) return NextResponse.json({ok:false,error:error.code},{status:error.status});
		return NextResponse.json(
			{ ok: false, error: "db_unavailable" },
			{ status: 503 },
		);
	}
}
