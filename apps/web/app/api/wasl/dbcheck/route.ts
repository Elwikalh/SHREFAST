import { NextResponse } from "next/server"
import { db, bootstrapDatabase } from "@el7bboB/db"
import { sql } from "drizzle-orm"

export const dynamic = "force-dynamic"

// فاحص تشخيصي مؤقت بموافقة صاحب الحساب: فحص الاتصال + إنشاء الجداول
// (bootstrapDatabase) مع تقرير الخطأ إن وجد — دون كشف أي بيانات سرية.
export async function GET() {
	const url = process.env.DATABASE_URL
	if (!url) {
		return NextResponse.json({ ok: true, configured: false, hint: "DATABASE_URL غير موجودة" })
	}
	let info: Record<string, unknown>
	try {
		const u = new URL(url)
		info = { host: u.hostname, port: u.port || "5432", database: u.pathname.replace(/^\//, ""), user: u.username ? u.username.slice(0,3)+"***" : "(فارغ)" }
	} catch {
		return NextResponse.json({ ok: true, configured: true, valid: false, hint: "رابط غير صالح", starts: url.slice(0,12) })
	}
	let server = ""
	try {
		const res = await db.execute(sql`select version() as v`)
		const rows = (res as unknown as { rows?: { v?: string }[] }).rows ?? (res as unknown as { v?: string }[])
		const first = Array.isArray(rows) ? rows[0] : undefined
		server = String(first?.v ?? "").slice(0, 30)
	} catch (e) {
		const err = e as Error
		return NextResponse.json({ ok: true, configured: true, valid: false, info, error: "connect: "+String(err?.message || e).slice(0, 200) })
	}
	try {
		await bootstrapDatabase()
		return NextResponse.json({ ok: true, configured: true, valid: true, info, server, bootstrapped: true })
	} catch (e) {
		const err = e as Error
		return NextResponse.json({
			ok: true,
			configured: true,
			valid: true,
			info,
			server,
			bootstrapped: false,
			bootstrapError: String(err?.message || e).slice(0, 300),
		})
	}
}
