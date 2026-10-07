"use client"
import { useEffect, useRef, useState } from "react"
import { useCartStore, MAX_NOTE_LENGTH } from "@/lib/cart-store"
import { BREADS, MEALS, MAX_COMPONENT_QUANTITY, MAX_MEAL_UNITS, componentPrice, expandedMealAddons, isMealFood, mealAddonLabel, priceMeal, type MealKind, type MealProduct } from "./meal-config"

type Props = { kind: MealKind; containerId: string; products: MealProduct[]; isAr: boolean; allowedIds?: string[] | null }
function Counter({ label, value, onChange, isAr }: { label: string; value: number; onChange: (next: number) => void; isAr: boolean }) {
	return <div className="flex shrink-0 items-center gap-1 rounded-xl border border-[var(--line)] bg-white p-1">
		<button type="button" aria-label={`${isAr ? "تقليل" : "Decrease"} ${label}`} disabled={value === 0} onClick={() => onChange(value - 1)} className="btn h-10 w-10 rounded-lg disabled:opacity-30">−</button>
		<output aria-label={`${isAr ? "عدد" : "Quantity"} ${label}`} className="num w-7 text-center font-black">{value}</output>
		<button type="button" aria-label={`${isAr ? "زيادة" : "Increase"} ${label}`} disabled={value >= MAX_COMPONENT_QUANTITY} onClick={() => onChange(value + 1)} className="btn h-10 w-10 rounded-lg disabled:opacity-30">+</button>
	</div>
}
export function MealBuilderCard({ kind, containerId, products, isAr, allowedIds = null }: Props) {
	const dialog = useRef<HTMLDialogElement>(null), [open, setOpen] = useState(false), [counts, setCounts] = useState<Record<string, number>>({}), [note, setNote] = useState(""), [quantity, setQuantity] = useState(1), [search, setSearch] = useState(""), [error, setError] = useState(""), [editingId, setEditingId] = useState<string | null>(null), [added, setAdded] = useState(false)
	const addItem = useCartStore((state) => state.addItem), removeItem = useCartStore((state) => state.removeLineById)
	const meal = MEALS[kind], title = isAr ? meal.nameAr : meal.nameEn, currency = isAr ? "ج.م" : "EGP", foods = products.filter((item) => isMealFood(kind, item) && (allowedIds === null || allowedIds.includes(item.breadParentId ?? item.id))), breads = BREADS.map((bread) => ({ bread, item: products.find((item) => item.slug === bread.slug) })), available = [...foods, ...breads.flatMap(({ item }) => item ? [item] : [])]
	const selected = available.filter((item) => (counts[item.id] ?? 0) > 0), units = Object.values(counts).reduce((sum, count) => sum + count, 0), total = selected.reduce((sum, item) => sum + componentPrice(item) * (counts[item.id] ?? 0), 0) * quantity, missing = Object.keys(counts).filter((id) => counts[id] && !available.some((item) => item.id === id)), ready = foods.some((item) => (counts[item.id] ?? 0) > 0) && units <= MAX_MEAL_UNITS && !missing.length
	useEffect(() => {
		const id = new URLSearchParams(window.location.search).get("editMeal"), line = id ? useCartStore.getState().lines.find((item) => item.id === id && item.menuItemId === containerId) : undefined
		if (!line) return
		const next: Record<string, number> = {}; for (const addon of line.addons) next[addon.menuItemId] = (next[addon.menuItemId] ?? 0) + 1
		setCounts(next); setNote(line.note ?? ""); setQuantity(line.quantity); setEditingId(line.id); setOpen(true)
	}, [containerId])
	useEffect(() => {
		const node = dialog.current; if (!node || !open) return
		const overflow = document.body.style.overflow; document.body.style.overflow = "hidden"; node.showModal()
		return () => { node.close(); document.body.style.overflow = overflow }
	}, [open])
	function setCount(id: string, next: number) { setAdded(false); setError(""); setCounts((current) => ({ ...current, [id]: Math.max(0, Math.min(MAX_COMPONENT_QUANTITY, next)) })) }
	function add() {
		if (!ready) return
		const addons = expandedMealAddons(available, counts)
		try { priceMeal(kind, addons.map((item) => item.menuItemId), products, allowedIds) } catch (caught) { setError(caught instanceof Error ? caught.message : "تعذر إضافة التكوين."); return }
		if (editingId) removeItem(editingId)
		addItem({ menuItemId: containerId, nameAr: meal.nameAr, priceEGP: 0 }, addons, quantity, note)
		setOpen(false); setCounts({}); setNote(""); setQuantity(1); setSearch(""); setEditingId(null); setAdded(true)
		const url = new URL(window.location.href); if (url.searchParams.has("editMeal")) { url.searchParams.delete("editMeal"); window.history.replaceState(null, "", url.pathname + url.search + url.hash) }
	}
	function row(item: MealProduct, name?: string) {
		const label = name ?? (isAr ? item.nameAr : item.nameEn)
		return <div key={item.id} className="flex items-center justify-between gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] p-3"><div className="min-w-0"><p className="text-sm font-black">{label}</p><p className="num mt-1 text-xs text-[var(--ink)]/60">{componentPrice(item)} {currency}</p></div><Counter label={label} value={counts[item.id] ?? 0} onChange={(next) => setCount(item.id, next)} isAr={isAr}/></div>
	}
	return <>
		<button type="button" onClick={() => { setAdded(false); setOpen(true) }} disabled={!foods.length} className="card card-lift flex h-full flex-col items-start justify-between gap-4 border-2 border-dashed border-[var(--amber-deep)]/45 bg-[var(--sesame)] p-4 text-start disabled:opacity-50"><span className="text-xl" aria-hidden="true">{kind === "tray" ? "🍽️" : "📦"}</span><span><span className="block text-[15px] font-black">{title}</span><span className="mt-1 block text-xs font-bold leading-relaxed text-[var(--ink)]/55">{isAr ? kind === "tray" ? <>اعمل طبليتك على مزاجك<br />اظبط احلى طبلية فطار ليك ولحبايبك على مزاجك</> : "ساندوتشات وباكيتات وإضافات باختيارك" : kind === "tray" ? "Loose dishes, packs and extras — no sandwiches" : "Your choice of sandwiches, packs and extras"}</span></span><span className="btn btn-primary w-full rounded-xl py-3 text-sm">{isAr ? "كوّن فطارك" : "Build your breakfast"}</span></button>
		{added ? <p role="status" className="sr-only">{isAr ? "اتضاف التكوين للسلة" : "Added to cart"}</p> : null}
		<dialog ref={dialog} dir={isAr ? "rtl" : "ltr"} aria-labelledby={`meal-title-${kind}`} onKeyDown={(event) => {
				if (event.key !== "Tab") return
				const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button:not(:disabled),input:not(:disabled),textarea:not(:disabled),select:not(:disabled),a[href]")), first = controls[0], last = controls[controls.length - 1]
				if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
				else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
			}} onCancel={(event) => { event.preventDefault(); setOpen(false) }} className="m-auto max-h-[92dvh] w-[calc(100%_-_1rem)] max-w-xl overflow-y-auto rounded-3xl border border-[var(--line)] bg-[var(--surface)] p-0 text-[var(--ink)] shadow-xl backdrop:bg-black/60">
			<header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-[var(--line)] bg-[var(--surface)] p-4"><h3 id={`meal-title-${kind}`} className="text-xl font-black">{title}</h3><button type="button" aria-label={isAr ? "إغلاق" : "Close"} onClick={() => setOpen(false)} className="btn h-11 w-11 rounded-full border">×</button></header>
			<div className="space-y-5 p-4">
				<section aria-label={isAr ? "أصناف الفطار" : "Breakfast items"}><input aria-label={isAr ? "بحث في أصناف الفطار" : "Search breakfast items"} className="input mb-3" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={isAr ? "ابحث عن فول، بطاطس، جبنة…" : "Search dishes and sandwiches…"}/><div className="space-y-2">{foods.filter((item) => `${item.nameAr} ${item.nameEn}`.toLowerCase().includes(search.trim().toLowerCase())).map((item) => row(item))}</div></section>
				<section><h4 className="mb-3 font-black">{isAr ? "العيش — اختار عدد كل نوع" : "Bread — choose each quantity"}</h4><div className="space-y-2">{breads.map(({ bread, item }) => item ? row(item, isAr ? bread.nameAr : bread.nameEn) : <p key={bread.slug} className="rounded-xl border p-3 text-sm opacity-60">{isAr ? bread.nameAr + " — غير متاح" : bread.nameEn + " — unavailable"}</p>)}</div></section>
				{missing.length ? <div role="alert" className="space-y-2 text-sm">{isAr ? "أصناف في التكوين القديم لم تعد متاحة. احذفها قبل الحفظ:" : "Some old items are no longer available. Remove them before saving:"}{missing.map((id) => <button type="button" key={id} onClick={() => setCount(id, 0)} className="btn block border px-4 py-2">{isAr ? "حذف صنف غير متاح" : "Remove unavailable item"}</button>)}</div> : null}
				<section className="rounded-2xl bg-[var(--sesame)] p-3"><h4 className="mb-2 font-black">{isAr ? "ملخص التكوين" : "Your meal"}</h4><p className="text-sm leading-relaxed">{mealAddonLabel(expandedMealAddons(selected, counts)) || (isAr ? "اختر الأصناف بالكميات المطلوبة" : "Choose your items and quantities")}</p></section>
				<textarea aria-label={isAr ? "ملاحظات تجهيز الفطار" : "Breakfast preparation notes"} value={note} maxLength={MAX_NOTE_LENGTH} onChange={(event) => setNote(event.target.value)} rows={2} className="input" placeholder={isAr ? "ملاحظات للمطبخ (اختياري)" : "Kitchen notes (optional)"}/>
				<label className="flex items-center justify-between gap-2 text-sm font-black">{isAr ? kind === "tray" ? "عدد الطبلية بنفس المكونات" : "عدد البوكسات بنفس المكونات" : kind === "tray" ? "Number of trays with the same items" : "Number of boxes with the same items"}<input aria-label={isAr ? "عدد التكوينات" : "Meal quantity"} className="input w-20" type="number" min={1} max={20} value={quantity} onChange={(event) => setQuantity(Math.max(1, Math.min(20, Math.round(Number(event.target.value) || 1))))}/></label>
				{units > MAX_MEAL_UNITS ? <p role="alert">{isAr ? "التكوين الواحد بحد أقصى 100 وحدة؛ قلل العدد أو قسمه لتكوينين." : "Up to 100 units per meal; reduce the selection or split it into two meals."}</p> : null}{error ? <p role="alert">{error}</p> : null}
			</div><footer className="sticky bottom-0 border-t border-[var(--line)] bg-[var(--surface)] p-4"><p aria-live="polite" className="num mb-2 font-black">{isAr ? "الإجمالي" : "Total"}: {Math.round(total * 100) / 100} {currency}</p><button type="button" disabled={!ready} onClick={add} className="btn btn-dark w-full py-4 disabled:opacity-40">{isAr ? editingId ? "حفظ التكوين المعدل" : "إضافة التكوين للسلة" : editingId ? "Save meal changes" : "Add meal to cart"}</button></footer>
		</dialog>
	</>
}
