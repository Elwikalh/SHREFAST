import { NextResponse } from "next/server";
import { registrationSchema } from "@/lib/wasl-auth-schema";
import { readJsonRecord } from "@/lib/wasl-validation";
import {
	assertSameOrigin,
	rateLimit,
	registerAccount,
	createSession,
	setSessionCookie,
} from "@/lib/wasl-auth";
import { authFailure } from "@/lib/wasl-auth-response";
export async function POST(request: Request) {
	try {
		assertSameOrigin(request);
		const parsed = registrationSchema.safeParse(await readJsonRecord(request));
		if (!parsed.success)
			return NextResponse.json(
				{
					ok: false,
					error: "invalid_fields",
					fields: Object.fromEntries(
						parsed.error.issues.map((x) => [x.path[0] || "form", x.message]),
					),
				},
				{ status: 400 },
			);
		await rateLimit(request, "register", parsed.data.phone);
		const account = await registerAccount(parsed.data);
		const token = await createSession(account.id);
		const response = NextResponse.json(
			{
				ok: true,
				user: {
					id: account.id,
					ref: account.entity_ref || account.courier_ref,
					role: account.role,
					name: account.name,
				},
				redirect: "/wasl",
			},
			{ status: 201, headers: { "Cache-Control": "no-store" } },
		);
		setSessionCookie(response, token);
		return response;
	} catch (error) {
		return authFailure(error);
	}
}
