import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/wasl-auth-schema";
import { readJsonRecord } from "@/lib/wasl-validation";
import {
	assertSameOrigin,
	rateLimit,
	loginAccount,
	createSession,
	setSessionCookie,
} from "@/lib/wasl-auth";
import { authFailure } from "@/lib/wasl-auth-response";
export async function POST(request: Request) {
	try {
		assertSameOrigin(request);
		const parsed = loginSchema.safeParse(await readJsonRecord(request));
		if (!parsed.success)
			return NextResponse.json(
				{ ok: false, error: "invalid_fields" },
				{ status: 400 },
			);
		await rateLimit(request, "login", parsed.data.phone);
		const account = await loginAccount(parsed.data);
		const response = NextResponse.json(
			{ ok: true, redirect: "/wasl" },
			{ headers: { "Cache-Control": "no-store" } },
		);
		setSessionCookie(response, await createSession(account.id));
		return response;
	} catch (error) {
		return authFailure(error);
	}
}
