import { NextResponse } from "next/server"
import { db } from "@el7bboB/db"
import { sql } from "drizzle-orm"

export const dynamic = "force-dynamic"

// فاحص تشخيصي مؤقت بموافقة صاحب الحساب: يوضح هل DATABASE_URL واصلة للخدمة
// وصالحة أم لا — دون كشف أي بيانات سرية (المستخدم مُقنَّع، ولا يُعرض الباسورد إطلاقًا).
export async function GET() {
	const url = process.env.DATABASE_URL
	if (!url) {
		return NextResponse.json({
			ok: true,
			configured: false,
			hint: "DATABASE_URL غير موجودة في متغيرات هذه الخدمة",
		})
	}
	let info: Record<string, unknown>
	try {
		const u = new URL(url)
		info = {
			host: u.hostname,
			port: u.port || "5432",
			database: u.pathname.replace(/^\//, ""),
			user: u.username ? u.username.slice(0, 3) + "***" : "(فارغ)",
			sslmode: u.searchParams.get("sslmode"),
			looksLikeLiteralReference: url.includes("${{"),
		}
	} catch {
		return NextResponse.json({
			ok: true,
			configured: true,
			valid: false,
			hint: "DATABASE_URL موجودة لكنها ليست رابط postgres صحيحًا",
			starts: url.slice(0, 12),
		})
	}
	try {
		const res = await db.execute(sql`select version() as v`)
		const rows = (res as unknown as { rows?: { v?: string }[] }).rows ?? (res as unknown as { v?: string }[])
		const first = Array.isArray(rows) ? rows[0] : undefined
		return NextResponse.json({
			ok: true,
			configured: true,
			valid: true,
			info,
			server: String(first?.v ?? "").slice(0, 30),
		})
	} catch (e) {
		const err = e as Error
		return NextResponse.json({
			ok: true,
			configured: true,
			valid: false,
			info,
			error: String(err?.message || e).slice(0, 220),
		})
	}
}
