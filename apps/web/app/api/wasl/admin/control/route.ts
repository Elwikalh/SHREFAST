import { readJsonRecord } from "@/lib/wasl-validation";
import { NextResponse } from "next/server";
import {
	getWaslPlatformSettings,
	listWaslCourierAccounts,
	saveWaslPlatformSettings,
	setWaslCourierAccountStatus,
	setWaslCourierAccountSubscription,
	waslCourierAccountToClient,
	type WaslPlatformSettings,
} from "@/lib/wasl-store";

export const dynamic = "force-dynamic";

export async function GET() {
	try {
		const [settings, accounts] = await Promise.all([
			getWaslPlatformSettings(),
			listWaslCourierAccounts(),
		]);
		return NextResponse.json({
			ok: true,
			settings,
			accounts: accounts.map(waslCourierAccountToClient),
		});
	} catch (error) {
		console.error("[admin-control] list failed", error);
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
	try {
		if (body.settings && typeof body.settings === "object") {
			const settings = await saveWaslPlatformSettings(
				body.settings as Partial<WaslPlatformSettings>,
			);
			return NextResponse.json({ ok: true, settings });
		}
		const ref = String(body.ref || "").trim();
		const action = String(body.action || "").trim();
		if (!ref || !action)
			return NextResponse.json(
				{ ok: false, error: "missing_fields" },
				{ status: 400 },
			);
		if (action === "activate" || action === "suspend") {
			const row = await setWaslCourierAccountStatus(
				ref,
				action === "activate" ? "active" : "suspended",
			);
			if (!row)
				return NextResponse.json(
					{ ok: false, error: "not_found" },
					{ status: 404 },
				);
			return NextResponse.json({
				ok: true,
				account: waslCourierAccountToClient(row),
			});
		}
		if (action === "grant_month" || action === "revoke_sub") {
			const row = await setWaslCourierAccountSubscription(
				ref,
				action === "grant_month",
			);
			if (!row)
				return NextResponse.json(
					{ ok: false, error: "not_found" },
					{ status: 404 },
				);
			return NextResponse.json({
				ok: true,
				account: waslCourierAccountToClient(row),
			});
		}
		return NextResponse.json(
			{ ok: false, error: "bad_action" },
			{ status: 400 },
		);
	} catch (error) {
		console.error("[admin-control] failed", error);
		return NextResponse.json(
			{ ok: false, error: "db_unavailable" },
			{ status: 503 },
		);
	}
}
