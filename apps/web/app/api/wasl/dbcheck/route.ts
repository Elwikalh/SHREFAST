import { NextResponse } from "next/server"
import { db, bootstrapDatabase } from "@el7bboB/db"
import { listWaslOrders } from "@/lib/wasl-store"
import { sql } from "drizzle-orm"

export const dynamic = "force-dynamic"

// فاحص تشخيصي مؤقت بموافقة صاحب الحساب: فحص الاتصال + الجداول + استعلام حقيقي
// مع طباعة الخطأ الحرفي — دون كشف أي بيانات سرية.
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
	let bootstrapped = true
	let bootstrapError: string | undefined
	try {
		await bootstrapDatabase()
	} catch (e) {
		const err = e as Error
		bootstrapped = false
		bootstrapError = String(err?.message || e).slice(0, 300)
	}
	let probe: Record<string, unknown>
	try {
		const orders = await listWaslOrders(3)
		probe = { orders: orders.length }
	} catch (e) {
		const err = e as Error
		probe = { error: String(err?.message || e).slice(0, 400) }
	}
	return NextResponse.json({ ok: true, configured: true, valid: true, info, server, bootstrapped, bootstrapError, probe })
}
