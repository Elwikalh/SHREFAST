import { NextResponse } from "next/server"
import { waslPlatformStats } from "@/lib/wasl-store"

export const dynamic = "force-dynamic"

export async function GET() {
	try {
		const stats = await waslPlatformStats()
		return NextResponse.json({ ok: true, stats })
	} catch (error) {
		console.error("[wasl] stats failed", error)
		return NextResponse.json({ ok: false, error: "db_unavailable" }, { status: 503 })
	}
}
