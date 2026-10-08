import { NextResponse } from "next/server";
import { authorizeWasl } from "@/lib/wasl-access";
import { quoteWaslDelivery } from "@/lib/wasl-store";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
 const access = await authorizeWasl(request, "orders");
 if (access instanceof Response) return access;
 if (access.role !== "merchant") return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
 const zone = (new URL(request.url).searchParams.get("zone") || "").trim();
 if (zone.length < 2 || zone.length > 100) return NextResponse.json({ ok: false, error: "invalid_zone" }, { status: 400 });
 if (!access.zone || !access.address) return NextResponse.json({ ok: false, error: "pickup_required" }, { status: 409 });
 const { km, feeMin, feeMax } = quoteWaslDelivery(access.zone, zone);
 const fee = Math.max(feeMin, Math.min(feeMax, Math.round((feeMin + feeMax) / 10) * 5));
 return NextResponse.json({ ok: true, quote: { zone, km, feeMin, feeMax, fee } }, { headers: { "Cache-Control": "no-store" } });
}
