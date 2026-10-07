"use client"

import { useMemo, useState, useTransition } from "react"
import { ChefHat, Trash2, Plus, Loader2 } from "lucide-react"
import { setRecipeLine, removeRecipeLine } from "./actions"

type MenuItem = { id: string; nameAr: string; category: string }
type InventoryItem = { id: string; name: string; unit: string }
type RecipeLine = { menuItemId: string; inventoryItemId: string; quantity: string }

const CATEGORY_LABELS: Record<string, string> = {
	base_item: "صنف أساسي",
	mix: "ميكس",
	platter: "طبق",
	addon: "إضافة",
	breakfast_box: "بوكس فطار",
	beverage: "مشروب",
}

export function RecipeAdminPanel({
	menuItems,
	inventoryItems,
	recipeLines,
}: {
	menuItems: MenuItem[]
	inventoryItems: InventoryItem[]
	recipeLines: RecipeLine[]
}) {
	const [selectedMenuItemId, setSelectedMenuItemId] = useState(menuItems[0]?.id ?? "")

	const linesForItem = useMemo(
		() => recipeLines.filter((line) => line.menuItemId === selectedMenuItemId),
		[recipeLines, selectedMenuItemId],
	)

	const inventoryById = useMemo(() => new Map(inventoryItems.map((item) => [item.id, item])), [inventoryItems])

	const unusedInventoryItems = useMemo(
		() => inventoryItems.filter((item) => !linesForItem.some((line) => line.inventoryItemId === item.id)),
		[inventoryItems, linesForItem],
	)

	const selectedItem = menuItems.find((item) => item.id === selectedMenuItemId)

	if (menuItems.length === 0) {
		return (
			<p className="rounded-2xl border border-dashed border-[var(--ink)]/15 bg-white/60 p-6 text-center text-sm text-[var(--ink)]/50">
				مفيش أصناف مينيو لسه لربطها بالمخزون
			</p>
		)
	}

	if (inventoryItems.length === 0) {
		return (
			<p className="rounded-2xl border border-dashed border-[var(--ink)]/15 bg-white/60 p-6 text-center text-sm text-[var(--ink)]/50">
				مفيش أصناف مخزون لسه — ضيف أصناف من صفحة إدارة المخزون أولاً
			</p>
		)
	}

	return (
		<div className="grid gap-6 md:grid-cols-[280px_1fr]">
			<aside className="flex flex-col gap-1.5">
				{menuItems.map((item) => (
					<button
						key={item.id}
						type="button"
						onClick={() => setSelectedMenuItemId(item.id)}
						className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-right text-sm transition ${
							item.id === selectedMenuItemId
								? "border-[var(--amber)] bg-[var(--sesame)] font-bold"
								: "border-[var(--ink)]/10 bg-white hover:border-[var(--amber)]/40"
						}`}
					>
						<span>{item.nameAr}</span>
						<span className="text-xs text-[var(--ink)]/45">{CATEGORY_LABELS[item.category] ?? item.category}</span>
					</button>
				))}
			</aside>

			<section className="flex flex-col gap-4">
				<h2 className="flex items-center gap-2 text-lg font-bold text-[var(--amber-deep)]">
					<ChefHat className="h-5 w-5" /> خامات {selectedItem?.nameAr ?? ""}
				</h2>

				{linesForItem.length === 0 ? (
					<p className="rounded-2xl border border-dashed border-[var(--ink)]/15 bg-white/60 p-6 text-center text-sm text-[var(--ink)]/50">
						مفيش خامات مربوطة بالصنف ده لسه
					</p>
				) : (
					<div className="flex flex-col gap-3">
						{linesForItem.map((line) => (
							<RecipeLineRow
								key={line.inventoryItemId}
								menuItemId={selectedMenuItemId}
								inventoryItem={inventoryById.get(line.inventoryItemId)}
								quantity={line.quantity}
							/>
						))}
					</div>
				)}

				{unusedInventoryItems.length > 0 ? (
					<AddRecipeLineForm menuItemId={selectedMenuItemId} inventoryItems={unusedInventoryItems} />
				) : null}
			</section>
		</div>
	)
}

function RecipeLineRow({
	menuItemId,
	inventoryItem,
	quantity,
}: {
	menuItemId: string
	inventoryItem?: InventoryItem
	quantity: string
}) {
	const [value, setValue] = useState(quantity)
	const [isPending, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)

	if (!inventoryItem) return null

	function handleSave() {
		setError(null)
		startTransition(async () => {
			try {
				await setRecipeLine(menuItemId, inventoryItem!.id, value || "0")
			} catch (submitError) {
				setError(submitError instanceof Error ? submitError.message : "حصل خطأ")
			}
		})
	}

	function handleRemove() {
		setError(null)
		startTransition(async () => {
			try {
				await removeRecipeLine(menuItemId, inventoryItem!.id)
			} catch (submitError) {
				setError(submitError instanceof Error ? submitError.message : "حصل خطأ")
			}
		})
	}

	return (
		<div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--ink)]/10 bg-white p-3.5">
			<div className="min-w-[120px] flex-1">
				<p className="font-bold">{inventoryItem.name}</p>
			</div>
			<input
				value={value}
				onChange={(event) => setValue(event.target.value)}
				inputMode="decimal"
				className="w-24 rounded-lg border border-[var(--ink)]/15 px-2 py-1.5 text-sm"
			/>
			<span className="text-xs text-[var(--ink)]/60">{inventoryItem.unit}</span>
			<button
				type="button"
				disabled={isPending}
				onClick={handleSave}
				className="flex items-center gap-1 rounded-lg bg-[var(--amber)] px-3 py-1.5 text-xs font-bold text-[var(--ink)] transition active:scale-95 disabled:opacity-50"
			>
				{isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
				حفظ
			</button>
			<button
				type="button"
				disabled={isPending}
				onClick={handleRemove}
				className="flex items-center gap-1 rounded-lg border border-red-300 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
			>
				<Trash2 className="h-3.5 w-3.5" /> حذف
			</button>
			{error ? <p className="w-full text-xs text-red-500">{error}</p> : null}
		</div>
	)
}

function AddRecipeLineForm({
	menuItemId,
	inventoryItems,
}: {
	menuItemId: string
	inventoryItems: InventoryItem[]
}) {
	const [inventoryItemId, setInventoryItemId] = useState(inventoryItems[0]?.id ?? "")
	const [quantity, setQuantity] = useState("")
	const [isPending, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)

	function handleAdd() {
		if (!inventoryItemId || !quantity) return
		setError(null)
		startTransition(async () => {
			try {
				await setRecipeLine(menuItemId, inventoryItemId, quantity)
				setQuantity("")
			} catch (submitError) {
				setError(submitError instanceof Error ? submitError.message : "حصل خطأ")
			}
		})
	}

	return (
		<div className="rounded-2xl border border-dashed border-[var(--amber)] bg-white p-4">
			<h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
				<Plus className="h-4 w-4 text-[var(--amber-deep)]" /> إضافة خامة للوصفة
			</h3>
			<div className="flex flex-wrap items-center gap-3">
				<select
					value={inventoryItemId}
					onChange={(event) => setInventoryItemId(event.target.value)}
					className="rounded-lg border border-[var(--ink)]/15 px-3 py-2 text-sm outline-none transition focus:border-[var(--amber)]"
				>
					{inventoryItems.map((item) => (
						<option key={item.id} value={item.id}>
							{item.name} ({item.unit})
						</option>
					))}
				</select>
				<input
					value={quantity}
					onChange={(event) => setQuantity(event.target.value)}
					inputMode="decimal"
					placeholder="الكمية للصنف الواحد"
					className="w-32 rounded-lg border border-[var(--ink)]/15 px-3 py-2 text-sm outline-none transition focus:border-[var(--amber)]"
				/>
				<button
					type="button"
					disabled={isPending || !quantity}
					onClick={handleAdd}
					className="flex items-center gap-1.5 rounded-lg bg-[var(--amber)] px-4 py-2 text-sm font-bold text-[var(--ink)] transition active:scale-95 disabled:opacity-50"
				>
					{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
					إضافة
				</button>
			</div>
			{error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
		</div>
	)
}
