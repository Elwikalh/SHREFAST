import { authorizeWasl } from "@/lib/wasl-access";
import { readJsonRecord } from "@/lib/wasl-validation";
import { NextResponse } from "next/server";
import {
	listWaslInbox,
	markWaslInboxHandled,
	waslInboxToClient,
} from "@/lib/wasl-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	const access = await authorizeWasl(request, "inbox");
	if (access instanceof Response) return access;
	try {
		const rows = await listWaslInbox(30);
		return NextResponse.json({
			ok: true,
			messages: rows.map(waslInboxToClient),
		});
	} catch (error) {
		console.error("[wasl] inbox list failed", error);
		return NextResponse.json(
			{ ok: false, error: "db_unavailable" },
			{ status: 503 },
		);
	}
}

export async function POST(request: Request) {
	const access = await authorizeWasl(request, "inbox");
	if (access instanceof Response) return access;
	let body: Record<string, unknown>;
	try {
		body = await readJsonRecord(request);
	} catch {
		return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
	}
	const ref = String(body.ref || "").trim();
	if (!ref)
		return NextResponse.json(
			{ ok: false, error: "missing_ref" },
			{ status: 400 },
		);
	const orderRef =
		body.orderRef === undefined || body.orderRef === null
			? undefined
			: String(body.orderRef);
	try {
		const row = await markWaslInboxHandled(ref, orderRef);
		if (!row)
			return NextResponse.json(
				{ ok: false, error: "not_found" },
				{ status: 404 },
			);
		return NextResponse.json({ ok: true, message: waslInboxToClient(row) });
	} catch (error) {
		console.error("[wasl] inbox update failed", error);
		return NextResponse.json(
			{ ok: false, error: "db_unavailable" },
			{ status: 503 },
		);
	}
}
