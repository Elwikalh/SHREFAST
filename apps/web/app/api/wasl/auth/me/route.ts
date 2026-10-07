import { NextResponse } from "next/server";
import { getPrincipal } from "@/lib/wasl-auth";
import { authFailure } from "@/lib/wasl-auth-response";
export async function GET(request: Request) {
	try {
		const user = await getPrincipal(request);
		return NextResponse.json(
			{ ok: !!user, user },
			{ status: user ? 200 : 401, headers: { "Cache-Control": "no-store" } },
		);
	} catch (error) {
		return authFailure(error);
	}
}
