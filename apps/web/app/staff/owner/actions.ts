"use server"
import { sql } from "drizzle-orm"
import { db } from "@el7bboB/db"
import { getStaffSession } from "@/lib/staff-session"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
export type Material = { id: string; name: string; unit: string; stock: number; cost: number }
export type Recipe = { id: string; name: string; price: number; lines: { materialId: string; quantity: number }[] }
export type Entry = { id: string; date: string; kind: string; label: string; amount: number; drawer: number; note: string; category?: string; quantity?: number; materialId?: string }
export type Day = { date: string; mode: "manual" | "pos"; cash: number; instapay: number; opening: number; counted: number; note: string; savedAt: string }
export type Workspace = { materials: Material[]; recipes: Recipe[]; entries: Entry[]; days: Day[] }
export type OwnerData = { revision: number; data: Workspace }
export type OwnerCommand = { type: "material" | "purchase" | "expense" | "stock" | "production" | "recipe" | "day"; token: string; date?: string; name?: string; unit?: string; quantity?: number; cost?: number; materialId?: string; outputId?: string; outputQuantity?: number; amount?: number; category?: string; drawer?: boolean; note?: string; stockKind?: "waste" | "usage" | "count"; price?: number; lines?: { materialId: string; quantity: number }[]; mode?: "manual" | "pos"; cash?: number; instapay?: number; opening?: number; counted?: number }
export async function requireOwner() {
 const session = await getStaffSession()
 if (!session) redirect("/staff/login?next=/staff/owner")
 const allowed = (process.env.OWNER_EMAIL || "owner@el7bbob.com").trim().toLowerCase()
 if (session.role !== "admin" || session.email.toLowerCase() !== allowed) redirect("/staff/forbidden")
 return session
}
let ready: Promise<void> | undefined
async function ensureTables() {
 if (!ready) ready = (async () => {
  await db.execute(sql`CREATE TABLE IF NOT EXISTS owner_workspaces (user_id text PRIMARY KEY REFERENCES "user"(id), revision integer NOT NULL DEFAULT 0, data jsonb NOT NULL, updated_at timestamptz NOT NULL DEFAULT now())`)
  await db.execute(sql`CREATE TABLE IF NOT EXISTS owner_workspace_audit (id text PRIMARY KEY, user_id text NOT NULL REFERENCES "user"(id), command_type text NOT NULL, revision integer NOT NULL, created_at timestamptz NOT NULL DEFAULT now())`)
 })().catch((error) => { ready = undefined; throw error })
 await ready
}
const empty = (): Workspace => ({ materials: [], recipes: [], entries: [], days: [] })
async function read(userId: string): Promise<OwnerData> {
 await ensureTables()
 await db.execute(sql`INSERT INTO owner_workspaces (user_id, data) VALUES (${userId}, ${JSON.stringify(empty())}::jsonb) ON CONFLICT (user_id) DO NOTHING`)
 const rows = await db.execute(sql`SELECT revision, data FROM owner_workspaces WHERE user_id = ${userId}`)
 const row = rows[0] as unknown as { revision: number; data: Workspace }
 return { revision: Number(row.revision), data: row.data }
}
export async function loadOwnerData(): Promise<OwnerData> { const owner = await requireOwner(); return read(owner.userId) }
function positive(value: unknown, allowZero = false) {
 if (typeof value !== "number" || !Number.isFinite(value) || value > 100000000 || (allowZero ? value < 0 : value <= 0)) throw new Error("أدخل قيمة صحيحة وغير سالبة")
 return Math.round(value * 10000) / 10000
}
function label(value: unknown, max = 120) { if (typeof value !== "string" || !value.trim() || value.length > max) throw new Error("راجع الاسم أو الوصف"); return value.trim() }
function date(value: unknown) {
 if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) || new Date(value).toISOString().slice(0,10) !== value) throw new Error("التاريخ غير صحيح")
 return value
}
function round(n: number) { return Math.round(n * 10000) / 10000 }
export async function loadPosDay(value: string) {
 await requireOwner(); const day = date(value)
 const rows = await db.execute(sql`SELECT COALESCE(SUM(CASE WHEN p.method = 'cash' THEN p.amount_egp ELSE 0 END),0) AS cash, COALESCE(SUM(CASE WHEN p.method = 'instapay' THEN p.amount_egp ELSE 0 END),0) AS instapay FROM payments p JOIN orders o ON o.id=p.order_id WHERE p.status='confirmed' AND o.status <> 'cancelled' AND (o.created_at AT TIME ZONE 'Africa/Cairo')::date = ${day}::date`)
 const r = rows[0] as unknown as { cash: string; instapay: string }
 return { cash: Number(r.cash), instapay: Number(r.instapay) }
}
export async function saveOwnerCommand(command: OwnerCommand, revision: number): Promise<{ ok: boolean; message: string; snapshot?: OwnerData }> {
 const owner = await requireOwner()
 try {
  if (!Number.isSafeInteger(revision) || revision < 0) throw new Error("نسخة البيانات غير صحيحة")
  if (!/^[0-9a-f-]{36}$/i.test(command.token)) throw new Error("أعد فتح الصفحة ثم حاول الحفظ")
  const current = await read(owner.userId)
  const duplicate = await db.execute(sql`SELECT id FROM owner_workspace_audit WHERE id = ${owner.userId + ':' + command.token}`)
  if (duplicate.length) return { ok: true, message: "تم حفظ العملية بالفعل", snapshot: current }
  if (current.revision !== revision) return { ok: false, message: "البيانات اتغيرت في نافذة أخرى. تم تحديثها؛ راجعها وأعد الحفظ.", snapshot: current }
  const data: Workspace = structuredClone(current.data)
  if (data.entries.length >= 10000) throw new Error("وصل السجل إلى حد هذه النسخة. صدّر البيانات قبل التوسعة.")
  const note = typeof command.note === "string" ? command.note.trim().slice(0,500) : ""
  const eventDate = date(command.date)
  const material = (id?: string) => { const item = data.materials.find(m => m.id === id); if (!item) throw new Error("اختر خامة صحيحة"); return item }
  const entry = (kind: string, title: string, amount = 0, extra: Partial<Entry> = {}) => data.entries.push({ id: crypto.randomUUID(), date: eventDate, kind, label: title, amount: round(amount), drawer: 0, note, ...extra })
  const take = (m: Material, q: number) => { if (q > m.stock + 0.00001) throw new Error("الرصيد لا يكفي: " + m.name); m.stock = round(m.stock-q) }
  switch (command.type) {
   case "material": {
    if (data.materials.length >= 500) throw new Error("حد الخامات 500")
    const name = label(command.name), unit = label(command.unit,20)
    if (!['كيلو','لتر','قطعة'].includes(unit)) throw new Error("الوحدة غير مدعومة")
    if (data.materials.some(m => m.name === name)) throw new Error("الخامة موجودة بالفعل")
    const stock = positive(command.quantity,true), cost = positive(command.cost,true)
    const id = crypto.randomUUID(); data.materials.push({ id, name, unit, stock, cost })
    entry("opening", "رصيد افتتاحي: " + name, stock*cost, {materialId:id,quantity:stock}); break
   }
   case "purchase": {
    const m = material(command.materialId), q = positive(command.quantity), total = positive(command.amount)
    const oldValue = m.stock*m.cost; m.stock = round(m.stock+q); m.cost = round((oldValue+total)/m.stock)
    entry("purchase", "شراء: " + m.name, total, { materialId:m.id, quantity:q, drawer:command.drawer ? total : 0 }); break
   }
   case "expense": {
    const amount = positive(command.amount), category = label(command.category)
    if (!['تشغيل','إيجار','أجور','سلف عاملين','مرافق','صيانة','تسويق','أصول وتجهيزات','مسحوبات شخصية'].includes(category)) throw new Error("تصنيف المصروف غير صحيح")
    entry("expense",label(command.name),amount,{category,drawer:command.drawer ? amount : 0}); break
   }
   case "stock": {
    const m = material(command.materialId), q = positive(command.quantity, command.stockKind === 'count')
    if (command.stockKind === 'count') { const delta = round(q-m.stock); m.stock=q; entry("count", "جرد: " + m.name,Math.abs(delta)*m.cost,{materialId:m.id,quantity:delta}) }
    else { if (!['waste','usage'].includes(command.stockKind || '')) throw new Error("نوع حركة المخزون غير صحيح"); take(m,q); entry(command.stockKind || 'usage',(command.stockKind==='waste'?'هالك: ':'استخدام: ')+m.name,q*m.cost,{materialId:m.id,quantity:-q}) }
    break
   }
   case "production": {
    const input = material(command.materialId), output = material(command.outputId)
    if(input.id===output.id) throw new Error("اختار خامة ناتجة مختلفة عن الخام المستخدم")
    const used = positive(command.quantity), produced = positive(command.outputQuantity), value = used*input.cost
    take(input,used); const oldValue=output.stock*output.cost;output.stock=round(output.stock+produced);output.cost=round((oldValue+value)/output.stock)
    entry("production_input","تحضير من: "+input.name,value,{materialId:input.id,quantity:-used})
    entry("production_output","ناتج تحضير: "+output.name,value,{materialId:output.id,quantity:produced}); break
   }
   case "recipe": {
    const name=label(command.name), price=positive(command.price,true), lines=command.lines
    if(!Array.isArray(lines)||!lines.length||lines.length>30) throw new Error("أضف مكونات الوصفة")
    const seen=new Set<string>(); const cleaned=lines.map(line=>{material(line.materialId);if(seen.has(line.materialId))throw new Error("الخامة مكررة في الوصفة");seen.add(line.materialId);return {materialId:line.materialId,quantity:positive(line.quantity)}})
    const old=data.recipes.find(r=>r.name===name)
    if(old){old.price=price;old.lines=cleaned}else data.recipes.push({id:crypto.randomUUID(),name,price,lines:cleaned})
    entry("recipe","تحديث وصفة: "+name); break
   }
   case "day": {
    if(command.mode!=='manual'&&command.mode!=='pos') throw new Error("مصدر المبيعات غير صحيح")
    const existing=data.days.find(d=>d.date===eventDate)
    if(existing && existing.mode!==command.mode) throw new Error("اليوم مسجل بمصدر مختلف. لا تجمع الإدخال اليدوي مع مبيعات الكاشير؛ اختر نفس المصدر.")
    const sales=command.mode==='pos'?await loadPosDay(eventDate):{cash:positive(command.cash,true),instapay:positive(command.instapay,true)}
    const day: Day={date:eventDate,mode:command.mode,cash:sales.cash,instapay:sales.instapay,opening:positive(command.opening,true),counted:positive(command.counted,true),note,savedAt:new Date().toISOString()}
    if(existing) Object.assign(existing,day);else data.days.push(day)
    entry("day","تقفيل يوم "+eventDate);break
   }
   default: throw new Error("العملية غير مدعومة")
  }
  if(JSON.stringify(data).length>2000000) throw new Error("حجم البيانات يحتاج توسعة؛ صدّر نسخة أولاً")
  const changed = await db.transaction(async tx => {
   const rows=await tx.execute(sql`UPDATE owner_workspaces SET data=${JSON.stringify(data)}::jsonb, revision=revision+1, updated_at=now() WHERE user_id=${owner.userId} AND revision=${revision} RETURNING revision`)
   if(!rows.length) return false
   await tx.execute(sql`INSERT INTO owner_workspace_audit (id,user_id,command_type,revision) VALUES (${owner.userId+':'+command.token},${owner.userId},${command.type},${revision+1})`)
   return true
  })
  if(!changed) return {ok:false,message:"حصل تحديث متزامن. تم تحميل أحدث بيانات؛ راجعها وأعد الحفظ.",snapshot:await read(owner.userId)}
  revalidatePath('/staff/owner')
  return {ok:true,message:"تم الحفظ في حسابك الخاص",snapshot:{revision:revision+1,data}}
 } catch(error) {
  console.error('[owner-workspace]',error)
  return {ok:false,message:error instanceof Error && !/sql|query|relation|connect|postgres/i.test(error.message)?error.message:"تعذر الحفظ. لم نؤكد تسجيل العملية؛ حاول مجددًا بنفس الصفحة."}
 }
}
