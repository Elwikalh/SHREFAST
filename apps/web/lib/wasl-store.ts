import crypto from "crypto"
import { sql } from "drizzle-orm"
import { db } from "@el7bboB/db"

// Super X (wasl) delivery-platform storage.
// Fully isolated from the restaurant schema: every table is prefixed with "wasl_"
// and created lazily with IF NOT EXISTS, so nothing existing is touched.

let ensured: Promise<void> | null = null

function ensureTables(): Promise<void> {
	if (!ensured) {
		ensured = (async () => {
			await db.execute(sql`CREATE SEQUENCE IF NOT EXISTS wasl_order_seq`)
			await db.execute(sql`CREATE TABLE IF NOT EXISTS wasl_orders (
				id INTEGER PRIMARY KEY DEFAULT nextval('wasl_order_seq'),
				ref TEXT UNIQUE NOT NULL,
				merchant_name TEXT NOT NULL,
				merchant_zone TEXT NOT NULL,
				from_addr TEXT NOT NULL,
				dest_zone TEXT NOT NULL,
				to_addr TEXT NOT NULL,
				fee INTEGER NOT NULL,
				fee_min INTEGER,
				fee_max INTEGER,
				km REAL,
				pay TEXT NOT NULL DEFAULT 'كاش',
				kind TEXT,
				customer_phone TEXT,
				source TEXT NOT NULL DEFAULT 'free',
				status TEXT NOT NULL DEFAULT 'searching',
				courier TEXT,
				created_at TIMESTAMPTZ NOT NULL DEFAULT now()
			)`)
			await db.execute(sql`ALTER TABLE wasl_orders ADD COLUMN IF NOT EXISTS customer_name TEXT`)
			await db.execute(sql`ALTER TABLE wasl_orders ADD COLUMN IF NOT EXISTS note TEXT`)
			await db.execute(sql`ALTER TABLE wasl_orders ADD COLUMN IF NOT EXISTS order_total INTEGER`)
			await db.execute(sql`ALTER TABLE wasl_orders ADD COLUMN IF NOT EXISTS arrived_at TIMESTAMPTZ`)
			await db.execute(sql`ALTER TABLE wasl_orders ADD COLUMN IF NOT EXISTS outcome TEXT`)
			await db.execute(sql`ALTER TABLE wasl_orders ADD COLUMN IF NOT EXISTS ready_minutes INTEGER`)
			await db.execute(sql`CREATE SEQUENCE IF NOT EXISTS wasl_inbox_seq`)
			await db.execute(sql`CREATE TABLE IF NOT EXISTS wasl_inbox (
				id INTEGER PRIMARY KEY DEFAULT nextval('wasl_inbox_seq'),
				ref TEXT UNIQUE NOT NULL,
				channel TEXT NOT NULL DEFAULT 'whatsapp',
				sender_phone TEXT NOT NULL,
				sender_name TEXT,
				body TEXT NOT NULL,
				handled_ref TEXT,
				created_at TIMESTAMPTZ NOT NULL DEFAULT now()
			)`)
			await db.execute(sql`CREATE SEQUENCE IF NOT EXISTS wasl_courier_acct_seq`)
			await db.execute(sql`CREATE TABLE IF NOT EXISTS wasl_courier_accounts (
				id INTEGER PRIMARY KEY DEFAULT nextval('wasl_courier_acct_seq'),
				ref TEXT UNIQUE NOT NULL,
				name TEXT NOT NULL,
				phone TEXT UNIQUE NOT NULL,
				password_hash TEXT NOT NULL,
				national_id TEXT,
				vehicle TEXT NOT NULL DEFAULT 'moto',
				governorate TEXT NOT NULL DEFAULT '',
				zone TEXT NOT NULL DEFAULT '',
				status TEXT NOT NULL DEFAULT 'active',
				sub_active BOOLEAN NOT NULL DEFAULT FALSE,
				sub_until TIMESTAMPTZ,
				created_at TIMESTAMPTZ NOT NULL DEFAULT now()
			)`)
			await db.execute(sql`CREATE TABLE IF NOT EXISTS wasl_platform_settings (
				key TEXT PRIMARY KEY,
				value_json TEXT NOT NULL
			)`)
			await db.execute(sql`CREATE SEQUENCE IF NOT EXISTS wasl_entity_seq`)
			await db.execute(sql`CREATE TABLE IF NOT EXISTS wasl_entities (
				id INTEGER PRIMARY KEY DEFAULT nextval('wasl_entity_seq'),
				ref TEXT UNIQUE NOT NULL,
				type TEXT NOT NULL,
				name TEXT NOT NULL,
				phone TEXT NOT NULL,
				governorate TEXT NOT NULL,
				zone TEXT NOT NULL,
				address TEXT NOT NULL,
				coverage_json TEXT,
				created_at TIMESTAMPTZ NOT NULL DEFAULT now()
			)`)
			await db.execute(sql`ALTER TABLE wasl_entities ADD COLUMN IF NOT EXISTS business_type TEXT`)
		})().catch((error) => {
			ensured = null
			throw error
		})
	}
	return ensured
}

// ===== Distance-based pricing (same engine as the Super X portal) =====
export const WASL_ZONES: Record<string, [number, number]> = {
	"المعادي": [29.96, 31.26],
	"مصر الجديدة": [30.09, 31.34],
	"مدينة نصر": [30.07, 31.32],
	"التجمع الخامس": [30.02, 31.44],
	"الهرم": [29.99, 31.12],
	"وسط البلد": [30.05, 31.235],
	"المقطم": [29.95, 31.32],
	"الرحاب": [30.06, 31.47],
	"المهندسين": [30.06, 31.2],
	"شبرا": [30.1, 31.24],
	// باقي محافظات مصر — نفس إحداثيات محرك التسعير في بوابة Super X
	"الدقي": [30.03, 31.21],
	"6 أكتوبر": [29.93, 30.92],
	"الشيخ زايد": [30.04, 30.97],
	"الفيصل": [30.02, 31.14],
	"إمبابة": [30.05, 31.19],
	"سموحة": [31.21, 29.94],
	"محرم بك": [31.24, 31.05],
	"العجمي": [29.77, 31.22],
	"برج العرب": [30.92, 29.61],
	"سيدي بشر": [31.26, 31.08],
	"منتزه": [31.28, 31.09],
	"المنصورة": [30.72, 31.04],
	"ميت غمر": [30.69, 31.27],
	"طلخا": [30.69, 31.06],
	"دكرنس": [30.79, 31.12],
	"طنطا": [30.79, 31.0],
	"المحلة الكبرى": [30.95, 31.19],
	"كفر الزيات": [30.87, 31.14],
	"أسيوط": [27.18, 31.18],
	"ديروط": [27.53, 31.18],
	"أبنوب": [27.27, 31.15],
	"بورسعيد": [31.26, 32.31],
	"بورفؤاد": [31.3, 32.33],
	"السويس": [29.97, 32.55],
	"الأربعين": [30.02, 32.53],
}
const ZONE_RADIUS_KM: Record<string, number> = {"المقطم": 4.5, "التجمع الخامس": 4.5, "الرحاب": 3.5, "المعادي": 3, "الهرم": 3.5}
const PRICING = { base: 15, perKm: 2.5, min: 25, roadFactor: 1.3 }

function distKm(fromZone: string, toZone: string): number {
	const a = WASL_ZONES[fromZone]
	const b = WASL_ZONES[toZone]
	if (!a || !b) return 8
	if (fromZone === toZone) {
		return Math.round(Math.max(1, (ZONE_RADIUS_KM[fromZone] || 2.5) * 0.45) * 10) / 10
	}
	const earthKm = 111.32
	const dy = (b[0] - a[0]) * earthKm
	const dx = (b[1] - a[1]) * earthKm * 0.866
	return Math.round(Math.sqrt(dx * dx + dy * dy) * PRICING.roadFactor * 10) / 10
}

function round5(n: number): number {
	return Math.max(PRICING.min, Math.round(n / 5) * 5)
}

export function quoteWaslDelivery(merchantZone: string, destZone: string) {
	const km = distKm(merchantZone, destZone)
	const r = ZONE_RADIUS_KM[destZone] || 2.5
	const feeMin = round5(PRICING.base + PRICING.perKm * Math.max(1, km - r))
	const feeMax = round5(PRICING.base + PRICING.perKm * (km + r))
	return { km, feeMin, feeMax }
}

export type WaslOrderRow = {
	id: number
	ref: string
	merchant_name: string
	merchant_zone: string
	from_addr: string
	dest_zone: string
	to_addr: string
	fee: number
	fee_min: number | null
	fee_max: number | null
	km: number | null
	pay: string
	kind: string | null
	customer_phone: string | null
	customer_name?: string | null
	ready_minutes?: number | null
	note?: string | null
	order_total?: number | null
	arrived_at?: Date | string | null
	outcome?: string | null
	source: string
	status: string
	courier: string | null
	created_at: Date
}

function rowsOf<T>(result: unknown): T[] {
	if (Array.isArray(result)) return result as T[]
	const maybe = result as { rows?: T[] }
	return maybe?.rows ?? []
}

export async function createWaslOrder(input: {
	merchant: string
	merchantZone: string
	fromAddr: string
	destZone: string
	toAddr: string
	fee: number
	pay?: string
	kind?: string
	customerPhone?: string
	customerName?: string
		note?: string
		total?: number
	readyMinutes?: number
	source?: string
}): Promise<WaslOrderRow> {
	await ensureTables()
	const quote = quoteWaslDelivery(input.merchantZone, input.destZone)
	// Server-side pricing guard: the offered fee must sit inside the computed range.
	const fee = Math.min(Math.max(Math.round(input.fee || quote.feeMin), quote.feeMin), quote.feeMax)
	const readyMinutes = input.readyMinutes === undefined || input.readyMinutes === null
		? null
		: Math.min(180, Math.max(0, Math.round(input.readyMinutes)))
	const result = await db.execute(sql`INSERT INTO wasl_orders
		(ref, merchant_name, merchant_zone, from_addr, dest_zone, to_addr, fee, fee_min, fee_max, km, pay, kind, customer_phone, customer_name, note, order_total, ready_minutes, source, status)
		VALUES ('SX-' || nextval('wasl_order_seq'), ${input.merchant}, ${input.merchantZone}, ${input.fromAddr},
			${input.destZone}, ${input.toAddr}, ${fee}, ${quote.feeMin}, ${quote.feeMax}, ${quote.km},
			${input.pay || "كاش"}, ${input.kind || null}, ${input.customerPhone || null}, ${input.customerName || null}, ${input.note || null}, ${input.total ?? null}, ${readyMinutes}, ${input.source || "free"}, 'searching')
		RETURNING *`)
	const rows = rowsOf<WaslOrderRow>(result)
	const first = rows[0]
	if (!first) throw new Error("insert_failed")
	return first
}

export async function listWaslOrders(limit = 50): Promise<WaslOrderRow[]> {
	await ensureTables()
	const result = await db.execute(sql`SELECT * FROM wasl_orders ORDER BY id DESC LIMIT ${limit}`)
	return rowsOf<WaslOrderRow>(result)
}

// ===== صندوق الوارد — رسائل واتساب الواصلة عبر WhatsApp Cloud API webhook =====
export type WaslInboxRow = {
	id: number
	ref: string
	channel: string
	sender_phone: string
	sender_name: string | null
	body: string
	handled_ref: string | null
	created_at: Date
}

export async function createWaslInboxMessage(input: {
	channel?: string
	senderPhone: string
	senderName?: string
	body: string
}): Promise<WaslInboxRow> {
	await ensureTables()
	const result = await db.execute(sql`INSERT INTO wasl_inbox (ref, channel, sender_phone, sender_name, body)
		VALUES ('WX-' || nextval('wasl_inbox_seq'), ${input.channel || "whatsapp"}, ${input.senderPhone}, ${input.senderName || null}, ${input.body})
		RETURNING *`)
	const rows = rowsOf<WaslInboxRow>(result)
	const first = rows[0]
	if (!first) throw new Error("insert_failed")
	return first
}

export async function listWaslInbox(limit = 30): Promise<WaslInboxRow[]> {
	await ensureTables()
	const result = await db.execute(sql`SELECT * FROM wasl_inbox ORDER BY id DESC LIMIT ${limit}`)
	return rowsOf<WaslInboxRow>(result)
}

export async function markWaslInboxHandled(ref: string, orderRef?: string): Promise<WaslInboxRow | null> {
	await ensureTables()
	const result = await db.execute(sql`UPDATE wasl_inbox SET handled_ref = ${orderRef || "done"}
		WHERE ref = ${ref} RETURNING *`)
	const rows = rowsOf<WaslInboxRow>(result)
	return rows[0] ?? null
}

export function waslInboxToClient(row: WaslInboxRow) {
	const mins = Math.max(0, Math.round((Date.now() - new Date(row.created_at).getTime()) / 60000))
	return {
		ref: row.ref,
		channel: row.channel,
		phone: row.sender_phone,
		name: row.sender_name,
		body: row.body,
		handled: !!row.handled_ref,
		orderRef: row.handled_ref,
		time: mins === 0 ? "الآن" : mins < 60 ? `من ${mins} د` : `من ${Math.round(mins / 60)} س`,
		ts: new Date(row.created_at).getTime(),
	}
}

const ALLOWED_STATUS = new Set(["searching", "accepted", "pickup", "heading", "arrived", "delivered", "refused", "no_answer", "canceled"])

export async function advanceWaslOrder(ref: string, status: string, courier?: string): Promise<WaslOrderRow | null> {
	await ensureTables()
	if (!ALLOWED_STATUS.has(status)) throw new Error("bad_status")
	const result = await db.execute(sql`UPDATE wasl_orders SET status = ${status},
		courier = COALESCE(${courier || null}, courier)
		${status === "arrived" ? sql`, arrived_at = now()` : sql``}
		${status === "delivered" || status === "refused" || status === "no_answer" ? sql`, outcome = ${status}` : sql``}
		WHERE ref = ${ref} RETURNING *`)
	const rows = rowsOf<WaslOrderRow>(result)
	return rows[0] ?? null
}

export function waslOrderToClient(row: WaslOrderRow) {
	const mins = Math.max(0, Math.round((Date.now() - new Date(row.created_at).getTime()) / 60000))
	return {
		id: row.ref,
		ref: row.ref,
		merchant: row.merchant_name,
		from: row.from_addr,
		to: row.to_addr,
		fee: row.fee,
		feeMin: row.fee_min,
		feeMax: row.fee_max,
		km: row.km,
		zone: row.dest_zone,
		pay: row.pay,
		kind: row.kind,
		cust: row.customer_phone,
		custName: row.customer_name,
		note: row.note,
		total: row.order_total,
		readyMin: row.ready_minutes,
		arrivedAt: row.arrived_at,
		outcome: row.outcome,
		source: row.source,
		status: row.status,
		courier: row.courier,
		real: true,
		time: mins === 0 ? "الآن" : mins < 60 ? `من ${mins} د` : `من ${Math.round(mins / 60)} س`,
		ts: new Date(row.created_at).getTime(),
	}
}

export type WaslEntityRow = {
	id: number
	ref: string
	type: string
	name: string
	phone: string
	governorate: string
	zone: string
	address: string
	business_type?: string | null
	coverage_json: string | null
	created_at: Date
}

export async function registerWaslEntity(input: {
	type: string
	name: string
	phone: string
	governorate: string
	zone: string
	address: string
	businessType?: string
	coverage?: string[]
}): Promise<WaslEntityRow> {
	await ensureTables()
	const coverageJson = input.coverage && input.coverage.length ? JSON.stringify(input.coverage) : null
	const result = await db.execute(sql`INSERT INTO wasl_entities
		(ref, type, name, phone, governorate, zone, address, business_type, coverage_json)
		VALUES ('SX-' || nextval('wasl_entity_seq'), ${input.type}, ${input.name}, ${input.phone},
			${input.governorate}, ${input.zone}, ${input.address}, ${input.businessType || null}, ${coverageJson})
		RETURNING *`)
	const rows = rowsOf<WaslEntityRow>(result)
	const first = rows[0]
	if (!first) throw new Error("insert_failed")
	return first
}

// تحديث بيانات نشاط مسجّل (نوع النشاط/العنوان) — بالمرجع فقط، بلا إنشاء حساب جديد
export async function updateWaslEntityProfile(input: {
	ref: string
	businessType?: string
	address?: string
}): Promise<WaslEntityRow | null> {
	await ensureTables()
	const businessType = (input.businessType || "").trim()
	const address = (input.address || "").trim()
	if (!businessType && !address) throw new Error("nothing_to_update")
	const result = await db.execute(sql`UPDATE wasl_entities SET
		business_type = ${businessType || sql`business_type`},
		address = ${address || sql`address`}
		WHERE ref = ${input.ref} RETURNING *`)
	const rows = rowsOf<WaslEntityRow>(result)
	return rows[0] ?? null
}

// ===== Partnerships (مجموعات المناديب المشتركة) =====
// Real, DB-backed courier-pool partnerships: membership, join invitations and
// the salary split between member businesses. Same wasl_ isolation rules.

export type WaslPartnershipRow = {
	id: number
	ref: string
	name: string
	zone: string
	governorate: string
	founder_ref: string
	courier_count: number
	monthly_salary: number
	created_at: Date
}

export type WaslPartnershipMemberRow = {
	id: number
	partnership_ref: string
	entity_ref: string
	entity_name: string
	share_pct: number
	joined_at: Date
}

export type WaslPartnershipInviteRow = {
	id: number
	ref: string
	partnership_ref: string
	from_ref: string
	from_name: string
	to_phone: string
	to_ref: string | null
	status: string
	created_at: Date
	responded_at: Date | null
}

let ensuredPartnerships: Promise<void> | null = null

async function ensurePartnershipTables(): Promise<void> {
	if (!ensuredPartnerships) {
		ensuredPartnerships = (async () => {
			await db.execute(sql`CREATE SEQUENCE IF NOT EXISTS wasl_partnership_seq`)
			await db.execute(sql`CREATE TABLE IF NOT EXISTS wasl_partnerships (
				id INTEGER PRIMARY KEY DEFAULT nextval('wasl_partnership_seq'),
				ref TEXT UNIQUE NOT NULL,
				name TEXT NOT NULL,
				zone TEXT NOT NULL,
				governorate TEXT NOT NULL,
				founder_ref TEXT NOT NULL,
				courier_count INTEGER NOT NULL DEFAULT 2,
				monthly_salary INTEGER NOT NULL DEFAULT 6000,
				created_at TIMESTAMPTZ NOT NULL DEFAULT now()
			)`)
			await db.execute(sql`CREATE TABLE IF NOT EXISTS wasl_partnership_members (
				id SERIAL PRIMARY KEY,
				partnership_ref TEXT NOT NULL,
				entity_ref TEXT NOT NULL,
				entity_name TEXT NOT NULL,
				share_pct INTEGER NOT NULL DEFAULT 0,
				joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
				UNIQUE(partnership_ref, entity_ref)
			)`)
			await db.execute(sql`CREATE SEQUENCE IF NOT EXISTS wasl_invite_seq`)
			await db.execute(sql`CREATE TABLE IF NOT EXISTS wasl_partnership_invites (
				id INTEGER PRIMARY KEY DEFAULT nextval('wasl_invite_seq'),
				ref TEXT UNIQUE NOT NULL,
				partnership_ref TEXT NOT NULL,
				from_ref TEXT NOT NULL,
				from_name TEXT NOT NULL,
				to_phone TEXT NOT NULL,
				to_ref TEXT,
				status TEXT NOT NULL DEFAULT 'pending',
				created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
				responded_at TIMESTAMPTZ
			)`)
		})().catch((error) => {
			ensuredPartnerships = null
			throw error
		})
	}
	return ensuredPartnerships
}

// Rebalance base salary shares equally across members (remainder to the founder).
async function rebalanceShares(partnershipRef: string, founderRef: string): Promise<void> {
	const result = await db.execute(sql`SELECT entity_ref FROM wasl_partnership_members WHERE partnership_ref = ${partnershipRef}`)
	const rows = rowsOf<{ entity_ref: string }>(result)
	const n = rows.length
	if (n === 0) return
	const base = Math.floor(100 / n)
	let remainder = 100 - base * n
	for (const row of rows) {
		const share = base + (row.entity_ref === founderRef ? remainder : 0)
		if (remainder > 0 && row.entity_ref === founderRef) remainder = 0
		await db.execute(sql`UPDATE wasl_partnership_members SET share_pct = ${share}
			WHERE partnership_ref = ${partnershipRef} AND entity_ref = ${row.entity_ref}`)
	}
}

export async function createWaslPartnership(input: {
	founderRef: string
	name?: string
	zone: string
	governorate: string
	courierCount?: number
	monthlySalary?: number
}): Promise<{ partnership: WaslPartnershipRow; created: boolean }> {
	await ensureTables()
	await ensurePartnershipTables()
	const founderCheck = await db.execute(sql`SELECT ref, name FROM wasl_entities WHERE ref = ${input.founderRef} AND type = 'merchant'`)
	if (rowsOf(founderCheck).length === 0) throw new Error("founder_not_found")
	// One active partnership per founder per zone — reuse it instead of duplicating.
	const existing = await db.execute(sql`SELECT * FROM wasl_partnerships WHERE founder_ref = ${input.founderRef} AND zone = ${input.zone}`)
	const existingRows = rowsOf<WaslPartnershipRow>(existing)
	if (existingRows[0]) return { partnership: existingRows[0], created: false }
	const name = (input.name || "").trim() || `شراكة ${input.zone} للتوصيل`
	const result = await db.execute(sql`INSERT INTO wasl_partnerships
		(ref, name, zone, governorate, founder_ref, courier_count, monthly_salary)
		VALUES ('PX-' || nextval('wasl_partnership_seq'), ${name}, ${input.zone}, ${input.governorate},
			${input.founderRef}, ${Math.max(1, Math.round(input.courierCount || 2))}, ${Math.max(0, Math.round(input.monthlySalary || 6000))})
		RETURNING *`)
	const rows = rowsOf<WaslPartnershipRow>(result)
	const partnership = rows[0]
	if (!partnership) throw new Error("insert_failed")
	const founderName = rowsOf<{ name: string }>(founderCheck)[0]?.name || "عضو مؤسس"
	await db.execute(sql`INSERT INTO wasl_partnership_members (partnership_ref, entity_ref, entity_name, share_pct)
		VALUES (${partnership.ref}, ${input.founderRef}, ${founderName}, 100)`)
	return { partnership, created: true }
}

export async function getWaslPartnership(ref: string): Promise<{ partnership: WaslPartnershipRow; members: WaslPartnershipMemberRow[] } | null> {
	await ensureTables()
	await ensurePartnershipTables()
	const result = await db.execute(sql`SELECT * FROM wasl_partnerships WHERE ref = ${ref}`)
	const rows = rowsOf<WaslPartnershipRow>(result)
	const partnership = rows[0]
	if (!partnership) return null
	const membersResult = await db.execute(sql`SELECT * FROM wasl_partnership_members WHERE partnership_ref = ${ref} ORDER BY joined_at ASC`)
	return { partnership, members: rowsOf<WaslPartnershipMemberRow>(membersResult) }
}

export async function listWaslPartnerships(zone?: string): Promise<WaslPartnershipRow[]> {
	await ensureTables()
	await ensurePartnershipTables()
	const result = zone
		? await db.execute(sql`SELECT * FROM wasl_partnerships WHERE zone = ${zone} ORDER BY id DESC`)
		: await db.execute(sql`SELECT * FROM wasl_partnerships ORDER BY id DESC`)
	return rowsOf<WaslPartnershipRow>(result)
}

export async function inviteWaslPartner(input: {
	partnershipRef: string
	fromRef: string
	fromName: string
	toPhone: string
}): Promise<WaslPartnershipInviteRow> {
	await ensureTables()
	await ensurePartnershipTables()
	const partnership = await getWaslPartnership(input.partnershipRef)
	if (!partnership) throw new Error("partnership_not_found")
	if (partnership.partnership.founder_ref !== input.fromRef) throw new Error("not_founder")
	const target = await db.execute(sql`SELECT ref FROM wasl_entities WHERE phone = ${input.toPhone} AND type = 'merchant' ORDER BY id DESC`)
	const targetRows = rowsOf<{ ref: string }>(target)
	const toRef = targetRows[0]?.ref ?? null
	if (toRef) {
		const memberCheck = await db.execute(sql`SELECT 1 FROM wasl_partnership_members WHERE partnership_ref = ${input.partnershipRef} AND entity_ref = ${toRef}`)
		if (rowsOf(memberCheck).length > 0) throw new Error("already_member")
	}
	const dupCheck = await db.execute(sql`SELECT 1 FROM wasl_partnership_invites WHERE partnership_ref = ${input.partnershipRef} AND to_phone = ${input.toPhone} AND status = 'pending'`)
	if (rowsOf(dupCheck).length > 0) throw new Error("invite_pending")
	const result = await db.execute(sql`INSERT INTO wasl_partnership_invites
		(ref, partnership_ref, from_ref, from_name, to_phone, to_ref)
		VALUES ('IN-' || nextval('wasl_invite_seq'), ${input.partnershipRef}, ${input.fromRef}, ${input.fromName}, ${input.toPhone}, ${toRef})
		RETURNING *`)
	const rows = rowsOf<WaslPartnershipInviteRow>(result)
	const invite = rows[0]
	if (!invite) throw new Error("insert_failed")
	return invite
}

export async function listWaslInvitesByPhone(phone: string): Promise<(WaslPartnershipInviteRow & { partnership_name: string; partnership_zone: string })[]> {
	await ensureTables()
	await ensurePartnershipTables()
	const result = await db.execute(sql`SELECT i.*, p.name AS partnership_name, p.zone AS partnership_zone
		FROM wasl_partnership_invites i JOIN wasl_partnerships p ON p.ref = i.partnership_ref
		WHERE i.to_phone = ${phone} ORDER BY i.id DESC`)
	return rowsOf<WaslPartnershipInviteRow & { partnership_name: string; partnership_zone: string }>(result)
}

export async function listWaslInvitesByPartnership(partnershipRef: string): Promise<WaslPartnershipInviteRow[]> {
	await ensureTables()
	await ensurePartnershipTables()
	const result = await db.execute(sql`SELECT * FROM wasl_partnership_invites WHERE partnership_ref = ${partnershipRef} ORDER BY id DESC`)
	return rowsOf<WaslPartnershipInviteRow>(result)
}

const INVITE_ACTIONS = new Set(["accept", "decline"])

export async function respondWaslInvite(input: { ref: string; action: string }): Promise<{ invite: WaslPartnershipInviteRow; members: WaslPartnershipMemberRow[] } | null> {
	await ensureTables()
	await ensurePartnershipTables()
	if (!INVITE_ACTIONS.has(input.action)) throw new Error("bad_action")
	const current = await db.execute(sql`SELECT * FROM wasl_partnership_invites WHERE ref = ${input.ref}`)
	const invites = rowsOf<WaslPartnershipInviteRow>(current)
	const invite = invites[0]
	if (!invite) return null
	if (invite.status !== "pending") throw new Error("already_responded")
	let toRef = invite.to_ref
	if (input.action === "accept") {
		if (!toRef) {
			const target = await db.execute(sql`SELECT ref FROM wasl_entities WHERE phone = ${invite.to_phone} AND type = 'merchant' ORDER BY id DESC`)
			toRef = rowsOf<{ ref: string }>(target)[0]?.ref ?? null
		}
		if (!toRef) throw new Error("merchant_not_registered")
		const nameResult = await db.execute(sql`SELECT name FROM wasl_entities WHERE ref = ${toRef}`)
		const entityName = rowsOf<{ name: string }>(nameResult)[0]?.name || "عضو"
		await db.execute(sql`INSERT INTO wasl_partnership_members (partnership_ref, entity_ref, entity_name, share_pct)
			VALUES (${invite.partnership_ref}, ${toRef}, ${entityName}, 0)
			ON CONFLICT (partnership_ref, entity_ref) DO NOTHING`)
		const partnership = await getWaslPartnership(invite.partnership_ref)
		if (partnership) await rebalanceShares(invite.partnership_ref, partnership.partnership.founder_ref)
	}
	const updated = await db.execute(sql`UPDATE wasl_partnership_invites SET status = ${input.action === "accept" ? "accepted" : "declined"},
		to_ref = COALESCE(${toRef}, to_ref), responded_at = now() WHERE ref = ${input.ref} RETURNING *`)
	const updatedRows = rowsOf<WaslPartnershipInviteRow>(updated)
	const freshInvite = updatedRows[0] ?? invite
	const members = await getWaslPartnership(invite.partnership_ref)
	return { invite: freshInvite, members: members?.members ?? [] }
}

export async function listWaslEntities(type?: string): Promise<WaslEntityRow[]> {
	await ensureTables()
	const result = type
		? await db.execute(sql`SELECT * FROM wasl_entities WHERE type = ${type} ORDER BY id DESC`)
		: await db.execute(sql`SELECT * FROM wasl_entities ORDER BY id DESC`)
	return rowsOf<WaslEntityRow>(result)
}

// Monthly usage per member (real delivered/active orders placed by that business name).
export async function partnershipUsageCounts(partnershipRef: string): Promise<{ entity_ref: string; entity_name: string; order_count: number }[]> {
	await ensureTables()
	await ensurePartnershipTables()
	const result = await db.execute(sql`SELECT m.entity_ref, m.entity_name,
			(SELECT COUNT(*)::INT FROM wasl_orders o WHERE o.merchant_name = m.entity_name AND date_trunc('month', o.created_at) = date_trunc('month', now())) AS order_count
		FROM wasl_partnership_members m WHERE m.partnership_ref = ${partnershipRef} ORDER BY m.joined_at ASC`)
	return rowsOf<{ entity_ref: string; entity_name: string; order_count: number }>(result)
}

// ===== Couriers (مناديب الفرق والشركات) =====
export type WaslCourierRow = {
	id: number
	ref: string
	owner_ref: string
	owner_type: string
	owner_name: string
	name: string
	phone: string
	zone: string
	vehicle: string
	status: string
	invite_code: string
	created_at: Date
	joined_at: Date | null
}

let ensuredCouriers: Promise<void> | null = null

function ensureCourierTables(): Promise<void> {
	if (!ensuredCouriers) {
		ensuredCouriers = (async () => {
			await db.execute(sql`CREATE SEQUENCE IF NOT EXISTS wasl_courier_seq`)
			await db.execute(sql`CREATE TABLE IF NOT EXISTS wasl_couriers (
				id INTEGER PRIMARY KEY DEFAULT nextval('wasl_courier_seq'),
				ref TEXT UNIQUE NOT NULL,
				owner_ref TEXT NOT NULL,
				owner_type TEXT NOT NULL,
				owner_name TEXT NOT NULL,
				name TEXT NOT NULL,
				phone TEXT NOT NULL,
				zone TEXT NOT NULL,
				vehicle TEXT NOT NULL DEFAULT 'moto',
				status TEXT NOT NULL DEFAULT 'invited',
				invite_code TEXT NOT NULL,
				created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
				joined_at TIMESTAMPTZ,
				UNIQUE(owner_ref, phone)
			)`)
		})().catch((error) => {
			ensuredCouriers = null
			throw error
		})
	}
	return ensuredCouriers
}

function makeInviteCode(): string {
	const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
	let code = ""
	for (let i = 0; i < 6; i++) code += alphabet[Math.floor(Math.random() * alphabet.length)]
	return code
}

export async function createWaslCourier(input: {
	ownerRef: string
	ownerType: string
	ownerName: string
	name: string
	phone: string
	zone: string
	vehicle?: string
}): Promise<WaslCourierRow> {
	await ensureTables()
	await ensureCourierTables()
	const phone = input.phone.replace(/\s+/g, "")
	const dup = await db.execute(sql`SELECT 1 FROM wasl_couriers WHERE owner_ref = ${input.ownerRef} AND phone = ${phone}`)
	if (rowsOf(dup).length > 0) throw new Error("courier_exists")
	const result = await db.execute(sql`INSERT INTO wasl_couriers
		(ref, owner_ref, owner_type, owner_name, name, phone, zone, vehicle, status, invite_code)
		VALUES ('CR-' || nextval('wasl_courier_seq'), ${input.ownerRef}, ${input.ownerType}, ${input.ownerName},
			${input.name}, ${phone}, ${input.zone}, ${input.vehicle || "moto"}, 'invited', ${makeInviteCode()})
		RETURNING *`)
	const rows = rowsOf<WaslCourierRow>(result)
	const first = rows[0]
	if (!first) throw new Error("insert_failed")
	return first
}

export async function listWaslCouriers(ownerRef: string): Promise<WaslCourierRow[]> {
	await ensureTables()
	await ensureCourierTables()
	const result = await db.execute(sql`SELECT * FROM wasl_couriers WHERE owner_ref = ${ownerRef} ORDER BY id DESC`)
	return rowsOf<WaslCourierRow>(result)
}

export async function joinWaslCourier(phone: string, code: string): Promise<WaslCourierRow | null> {
	await ensureTables()
	await ensureCourierTables()
	const clean = phone.replace(/\s+/g, "")
	const result = await db.execute(sql`UPDATE wasl_couriers SET status = 'active', joined_at = now()
		WHERE phone = ${clean} AND UPPER(invite_code) = ${code.toUpperCase()} AND status = 'invited' RETURNING *`)
	const rows = rowsOf<WaslCourierRow>(result)
	return rows[0] ?? null
}

// ===== Client invites (دعوات الشركات للأنشطة التجارية) =====
export type WaslClientInviteRow = {
	id: number
	ref: string
	company_ref: string
	company_name: string
	merchant_name: string
	phone: string
	zone: string
	status: string
	sent_count: number
	created_at: Date
	responded_at: Date | null
}

let ensuredClientInvites: Promise<void> | null = null

function ensureClientInviteTables(): Promise<void> {
	if (!ensuredClientInvites) {
		ensuredClientInvites = (async () => {
			await db.execute(sql`CREATE SEQUENCE IF NOT EXISTS wasl_client_invite_seq`)
			await db.execute(sql`CREATE TABLE IF NOT EXISTS wasl_client_invites (
				id INTEGER PRIMARY KEY DEFAULT nextval('wasl_client_invite_seq'),
				ref TEXT UNIQUE NOT NULL,
				company_ref TEXT NOT NULL,
				company_name TEXT NOT NULL,
				merchant_name TEXT NOT NULL,
				phone TEXT NOT NULL,
				zone TEXT NOT NULL,
				status TEXT NOT NULL DEFAULT 'pending',
				sent_count INTEGER NOT NULL DEFAULT 1,
				created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
				responded_at TIMESTAMPTZ
			)`)
		})().catch((error) => {
			ensuredClientInvites = null
			throw error
		})
	}
	return ensuredClientInvites
}

export async function createWaslClientInvite(input: {
	companyRef: string
	companyName: string
	merchantName: string
	phone: string
	zone: string
}): Promise<WaslClientInviteRow> {
	await ensureTables()
	await ensureClientInviteTables()
	const phone = input.phone.replace(/\s+/g, "")
	const dup = await db.execute(sql`SELECT 1 FROM wasl_client_invites WHERE company_ref = ${input.companyRef} AND phone = ${phone} AND status = 'pending'`)
	if (rowsOf(dup).length > 0) throw new Error("invite_pending")
	const result = await db.execute(sql`INSERT INTO wasl_client_invites
		(ref, company_ref, company_name, merchant_name, phone, zone)
		VALUES ('CI-' || nextval('wasl_client_invite_seq'), ${input.companyRef}, ${input.companyName},
			${input.merchantName}, ${phone}, ${input.zone})
		RETURNING *`)
	const rows = rowsOf<WaslClientInviteRow>(result)
	const first = rows[0]
	if (!first) throw new Error("insert_failed")
	return first
}

export async function listWaslClientInvites(companyRef: string): Promise<WaslClientInviteRow[]> {
	await ensureTables()
	await ensureClientInviteTables()
	const result = await db.execute(sql`SELECT * FROM wasl_client_invites WHERE company_ref = ${companyRef} ORDER BY id DESC`)
	return rowsOf<WaslClientInviteRow>(result)
}

export async function resendWaslClientInvite(ref: string): Promise<WaslClientInviteRow | null> {
	await ensureTables()
	await ensureClientInviteTables()
	const result = await db.execute(sql`UPDATE wasl_client_invites SET sent_count = sent_count + 1, created_at = now()
		WHERE ref = ${ref} AND status = 'pending' RETURNING *`)
	const rows = rowsOf<WaslClientInviteRow>(result)
	return rows[0] ?? null
}

// ===== Settlements (تسويات مستحقات المناديب) =====
export type WaslSettlementRow = {
	id: number
	ref: string
	owner_ref: string
	owner_name: string
	courier_name: string
	amount: number
	kind: string
	created_at: Date
}

let ensuredSettlements: Promise<void> | null = null

function ensureSettlementTables(): Promise<void> {
	if (!ensuredSettlements) {
		ensuredSettlements = (async () => {
			await db.execute(sql`CREATE SEQUENCE IF NOT EXISTS wasl_settlement_seq`)
			await db.execute(sql`CREATE TABLE IF NOT EXISTS wasl_settlements (
				id INTEGER PRIMARY KEY DEFAULT nextval('wasl_settlement_seq'),
				ref TEXT UNIQUE NOT NULL,
				owner_ref TEXT NOT NULL,
				owner_name TEXT NOT NULL,
				courier_name TEXT NOT NULL,
				amount INTEGER NOT NULL,
				kind TEXT NOT NULL DEFAULT 'courier',
				created_at TIMESTAMPTZ NOT NULL DEFAULT now()
			)`)
		})().catch((error) => {
			ensuredSettlements = null
			throw error
		})
	}
	return ensuredSettlements
}

export async function createWaslSettlement(input: {
	ownerRef: string
	ownerName: string
	courierName: string
	amount: number
	kind?: string
}): Promise<WaslSettlementRow> {
	await ensureTables()
	await ensureSettlementTables()
	const result = await db.execute(sql`INSERT INTO wasl_settlements
		(ref, owner_ref, owner_name, courier_name, amount, kind)
		VALUES ('ST-' || nextval('wasl_settlement_seq'), ${input.ownerRef}, ${input.ownerName},
			${input.courierName}, ${Math.max(0, Math.round(input.amount))}, ${input.kind || "courier"})
		RETURNING *`)
	const rows = rowsOf<WaslSettlementRow>(result)
	const first = rows[0]
	if (!first) throw new Error("insert_failed")
	return first
}

export async function listWaslSettlements(ownerRef: string): Promise<WaslSettlementRow[]> {
	await ensureTables()
	await ensureSettlementTables()
	const result = await db.execute(sql`SELECT * FROM wasl_settlements WHERE owner_ref = ${ownerRef} ORDER BY id DESC LIMIT 30`)
	return rowsOf<WaslSettlementRow>(result)
}

// ===== Settings (إعدادات محفوظة: رسوم الشركات ونحوها) =====
let ensuredSettings: Promise<void> | null = null

function ensureSettingsTable(): Promise<void> {
	if (!ensuredSettings) {
		ensuredSettings = (async () => {
			await db.execute(sql`CREATE TABLE IF NOT EXISTS wasl_settings (
				key TEXT PRIMARY KEY,
				value_json TEXT NOT NULL,
				updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
			)`)
		})().catch((error) => {
			ensuredSettings = null
			throw error
		})
	}
	return ensuredSettings
}

export async function getWaslSetting(key: string): Promise<unknown | null> {
	await ensureTables()
	await ensureSettingsTable()
	const result = await db.execute(sql`SELECT value_json FROM wasl_settings WHERE key = ${key}`)
	const rows = rowsOf<{ value_json: string }>(result)
	if (!rows[0]) return null
	try {
		return JSON.parse(rows[0].value_json)
	} catch {
		return null
	}
}

export async function setWaslSetting(key: string, value: unknown): Promise<void> {
	await ensureTables()
	await ensureSettingsTable()
	const json = JSON.stringify(value ?? null)
	await db.execute(sql`INSERT INTO wasl_settings (key, value_json, updated_at) VALUES (${key}, ${json}, now())
		ON CONFLICT (key) DO UPDATE SET value_json = ${json}, updated_at = now()`)
}

// ===== Platform stats (لوحة الإدارة — أرقام حية من القاعدة) =====
export async function waslPlatformStats() {
	await ensureTables()
	await ensurePartnershipTables()
	await ensureCourierTables()
	await ensureClientInviteTables()
	const count = async (q: ReturnType<typeof sql>) => rowsOf<{ n: number }>(await db.execute(q))[0]?.n ?? 0
	const merchants = await count(sql`SELECT COUNT(*)::INT AS n FROM wasl_entities WHERE type = 'merchant'`)
	const companies = await count(sql`SELECT COUNT(*)::INT AS n FROM wasl_entities WHERE type = 'company'`)
	const ordersTotal = await count(sql`SELECT COUNT(*)::INT AS n FROM wasl_orders`)
	const ordersToday = await count(sql`SELECT COUNT(*)::INT AS n FROM wasl_orders WHERE created_at >= date_trunc('day', now())`)
	const ordersDelivered = await count(sql`SELECT COUNT(*)::INT AS n FROM wasl_orders WHERE status = 'delivered'`)
	const partnerships = await count(sql`SELECT COUNT(*)::INT AS n FROM wasl_partnerships`)
	const couriers = await count(sql`SELECT COUNT(*)::INT AS n FROM wasl_couriers WHERE status = 'active'`)
	const couriersInvited = await count(sql`SELECT COUNT(*)::INT AS n FROM wasl_couriers WHERE status = 'invited'`)
	return { merchants, companies, ordersTotal, ordersToday, ordersDelivered, partnerships, couriers, couriersInvited }
}

// ===== حسابات المناديب على المنصة — تسجيل ذاتي زي تطبيقات التوصيل =====
export type WaslCourierAccountRow = {
	id: number
	ref: string
	name: string
	phone: string
	password_hash: string
	national_id: string | null
	vehicle: string
	governorate: string
	zone: string
	status: string
	sub_active: boolean
	sub_until: Date | string | null
	created_at: Date
}

export function hashWaslPassword(password: string): string {
	const salt = crypto.randomBytes(16).toString("hex")
	return salt + "$" + crypto.createHash("sha256").update(salt + password).digest("hex")
}

export function verifyWaslPassword(password: string, stored: string): boolean {
	const [salt, digest] = String(stored).split("$")
	if (!salt || !digest) return false
	const check = crypto.createHash("sha256").update(salt + password).digest("hex")
	return crypto.timingSafeEqual(Buffer.from(check), Buffer.from(digest))
}

export async function createWaslCourierAccount(input: {
	name: string
	phone: string
	password: string
	nationalId?: string
	vehicle?: string
	governorate?: string
	zone?: string
}): Promise<WaslCourierAccountRow> {
	await ensureTables()
	const result = await db.execute(sql`INSERT INTO wasl_courier_accounts
		(ref, name, phone, password_hash, national_id, vehicle, governorate, zone, status)
		VALUES ('CRX-' || nextval('wasl_courier_acct_seq'), ${input.name}, ${input.phone}, ${hashWaslPassword(input.password)},
			${input.nationalId || null}, ${input.vehicle || "moto"}, ${input.governorate || ""}, ${input.zone || ""}, 'active')
		RETURNING *`)
	const rows = rowsOf<WaslCourierAccountRow>(result)
	const first = rows[0]
	if (!first) throw new Error("insert_failed")
	return first
}

export async function getWaslCourierAccountByPhone(phone: string): Promise<WaslCourierAccountRow | null> {
	await ensureTables()
	const result = await db.execute(sql`SELECT * FROM wasl_courier_accounts WHERE phone = ${phone} LIMIT 1`)
	return rowsOf<WaslCourierAccountRow>(result)[0] ?? null
}

export async function getWaslCourierAccount(ref: string): Promise<WaslCourierAccountRow | null> {
	await ensureTables()
	const result = await db.execute(sql`SELECT * FROM wasl_courier_accounts WHERE ref = ${ref} LIMIT 1`)
	return rowsOf<WaslCourierAccountRow>(result)[0] ?? null
}

export async function verifyWaslCourierLogin(phone: string, password: string): Promise<WaslCourierAccountRow | null> {
	const row = await getWaslCourierAccountByPhone(phone)
	if (!row || !verifyWaslPassword(password, row.password_hash)) return null
	return row
}

export async function listWaslCourierAccounts(limit = 200): Promise<WaslCourierAccountRow[]> {
	await ensureTables()
	const result = await db.execute(sql`SELECT * FROM wasl_courier_accounts ORDER BY id DESC LIMIT ${limit}`)
	return rowsOf<WaslCourierAccountRow>(result)
}

export async function setWaslCourierAccountStatus(ref: string, status: string): Promise<WaslCourierAccountRow | null> {
	await ensureTables()
	const result = await db.execute(sql`UPDATE wasl_courier_accounts SET status = ${status} WHERE ref = ${ref} RETURNING *`)
	return rowsOf<WaslCourierAccountRow>(result)[0] ?? null
}

export async function setWaslCourierAccountSubscription(ref: string, active: boolean): Promise<WaslCourierAccountRow | null> {
	await ensureTables()
	const result = await db.execute(sql`UPDATE wasl_courier_accounts
		SET sub_active = ${active}, sub_until = ${active ? sql`now() + interval '1 month'` : null}
		WHERE ref = ${ref} RETURNING *`)
	return rowsOf<WaslCourierAccountRow>(result)[0] ?? null
}

// ===== إعدادات المنصة — الاشتراك مطلوب أو مجاني لكل نوع مستخدم =====
export type WaslUserType = "courier" | "merchant" | "company"
export type WaslTypeSub = { enabled: boolean; monthlyFee: number }
export type WaslPlatformSettings = Record<WaslUserType, WaslTypeSub>

const DEFAULT_SETTINGS: WaslPlatformSettings = {
	courier: { enabled: false, monthlyFee: 0 },
	merchant: { enabled: false, monthlyFee: 0 },
	company: { enabled: false, monthlyFee: 0 },
}

export async function getWaslPlatformSettings(): Promise<WaslPlatformSettings> {
	await ensureTables()
	const result = await db.execute(sql`SELECT value_json FROM wasl_platform_settings WHERE key = 'platform' LIMIT 1`)
	const row = rowsOf<{ value_json: string }>(result)[0]
	if (!row) return { ...DEFAULT_SETTINGS }
	try {
		const parsed = JSON.parse(row.value_json) as Partial<WaslPlatformSettings>
		return {
			courier: { ...DEFAULT_SETTINGS.courier, ...(parsed.courier || {}) },
			merchant: { ...DEFAULT_SETTINGS.merchant, ...(parsed.merchant || {}) },
			company: { ...DEFAULT_SETTINGS.company, ...(parsed.company || {}) },
		}
	} catch {
		return { ...DEFAULT_SETTINGS }
	}
}

export async function saveWaslPlatformSettings(patch: Partial<WaslPlatformSettings>): Promise<WaslPlatformSettings> {
	await ensureTables()
	const current = await getWaslPlatformSettings()
	const next: WaslPlatformSettings = {
		courier: { ...current.courier, ...(patch.courier || {}) },
		merchant: { ...current.merchant, ...(patch.merchant || {}) },
		company: { ...current.company, ...(patch.company || {}) },
	}
	await db.execute(sql`INSERT INTO wasl_platform_settings (key, value_json) VALUES ('platform', ${JSON.stringify(next)})
		ON CONFLICT (key) DO UPDATE SET value_json = ${JSON.stringify(next)}`)
	return next
}

export function waslCourierAccountToClient(row: WaslCourierAccountRow) {
	return {
		ref: row.ref,
		name: row.name,
		phone: row.phone,
		nationalId: row.national_id,
		vehicle: row.vehicle,
		governorate: row.governorate,
		zone: row.zone,
		status: row.status,
		subActive: !!row.sub_active,
		subUntil: row.sub_until,
		createdAt: row.created_at,
	}
}
