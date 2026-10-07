"use client"

import { useMemo, useState, useTransition } from "react"
import { AlertTriangle, Package, Plus, Truck, Pencil, Loader2, X } from "lucide-react"
import {
	createInventoryItem,
	updateInventoryItem,
	setLowStockThreshold,
	receiveStock,
	type InventoryItemInput,
} from "./actions"

type InventoryItem = { id: string; name: string; unit: string; unitCostEGP: string }
type Branch = { id: string; name: string }
type StockRow = { branchId: string; inventoryItemId: string; currentStock: string; lowStockThreshold: string }

const EMPTY_FORM: InventoryItemInput = { name: "", unit: "", unitCostEGP: "0" }

export function InventoryAdminPanel({
	items,
	branches,
	stock,
}: {
	items: InventoryItem[]
	branches: Branch[]
	stock: StockRow[]
}) {
	const [selectedBranchId, setSelectedBranchId] = useState(branches[0]?.id ?? "")

	const lowStockCount = useMemo(
		() =>
			stock.filter(
				(row) => Number(row.lowStockThreshold) > 0 && Number(row.currentStock) <= Number(row.lowStockThreshold),
			).length,
		[stock],
	)

	return (
		<div className="flex flex-col gap-8">
			<div className="grid gap-3 sm:grid-cols-3">
				<StatCard icon={Package} label="أصناف المخزون" value={items.length} />
				<StatCard icon={Truck} label="الفروع المزودة" value={branches.length} />
				<StatCard
					icon={AlertTriangle}
					label="واصل حد النفاد"
					value={lowStockCount}
					tint={lowStockCount > 0 ? "text-red-600" : "text-[var(--amber-deep)]"}
				/>
			</div>

			{lowStockCount > 0 ? (
				<div className="flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-bold text-red-700">
					<AlertTriangle className="h-4 w-4 shrink-0" />
					تنبيه: {lowStockCount} صنف وصل حد النفاد في فرع أو أكتر
				</div>
			) : null}

			<NewItemForm />

			<section>
				<h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-[var(--amber-deep)]">
					<Package className="h-5 w-5" /> أصناف المخزون ({items.length})
				</h2>
				{items.length === 0 ? (
					<p className="rounded-2xl border border-dashed border-[var(--ink)]/15 bg-white/60 p-6 text-center text-sm text-[var(--ink)]/50">
						مفيش أصناف مخزون لسه
					</p>
				) : (
					<div className="grid gap-3 sm:grid-cols-2">
						{items.map((item) => (
							<InventoryItemRow key={item.id} item={item} />
						))}
					</div>
				)}
			</section>

			<section>
				<div className="mb-3 flex flex-wrap items-center justify-between gap-3">
					<h2 className="flex items-center gap-2 text-lg font-bold text-[var(--amber-deep)]">
						<Truck className="h-5 w-5" /> المخزون حسب الفرع
					</h2>
					<select
						value={selectedBranchId}
						onChange={(event) => setSelectedBranchId(event.target.value)}
						className="rounded-lg border border-[var(--ink)]/15 bg-white px-3 py-2 text-sm font-semibold outline-none transition focus:border-[var(--amber)]"
					>
						{branches.map((branch) => (
							<option key={branch.id} value={branch.id}>
								{branch.name}
							</option>
						))}
					</select>
				</div>

				{items.length === 0 || !selectedBranchId ? (
					<p className="rounded-2xl border border-dashed border-[var(--ink)]/15 bg-white/60 p-6 text-center text-sm text-[var(--ink)]/50">
						أضف صنف مخزون وفرع أولاً
					</p>
				) : (
					<div className="flex flex-col gap-3">
						{items.map((item) => {
							const stockRow = stock.find(
								(row) => row.branchId === selectedBranchId && row.inventoryItemId === item.id,
							)
							return (
								<BranchStockRow
									key={item.id}
									branchId={selectedBranchId}
									item={item}
									currentStock={stockRow?.currentStock ?? "0"}
									lowStockThreshold={stockRow?.lowStockThreshold ?? "0"}
								/>
							)
						})}
					</div>
				)}
			</section>
		</div>
	)
}

function StatCard({
	icon: Icon,
	label,
	value,
	tint = "text-[var(--amber-deep)]",
}: {
	icon: typeof Package
	label: string
	value: number
	tint?: string
}) {
	return (
		<div className="flex items-center gap-3 rounded-2xl border border-[var(--ink)]/10 bg-white p-4">
			<span className={`flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--sesame)] ${tint}`}>
				<Icon className="h-5 w-5" />
			</span>
			<div>
				<p className="text-2xl font-black">{value}</p>
				<p className="text-xs font-semibold text-[var(--ink)]/55">{label}</p>
			</div>
		</div>
	)
}

function NewItemForm() {
	const [form, setForm] = useState<InventoryItemInput>(EMPTY_FORM)
	const [isPending, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)

	function handleCreate() {
		setError(null)
		startTransition(async () => {
			try {
				await createInventoryItem(form)
				setForm(EMPTY_FORM)
			} catch (submitError) {
				setError(submitError instanceof Error ? submitError.message : "حصل خطأ")
			}
		})
	}

	return (
		<section className="rounded-2xl border border-dashed border-[var(--amber)] bg-white p-4">
			<h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
				<Plus className="h-5 w-5 text-[var(--amber-deep)]" /> إضافة صنف مخزون جديد
			</h2>
			<div className="grid gap-3 sm:grid-cols-3">
				<input
					value={form.name}
					onChange={(event) => setForm({ ...form, name: event.target.value })}
					placeholder="اسم الصنف، مثال: عيش بلدي"
					className="rounded-lg border border-[var(--ink)]/15 px-3 py-2 text-sm outline-none transition focus:border-[var(--amber)]"
				/>
				<input
					value={form.unit}
					onChange={(event) => setForm({ ...form, unit: event.target.value })}
					placeholder="الوحدة، مثال: رغيف / كيلو / لتر"
					className="rounded-lg border border-[var(--ink)]/15 px-3 py-2 text-sm outline-none transition focus:border-[var(--amber)]"
				/>
				<input
					value={form.unitCostEGP}
					onChange={(event) => setForm({ ...form, unitCostEGP: event.target.value })}
					placeholder="تكلفة الوحدة (جنيه)"
					inputMode="decimal"
					className="rounded-lg border border-[var(--ink)]/15 px-3 py-2 text-sm outline-none transition focus:border-[var(--amber)]"
				/>
			</div>
			<button
				type="button"
				disabled={isPending || !form.name || !form.unit}
				onClick={handleCreate}
				className="mt-3 flex items-center gap-1.5 rounded-lg bg-[var(--amber)] px-4 py-2 text-sm font-bold text-[var(--ink)] transition active:scale-95 disabled:opacity-50"
			>
				{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
				إضافة
			</button>
			{error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
		</section>
	)
}

function InventoryItemRow({ item }: { item: InventoryItem }) {
	const [isEditing, setIsEditing] = useState(false)
	const [form, setForm] = useState<InventoryItemInput>({
		name: item.name,
		unit: item.unit,
		unitCostEGP: item.unitCostEGP,
	})
	const [isPending, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)

	function handleSave() {
		setError(null)
		startTransition(async () => {
			try {
				await updateInventoryItem(item.id, form)
				setIsEditing(false)
			} catch (submitError) {
				setError(submitError instanceof Error ? submitError.message : "حصل خطأ")
			}
		})
	}

	if (isEditing) {
		return (
			<div className="rounded-2xl border border-[var(--amber)] bg-white p-3 sm:col-span-2">
				<div className="grid gap-3 sm:grid-cols-3">
					<input
						value={form.name}
						onChange={(event) => setForm({ ...form, name: event.target.value })}
						className="rounded-lg border border-[var(--ink)]/15 px-3 py-2 text-sm"
					/>
					<input
						value={form.unit}
						onChange={(event) => setForm({ ...form, unit: event.target.value })}
						className="rounded-lg border border-[var(--ink)]/15 px-3 py-2 text-sm"
					/>
					<input
						value={form.unitCostEGP}
						onChange={(event) => setForm({ ...form, unitCostEGP: event.target.value })}
						inputMode="decimal"
						className="rounded-lg border border-[var(--ink)]/15 px-3 py-2 text-sm"
					/>
				</div>
				<div className="mt-3 flex gap-2">
					<button
						type="button"
						disabled={isPending}
						onClick={handleSave}
						className="rounded-lg bg-[var(--amber)] px-3 py-1.5 text-sm font-bold text-[var(--ink)] disabled:opacity-50"
					>
						حفظ
					</button>
					<button
						type="button"
						disabled={isPending}
						onClick={() => setIsEditing(false)}
						className="flex items-center gap-1 rounded-lg border border-[var(--ink)]/20 px-3 py-1.5 text-sm font-bold disabled:opacity-50"
					>
						<X className="h-3.5 w-3.5" /> إلغاء
					</button>
				</div>
				{error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
			</div>
		)
	}

	return (
		<div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--ink)]/10 bg-white p-3.5 transition hover:border-[var(--amber)]/40">
			<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--sesame)] text-[var(--amber-deep)]">
				<Package className="h-5 w-5" />
			</span>
			<div className="min-w-0 flex-1">
				<p className="font-bold">{item.name}</p>
				<p className="text-xs text-[var(--ink)]/55">
					الوحدة: {item.unit} — تكلفة الوحدة: {item.unitCostEGP} ج.م
				</p>
			</div>
			<button
				type="button"
				onClick={() => setIsEditing(true)}
				className="flex items-center gap-1 rounded-lg bg-[var(--amber)] px-2.5 py-1.5 text-xs font-bold text-[var(--ink)] transition active:scale-95"
			>
				<Pencil className="h-3.5 w-3.5" /> تعديل
			</button>
		</div>
	)
}

function BranchStockRow({
	branchId,
	item,
	currentStock,
	lowStockThreshold,
}: {
	branchId: string
	item: InventoryItem
	currentStock: string
	lowStockThreshold: string
}) {
	const [threshold, setThreshold] = useState(lowStockThreshold)
	const [receiveQuantity, setReceiveQuantity] = useState("")
	const [note, setNote] = useState("")
	const [isPending, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)

	const isLow = Number(lowStockThreshold) > 0 && Number(currentStock) <= Number(lowStockThreshold)

	function handleSaveThreshold() {
		setError(null)
		startTransition(async () => {
			try {
				await setLowStockThreshold(branchId, item.id, threshold || "0")
			} catch (submitError) {
				setError(submitError instanceof Error ? submitError.message : "حصل خطأ")
			}
		})
	}

	function handleReceive() {
		if (!receiveQuantity) return
		setError(null)
		startTransition(async () => {
			try {
				await receiveStock({ branchId, inventoryItemId: item.id, quantity: receiveQuantity, note })
				setReceiveQuantity("")
				setNote("")
			} catch (submitError) {
				setError(submitError instanceof Error ? submitError.message : "حصل خطأ")
			}
		})
	}

	return (
		<div
			className={`flex flex-wrap items-center gap-3 rounded-2xl border p-3.5 ${
				isLow ? "border-red-300 bg-red-50" : "border-[var(--ink)]/10 bg-white"
			}`}
		>
			<div className="min-w-[140px] flex-1">
				<p className="font-bold">{item.name}</p>
				<p className={`flex items-center gap-1 text-xs ${isLow ? "font-bold text-red-600" : "text-[var(--ink)]/60"}`}>
					{isLow ? <AlertTriangle className="h-3 w-3" /> : null}
					المتاح: {currentStock} {item.unit}
					{isLow ? " — وصل حد النفاد" : ""}
				</p>
			</div>

			<div className="flex items-center gap-2">
				<input
					value={threshold}
					onChange={(event) => setThreshold(event.target.value)}
					inputMode="decimal"
					placeholder="حد التنبيه"
					className="w-24 rounded-lg border border-[var(--ink)]/15 px-2 py-1.5 text-sm"
				/>
				<button
					type="button"
					disabled={isPending}
					onClick={handleSaveThreshold}
					className="rounded-lg border border-[var(--ink)]/20 px-2.5 py-1.5 text-xs font-bold transition hover:bg-[var(--ink)]/5 disabled:opacity-50"
				>
					حفظ الحد
				</button>
			</div>

			<div className="flex items-center gap-2">
				<input
					value={receiveQuantity}
					onChange={(event) => setReceiveQuantity(event.target.value)}
					inputMode="decimal"
					placeholder="كمية مستلمة"
					className="w-24 rounded-lg border border-[var(--ink)]/15 px-2 py-1.5 text-sm"
				/>
				<input
					value={note}
					onChange={(event) => setNote(event.target.value)}
					placeholder="ملاحظة (اختياري)"
					className="w-32 rounded-lg border border-[var(--ink)]/15 px-2 py-1.5 text-sm"
				/>
				<button
					type="button"
					disabled={isPending || !receiveQuantity}
					onClick={handleReceive}
					className="flex items-center gap-1 rounded-lg bg-[var(--amber)] px-3 py-1.5 text-xs font-bold text-[var(--ink)] transition active:scale-95 disabled:opacity-50"
				>
					{isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Truck className="h-3.5 w-3.5" />}
					استلام
				</button>
			</div>

			{error ? <p className="w-full text-xs text-red-500">{error}</p> : null}
		</div>
	)
}
