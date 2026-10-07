import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@el7bboB/db";
import { authorizeWasl, scopedOrders } from "@/lib/wasl-access";
import { readJsonRecord, waslOrderSchema } from "@/lib/wasl-validation";
import { createWaslOrder, waslOrderToClient } from "@/lib/wasl-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
	const access = await authorizeWasl(request, "orders");
	if (access instanceof Response) return access;
	try {
		return NextResponse.json(
			{ ok: true, orders: (await scopedOrders(access)).map(waslOrderToClient) },
			{ headers: { "Cache-Control": "no-store" } },
		);
	} catch {
		return NextResponse.json(
			{ ok: false, error: "db_unavailable" },
			{ status: 503 },
		);
	}
}
export async function POST(request: Request) {
	const access = await authorizeWasl(request, "orders");
	if (access instanceof Response) return access;
	if (access.role !== "merchant")
		return NextResponse.json(
			{ ok: false, error: "forbidden" },
			{ status: 403 },
		);
	try {
		const body = await readJsonRecord(request);
		const parsed = waslOrderSchema.safeParse({
			...body,
			merchant: access.name,
			merchantZone: access.zone,
			fromAddr: access.address,
		});
		if (!parsed.success)
			return NextResponse.json(
				{ ok: false, error: "invalid_fields" },
				{ status: 400 },
			);
		// Resolve ownership before the single INSERT: do not report failure after saving an order.
		const companies = await db.execute(
			sql`SELECT company_ref FROM wasl_client_invites WHERE phone = ${access.phone} AND status = 'accepted' ORDER BY responded_at DESC LIMIT 1`,
		);
		const companyRows = Array.isArray(companies)
			? companies
			: (companies as { rows: { company_ref: string }[] }).rows;
		const companyRef = (companyRows[0] as { company_ref?: string })
			?.company_ref;
		const row = await createWaslOrder({
			...parsed.data,
			total: parsed.data.total ?? undefined,
			readyMinutes: parsed.data.readyMinutes ?? undefined,
			merchantRef: access.ref,
			companyRef,
		});
		return NextResponse.json(
			{ ok: true, order: waslOrderToClient(row) },
			{ status: 201 },
		);
	} catch {
		return NextResponse.json(
			{ ok: false, error: "db_unavailable" },
			{ status: 503 },
		);
	}
}
