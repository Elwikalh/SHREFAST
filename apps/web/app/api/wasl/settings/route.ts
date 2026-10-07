import { readJsonRecord } from "@/lib/wasl-validation";
import { NextResponse } from "next/server";
import { getWaslSetting, setWaslSetting } from "@/lib/wasl-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	const key = new URL(request.url).searchParams.get("key") || "";
	if (!key)
		return NextResponse.json(
			{ ok: false, error: "invalid_fields" },
			{ status: 400 },
		);
	try {
		const value = await getWaslSetting(key);
		return NextResponse.json({ ok: true, value });
	} catch (error) {
		console.error("[wasl] settings get failed", error);
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
	const key = String(body.key || "").trim();
	if (!key || key.length > 120)
		return NextResponse.json(
			{ ok: false, error: "invalid_fields" },
			{ status: 400 },
		);
	try {
		await setWaslSetting(key, body.value);
		return NextResponse.json({ ok: true });
	} catch (error) {
		console.error("[wasl] settings set failed", error);
		return NextResponse.json(
			{ ok: false, error: "db_unavailable" },
			{ status: 503 },
		);
	}
}
