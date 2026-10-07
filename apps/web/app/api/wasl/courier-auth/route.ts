import { authorizeWasl } from "@/lib/wasl-access";
import { courierCanWork } from "@/lib/wasl-validation";
import { NextResponse } from "next/server";
import {
	getWaslCourierAccount,
	getWaslPlatformSettings,
	waslCourierAccountToClient,
} from "@/lib/wasl-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	const access = await authorizeWasl(request, "courier-auth");
	if (access instanceof Response) return access;
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

export async function POST() {
	return NextResponse.json(
		{ ok: false, error: "use_auth_login", redirect: "/login?role=courier" },
		{ status: 410 },
	);
}
