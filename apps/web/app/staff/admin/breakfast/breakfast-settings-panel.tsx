"use client"
import { useState } from "react"
import type { MealKind } from "@/app/meal-config"
import type { MealSelections } from "@/app/meal-settings"
export type BreakfastChoiceRow = { id: string; nameAr: string; nameEn: string; slug: string; priceEGP: number; available: boolean; tray: boolean; box: boolean }
const names = { tray: "الطبلية", box: "البوكس" } as const
export function BreakfastSettingsPanel({ rows, initialSelections }: { rows: BreakfastChoiceRow[]; initialSelections: MealSelections }) {
	const [kind, setKind] = useState<MealKind>("tray"), [query, setQuery] = useState(""), [pending, setPending] = useState(false), [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
	const [selected, setSelected] = useState<Record<MealKind, string[]>>(() => ({ tray: initialSelections.tray ?? rows.filter((row) => row.tray).map((row) => row.id), box: initialSelections.box ?? rows.filter((row) => row.box).map((row) => row.id) }))
	const candidates = rows.filter((row) => row[kind]), shown = candidates.filter((row) => `${row.nameAr} ${row.nameEn} ${row.slug}`.toLowerCase().includes(query.trim().toLowerCase())), selectedIds = new Set(selected[kind])
	const missingIds = selected[kind].filter((id) => !candidates.some((row) => row.id === id))
	function choose(id: string, checked: boolean) {
		setMessage(null); setSelected((current) => ({ ...current, [kind]: checked ? Array.from(new Set([...current[kind], id])) : current[kind].filter((value) => value !== id) }))
	}
	async function save() {
		if (pending) return
		setPending(true); setMessage(null)
		try {
			const response = await fetch("/api/staff/breakfast", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, allowedIds: selected[kind] }) })
			const result: unknown = await response.json()
			if (!response.ok || !result || typeof result !== "object" || !("ok" in result) || result.ok !== true) {
				const text = result && typeof result === "object" && "error" in result && typeof result.error === "string" ? result.error : "تعذر تأكيد الحفظ؛ راجع الإعدادات قبل إعادة المحاولة."
				throw new Error(text)
			}
			setMessage({ ok: true, text: `تم حفظ اختيارات ${names[kind]}.` })
		} catch (error) { setMessage({ ok: false, text: error instanceof Error ? error.message : "تعذر تأكيد الحفظ؛ راجع الإعدادات قبل إعادة المحاولة." }) }
		finally { setPending(false) }
	}
	return <section className="space-y-4"><fieldset disabled={pending} className="min-w-0 space-y-4"><div className="flex gap-2" role="group" aria-label="نوع التكوين">{(["tray", "box"] as const).map((value) => <button key={value} type="button" aria-pressed={kind === value} onClick={() => { setKind(value); setQuery(""); setMessage(null) }} className={`btn flex-1 px-4 py-3 ${kind === value ? "btn-primary" : "border"}`}>مكونات {names[value]}</button>)}</div><div className="card space-y-3 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-black">اختيارات {names[kind]} <span className="num">({selected[kind].length})</span></h2><input aria-label="بحث في مكونات الفطار" value={query} onChange={(event) => setQuery(event.target.value)} className="input w-full sm:w-60" placeholder="بحث عن فول، بطاطس، جبنة…"/></div><div className="flex flex-wrap gap-2"><button type="button" className="btn border px-3 py-2 text-xs" onClick={() => { setSelected((current) => ({ ...current, [kind]: candidates.map((row) => row.id) })); setMessage(null) }}>اختيار كل الأصناف</button><button type="button" className="btn border px-3 py-2 text-xs" onClick={() => { setSelected((current) => ({ ...current, [kind]: [] })); setMessage(null) }}>إلغاء كل الاختيارات</button></div><p className="text-xs leading-relaxed text-[var(--ink)]/60">الصنف المخفي أو بدون سعر صالح مش هيظهر للعميل حتى لو مختار هنا. بعد أول حفظ، أي صنف جديد يحتاج تختاره هنا. إعدادات الميكس والأصناف الجاهزة لا تتغير.</p></div><div className="card divide-y divide-[var(--line)] overflow-hidden">{shown.map((row) => <label key={row.id} className="flex cursor-pointer items-center gap-3 p-4"><input type="checkbox" aria-label={`إتاحة ${row.nameAr} في ${names[kind]}`} checked={selectedIds.has(row.id)} onChange={(event) => choose(row.id, event.target.checked)} className="h-5 w-5 shrink-0 accent-[var(--amber-deep)]"/><span className="min-w-0 flex-1"><span className="block text-sm font-black">{row.nameAr}</span><span className="block text-xs text-[var(--ink)]/50">{row.available ? "متاح في المنيو" : "مخفي من المنيو"}{row.priceEGP > 0 ? ` — ${row.priceEGP} ج.م` : " — راجع سعر الصنف"}</span></span></label>)}{!shown.length ? <p className="p-5 text-sm">لا توجد أصناف مطابقة.</p> : null}</div>{missingIds.length ? <div role="alert" className="card space-y-2 p-4 text-sm"><p>في الاختيارات أصناف اتحذفت أو تصنيفها اتغير. احذف الاختيارات القديمة قبل الحفظ.</p><button type="button" className="btn border px-4 py-2" onClick={() => { setSelected((current) => ({ ...current, [kind]: current[kind].filter((id) => !missingIds.includes(id)) })); setMessage(null) }}>حذف الاختيارات غير الصالحة ({missingIds.length})</button></div> : null}{!selected[kind].length ? <p className="text-sm">من غير اختيارات، العميل مش هيقدر يكوّن {kind === "tray" ? "طبلية" : "بوكس"}.</p> : null}<button type="button" onClick={save} disabled={pending || !!missingIds.length} className="btn btn-primary w-full py-4">{pending ? "جارٍ الحفظ…" : `حفظ اختيارات ${names[kind]}`}</button></fieldset>{message ? <p role={message.ok ? "status" : "alert"} className={`rounded-2xl border p-3 text-sm font-bold ${message.ok ? "text-[var(--zaatar)]" : "text-[var(--terracotta)]"}`}>{message.text}</p> : null}</section>
}
