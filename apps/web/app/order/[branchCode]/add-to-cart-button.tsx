"use client"

import { useState } from "react"
import { Plus, Minus, Check } from "lucide-react"
import { useCartStore } from "@/lib/cart-store"

type Props = {
	menuItemId: string
	nameAr: string
	priceEGP: number
}

// A fast add-to-cart control: shows a plain "add" button until the item is
// in the cart, then switches in place to a +/- stepper so re-ordering more
// of the same item never requires leaving the menu or opening the cart.
// A plain item with no add-ons uses its own id as the cart line id.
export function AddToCartButton({ menuItemId, nameAr, priceEGP }: Props) {
	const lines = useCartStore((state) => state.lines)
	const addItem = useCartStore((state) => state.addItem)
	const setLineQuantity = useCartStore((state) => state.setLineQuantity)
	const [justAdded, setJustAdded] = useState(false)

	const quantity = lines.find((line) => line.id === menuItemId)?.quantity ?? 0

	function handleAdd() {
		addItem({ menuItemId, nameAr, priceEGP })
		setJustAdded(true)
		window.setTimeout(() => setJustAdded(false), 600)
	}

	if (quantity === 0) {
		return (
			<button
				type="button"
				onClick={handleAdd}
				className="btn shrink-0 rounded-full bg-[var(--ink)] px-4 py-2.5 text-sm text-[var(--cream)] shadow-[var(--shadow-sm)] hover:bg-[var(--amber-deep)] hover:text-[var(--ink)]"
			>
				{justAdded ? <Check className="h-4 w-4" strokeWidth={3} /> : <Plus className="h-4 w-4" strokeWidth={3} />}
				أضف
			</button>
		)
	}

	// Amber stepper: the row reads as "already in the order" without any extra
	// label or explanation.
	return (
		<div className="flex shrink-0 items-center gap-1.5 rounded-full bg-[var(--amber)] px-1.5 py-1 text-[var(--ink)] shadow-[var(--shadow-amber)]">
			<button
				type="button"
				onClick={() => setLineQuantity(menuItemId, quantity - 1)}
				className="btn h-7 w-7 rounded-full hover:bg-black/10"
				aria-label="تقليل"
			>
				<Minus className="h-3.5 w-3.5" strokeWidth={3} />
			</button>
			<span className="num min-w-[1.25rem] text-center text-sm font-black">{quantity}</span>
			<button
				type="button"
				onClick={() => setLineQuantity(menuItemId, quantity + 1)}
				className="btn h-7 w-7 rounded-full hover:bg-black/10"
				aria-label="زيادة"
			>
				<Plus className="h-3.5 w-3.5" strokeWidth={3} />
			</button>
		</div>
	)
}
