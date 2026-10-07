import { readJsonRecord, waslOrderSchema } from "@/lib/wasl-validation";
import { NextResponse } from "next/server";
import {
	createWaslOrder,
	listWaslOrders,
	waslOrderToClient,
} from "@/lib/wasl-store";

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const rows = await listWaslOrders(50);
		return NextResponse.json({ ok: true, orders: rows.map(waslOrderToClient) });
	} catch (error) {
		console.error("[wasl] list failed", error);
		return NextResponse.json(
			{ ok: false, error: "db_unavailable" },
			{ status: 503 },
		);
	}
}

export async function POST(request: Request) {
	let body: Record<string, unknown>;
	try {
		body = await readJsonRecord(request);
	} catch {
		return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
	}
	const parsed = waslOrderSchema.safeParse(body);
	if (!parsed.success)
		return NextResponse.json(
			{ ok: false, error: "invalid_fields" },
			{ status: 400 },
		);
	const input = parsed.data;

	try {
		const row = await createWaslOrder({
			...input,
			total: input.total ?? undefined,
			readyMinutes: input.readyMinutes ?? undefined,
		});
		return NextResponse.json({ ok: true, order: waslOrderToClient(row) });
	} catch (error) {
		console.error("[wasl] create failed", error);
		return NextResponse.json(
			{ ok: false, error: "db_unavailable" },
			{ status: 503 },
		);
	}
}
