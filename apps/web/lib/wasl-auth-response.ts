import { NextResponse } from "next/server";
import { AuthError } from "./wasl-auth";
export function authFailure(error: unknown) {
	if (
		error instanceof SyntaxError ||
		(error instanceof Error && error.message === "bad_json")
	)
		return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
	if (error instanceof AuthError)
		return NextResponse.json(
			{ ok: false, error: error.code },
			{
				status: error.status,
				headers: {
					"Cache-Control": "no-store",
					...(error.status === 429 ? { "Retry-After": "900" } : {}),
				},
			},
		);
	console.error(
		"[auth] request failed",
		error instanceof Error ? error.name : "UnknownError",
	);
	return NextResponse.json(
		{ ok: false, error: "service_unavailable" },
		{ status: 503, headers: { "Cache-Control": "no-store" } },
	);
}
