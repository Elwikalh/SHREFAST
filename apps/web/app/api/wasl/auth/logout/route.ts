import { NextResponse } from "next/server";
import { assertSameOrigin, cookieName, destroySession } from "@/lib/wasl-auth";
import { authFailure } from "@/lib/wasl-auth-response";
export async function POST(request: Request) {
	try {
		assertSameOrigin(request);
		await destroySession(request);
		const response = NextResponse.json(
			{ ok: true },
			{ headers: { "Cache-Control": "no-store" } },
		);
		response.cookies.set(cookieName(), "", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			maxAge: 0,
		});
		return response;
	} catch (error) {
		return authFailure(error);
	}
}
