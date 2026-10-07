"use client"

import { useState } from "react"
import { X, Minus, Plus, Check, UtensilsCrossed, MessageSquare } from "lucide-react"
import { useCartStore, MAX_NOTE_LENGTH } from "@/lib/cart-store"

type AddonOption = {
	id: string
	nameAr: string
	priceEGP: number
}

type Props = {
	item: {
		id: string
		nameAr: string
		nameEn: string
		priceEGP: number
		photoDataUrl: string | null
		descriptionAr: string | null
	}
	addonOptions: AddonOption[]
	onClose: () => void
}

// A zoomed view of one item: big photo, full description, optional add-ons,
// a kitchen note and quantity. Ordering never depends on opening this — the
// menu list itself adds to the cart in one tap — so this stays a look-closer
// surface, and the note is where "على مزاجي" instructions are captured.
export function ItemDetailModal({ item, addonOptions, onClose }: Props) {
	const addItem = useCartStore((state) => state.addItem)
	const [quantity, setQuantity] = useState(1)
	const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([])
	const [note, setNote] = useState("")
	const [justAdded, setJustAdded] = useState(false)

	const selectedAddons = addonOptions.filter((addon) => selectedAddonIds.includes(addon.id))
	const addonsTotal = selectedAddons.reduce((sum, addon) => sum + addon.priceEGP, 0)
	const total = (item.priceEGP + addonsTotal) * quantity

	function toggleAddon(id: string) {
		setSelectedAddonIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
	}

	// The chosen quantity is added to whatever is already in the cart, in one
	// atomic action. Setting the quantity afterwards used to overwrite the
	// count of an item the customer had already added from the menu.
	function handleAdd() {
		const addonsPayload = selectedAddons.map((addon) => ({
			menuItemId: addon.id,
			nameAr: addon.nameAr,
			priceEGP: addon.priceEGP,
		}))

		addItem(
			{ menuItemId: item.id, nameAr: item.nameAr, priceEGP: item.priceEGP },
			addonsPayload,
			quantity,
			note,
		)

		setJustAdded(true)
		window.setTimeout(() => {
			setJustAdded(false)
			onClose()
		}, 450)
	}

	return (
		<div
			dir="rtl"
			className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-4"
			onClick={onClose}
		>
			<div
				onClick={(event) => event.stopPropagation()}
				className="flex max-h-[90vh] w-full flex-col overflow-y-auto rounded-t-3xl bg-[var(--surface)] shadow-[var(--shadow-lg)] sm:max-w-md sm:rounded-3xl"
			>
				{/* The photo is the point of opening this sheet, so it gets real size. */}
				<div className="relative h-56 w-full shrink-0 overflow-hidden bg-[var(--sesame)]">
					{item.photoDataUrl ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={item.photoDataUrl} alt={item.nameAr} className="h-full w-full object-cover" />
					) : (
						<div className="flex h-full w-full items-center justify-center">
							<UtensilsCrossed className="h-10 w-10 text-[var(--amber-deep)]/35" />
						</div>
					)}
					{/* A soft shade under the top edge so the close button and the sheet
						handle stay readable over any photo. */}
					<div
						aria-hidden
						className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/45 to-transparent"
					/>
					<span
						aria-hidden
						className="absolute left-1/2 top-2.5 h-1.5 w-11 -translate-x-1/2 rounded-full bg-white/70 sm:hidden"
					/>
					<button
						type="button"
						onClick={onClose}
						className="btn absolute left-3 top-3 h-9 w-9 rounded-full bg-black/45 text-white backdrop-blur hover:bg-black/60"
						aria-label="إغلاق"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				<div className="flex flex-col gap-4 p-5">
					<div>
						<div className="flex items-start justify-between gap-3">
							<h3 className="text-xl font-black text-[var(--ink)]">{item.nameAr}</h3>
							<span className="num shrink-0 rounded-xl bg-[var(--sesame)] px-2.5 py-1 text-base font-black text-[var(--amber-deep)]">
								{item.priceEGP} ج.م
							</span>
						</div>
						<p className="text-xs font-bold text-[var(--ink)]/35">{item.nameEn}</p>
						{item.descriptionAr ? (
							<p className="mt-2.5 text-sm leading-relaxed text-[var(--ink)]/65">{item.descriptionAr}</p>
						) : null}
					</div>

					{addonOptions.length > 0 ? (
						<div>
							<div className="mb-2 flex items-center gap-3">
								<p className="text-sm font-black text-[var(--ink)]/70">مقبلات مع الطلب</p>
								<span className="hairline flex-1" />
								<span className="text-xs font-bold text-[var(--ink)]/35">اختياري</span>
							</div>
							<div className="flex flex-col gap-2">
								{addonOptions.map((addon) => {
									const checked = selectedAddonIds.includes(addon.id)
									return (
										<button
											key={addon.id}
											type="button"
											onClick={() => toggleAddon(addon.id)}
											className={`flex items-center justify-between gap-2 rounded-2xl border px-3 py-3 text-sm transition ${
												checked
													? "border-[var(--amber-deep)]/45 bg-[var(--sesame)] shadow-[var(--shadow-sm)]"
													: "border-[var(--line)] bg-[var(--surface-muted)] hover:border-[var(--line-strong)]"
											}`}
										>
											<span className="flex items-center gap-2.5 font-bold">
												<span
													className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
														checked
															? "border-[var(--amber-deep)] bg-[var(--amber)]"
															: "border-[var(--line-strong)] bg-white"
													}`}
												>
													{checked ? <Check className="h-3 w-3 text-[var(--ink)]" strokeWidth={3} /> : null}
												</span>
												{addon.nameAr}
											</span>
											<span className="num font-black text-[var(--amber-deep)]">+{addon.priceEGP} ج.م</span>
										</button>
									)
								})}
							</div>
						</div>
					) : null}

					{/* Kitchen note for this item only. Two portions of the same item
						with different notes stay two separate lines on the ticket. */}
					<div>
						<div className="mb-2 flex items-center gap-3">
							<p className="flex items-center gap-1.5 text-sm font-black text-[var(--ink)]/70">
								<MessageSquare className="h-3.5 w-3.5 text-[var(--amber-deep)]" />
								ملاحطات للمطبخ
							</p>
							<span className="hairline flex-1" />
							<span className="text-xs font-bold text-[var(--ink)]/35">اختياري</span>
						</div>
						<textarea
							value={note}
							onChange={(event) => setNote(event.target.value.slice(0, MAX_NOTE_LENGTH))}
							rows={2}
							maxLength={MAX_NOTE_LENGTH}
							placeholder="مثلاً: بدون شطة ، محمر أوي ، لف منفصل"
							className="input min-h-[64px] resize-none text-sm"
						/>
					</div>
				</div>

				{/* The quantity and the add button stay reachable no matter how long the
					description or the add-on list is. */}
				<div
					className="glass sticky bottom-0 mt-auto flex items-center justify-between gap-3 border-t border-[var(--line)] px-5 py-4"
					style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
				>
					<div className="flex items-center gap-2 rounded-full bg-[var(--sesame)] px-2 py-1.5">
						<button
							type="button"
							onClick={() => setQuantity((q) => Math.max(1, q - 1))}
							className="btn h-8 w-8 rounded-full bg-white shadow-[var(--shadow-sm)]"
							aria-label="تقليل"
						>
							<Minus className="h-4 w-4" />
						</button>
						<span className="num w-5 text-center font-black">{quantity}</span>
						<button
							type="button"
							onClick={() => setQuantity((q) => Math.min(20, q + 1))}
							className="btn h-8 w-8 rounded-full bg-white shadow-[var(--shadow-sm)]"
							aria-label="زيادة"
						>
							<Plus className="h-4 w-4" />
						</button>
					</div>

					<button type="button" onClick={handleAdd} className="btn btn-dark flex-1 rounded-xl px-4 py-3.5">
						{justAdded ? <Check className="h-4 w-4" strokeWidth={3} /> : null}
						{justAdded ? "تمت الإضافة" : `أضف للسلة — ${total} ج.م`}
					</button>
				</div>
			</div>
		</div>
	)
}
