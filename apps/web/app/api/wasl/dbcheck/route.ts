import { NextResponse } from "next/server"
import postgres from "postgres"

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
	const sql = postgres(url, { max: 1, connect_timeout: 5, idle_timeout: 5 })
	try {
		const v = await sql`select version()`
		return NextResponse.json({
			ok: true,
			configured: true,
			valid: true,
			info,
			server: String(v[0].version).slice(0, 30),
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
	} finally {
		try { await sql.end({ timeout: 2 }) } catch {}
	}
}
