import { authorizeWasl } from "@/lib/wasl-access";
import { readJsonRecord } from "@/lib/wasl-validation";
import { NextResponse } from "next/server";
import {
	createWaslPartnership,
	getWaslPartnership,
	listWaslPartnerships,
	partnershipUsageCounts,
} from "@/lib/wasl-store";

export const dynamic = "force-dynamic";

type PartnershipClient = {
	ref: string;
	name: string;
	zone: string;
	governorate: string;
	founderRef: string;
	courierCount: number;
	monthlySalary: number;
	created: Date;
	members: { ref: string; name: string; sharePct: number }[];
	usage?: { entity_ref: string; entity_name: string; order_count: number }[];
};

function partnershipToClient(
	p: Awaited<ReturnType<typeof getWaslPartnership>>,
): PartnershipClient | null {
	if (!p) return null;
	const { partnership, members } = p;
	return {
		ref: partnership.ref,
		name: partnership.name,
		zone: partnership.zone,
		governorate: partnership.governorate,
		founderRef: partnership.founder_ref,
		courierCount: partnership.courier_count,
		monthlySalary: partnership.monthly_salary,
		created: partnership.created_at,
		members: members.map((m) => ({
			ref: m.entity_ref,
			name: m.entity_name,
			sharePct: m.share_pct,
		})),
	};
}

export async function GET(request: Request) {
	const access = await authorizeWasl(request, "partnerships");
	if (access instanceof Response) return access;
	const zone = new URL(request.url).searchParams.get("zone") || undefined;
	try {
		const rows = await listWaslPartnerships(zone);
		const partnerships = [];
		for (const row of rows) {
			const full = await getWaslPartnership(row.ref);
			if (
				access.role !== "admin" &&
				full &&
				full.partnership.founder_ref !== access.ref &&
				!full.members.some((m) => m.entity_ref === access.ref)
			)
				continue;
			const client = partnershipToClient(full);
			if (client) {
				client.usage = await partnershipUsageCounts(row.ref);
				partnerships.push(client);
			}
		}
		return NextResponse.json({ ok: true, partnerships });
	} catch (error) {
		console.error("[wasl] partnerships list failed", error);
		return NextResponse.json(
			{ ok: false, error: "db_unavailable" },
			{ status: 503 },
		);
	}
}

export async function POST(request: Request) {
	const access = await authorizeWasl(request, "partnerships");
	if (access instanceof Response) return access;
	let body: Record<string, unknown>;
	try {
		body = await readJsonRecord(request);
	} catch {
		return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
	}
	const founderRef = String(body.founderRef || "").trim();
	const zone = String(body.zone || "").trim();
	const governorate = String(body.governorate || "").trim();
	if (!founderRef || !zone || !governorate) {
		return NextResponse.json(
			{ ok: false, error: "invalid_fields" },
			{ status: 400 },
		);
	}
	try {
		const { partnership, created } = await createWaslPartnership({
			founderRef,
			name: body.name ? String(body.name) : undefined,
			zone,
			governorate,
			courierCount: body.courierCount ? Number(body.courierCount) : undefined,
			monthlySalary: body.monthlySalary
				? Number(body.monthlySalary)
				: undefined,
		});
		return NextResponse.json({
			ok: true,
			created,
			partnership: { ref: partnership.ref, name: partnership.name },
		});
	} catch (error) {
		const message = error instanceof Error ? error.message : "db_unavailable";
		if (message === "founder_not_found") {
			return NextResponse.json({ ok: false, error: message }, { status: 404 });
		}
		console.error("[wasl] partnership create failed", error);
		return NextResponse.json(
			{ ok: false, error: "db_unavailable" },
			{ status: 503 },
		);
	}
}
