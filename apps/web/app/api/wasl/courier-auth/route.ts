import { readJsonRecord, courierCanWork } from "@/lib/wasl-validation";
import { NextResponse } from "next/server";
import {
	createWaslCourierAccount,
	getWaslCourierAccount,
	getWaslPlatformSettings,
	verifyWaslCourierLogin,
	waslCourierAccountToClient,
} from "@/lib/wasl-store";

export const dynamic = "force-dynamic";

type Body = Record<string, unknown>;

async function readBody(request: Request): Promise<Body> {
	try {
		return await readJsonRecord(request);
	} catch {
		return {};
	}
}

export async function GET(request: Request) {
	// تحديث حالة الحساب والاشتراك — التطبيق بيستدعيها دوريًا عشان أي تغيير من الإدارة يوصله
	const url = new URL(request.url);
	const ref = String(url.searchParams.get("ref") || "").trim();
	if (!ref)
		return NextResponse.json(
			{ ok: false, error: "missing_ref" },
			{ status: 400 },
		);
	const account = await getWaslCourierAccount(ref);
	if (!account)
		return NextResponse.json(
			{ ok: false, error: "not_found" },
			{ status: 404 },
		);
	const settings = (await getWaslPlatformSettings()).courier;
	return NextResponse.json({
		ok: true,
		account: waslCourierAccountToClient(account),
		canWork: courierCanWork(account, settings),
		subRequired: settings.enabled,
		monthlyFee: settings.monthlyFee,
	});
}

export async function POST(request: Request) {
	const body = await readBody(request);
	const action = String(body.action || "");
	try {
		if (action === "register") {
			const name = String(body.name || "").trim();
			const phone = String(body.phone || "").replace(/\D/g, "");
			const password = String(body.password || "");
			const nationalId = String(body.nationalId || "").replace(/\D/g, "");
			const vehicle = ["moto", "bike", "car"].includes(String(body.vehicle))
				? String(body.vehicle)
				: "moto";
			const governorate = String(body.governorate || "").trim();
			const zone = String(body.zone || "").trim();
			if (name.length < 3)
				return NextResponse.json(
					{ ok: false, error: "bad_name" },
					{ status: 400 },
				);
			if (!/^01\d{9}$/.test(phone))
				return NextResponse.json(
					{ ok: false, error: "bad_phone" },
					{ status: 400 },
				);
			if (password.length < 6 || password.length > 128)
				return NextResponse.json(
					{ ok: false, error: "bad_password" },
					{ status: 400 },
				);
			if (nationalId.length !== 14)
				return NextResponse.json(
					{ ok: false, error: "bad_national_id" },
					{ status: 400 },
				);
			if (!governorate || !zone)
				return NextResponse.json(
					{ ok: false, error: "bad_zone" },
					{ status: 400 },
				);
			try {
				const account = await createWaslCourierAccount({
					name,
					phone,
					password,
					nationalId,
					vehicle,
					governorate,
					zone,
				});
				const settings = (await getWaslPlatformSettings()).courier;
				return NextResponse.json({
					ok: true,
					account: waslCourierAccountToClient(account),
					canWork: courierCanWork(account, settings),
					subRequired: settings.enabled,
					monthlyFee: settings.monthlyFee,
				});
			} catch (error) {
				// تعارض الرقم الوحيد: الحساب مسجل من قبل — العميل يسجل دخول بدل إعادة التسجيل
				const message = error instanceof Error ? error.message : "";
				if (/unique|duplicate|uq_/i.test(message) || /23505/.test(message)) {
					return NextResponse.json(
						{ ok: false, error: "phone_taken" },
						{ status: 409 },
					);
				}
				throw error;
			}
		}
		if (action === "login") {
			const phone = String(body.phone || "").replace(/\D/g, "");
			const password = String(body.password || "");
			if (password.length > 128)
				return NextResponse.json(
					{ ok: false, error: "bad_credentials" },
					{ status: 401 },
				);
			const account = await verifyWaslCourierLogin(phone, password);
			if (!account)
				return NextResponse.json(
					{ ok: false, error: "bad_credentials" },
					{ status: 401 },
				);
			const settings = (await getWaslPlatformSettings()).courier;
			return NextResponse.json({
				ok: true,
				account: waslCourierAccountToClient(account),
				canWork: courierCanWork(account, settings),
				subRequired: settings.enabled,
				monthlyFee: settings.monthlyFee,
			});
		}
		return NextResponse.json(
			{ ok: false, error: "bad_action" },
			{ status: 400 },
		);
	} catch (error) {
		console.error("[courier-auth] failed", error);
		return NextResponse.json(
			{ ok: false, error: "db_unavailable" },
			{ status: 503 },
		);
	}
}
