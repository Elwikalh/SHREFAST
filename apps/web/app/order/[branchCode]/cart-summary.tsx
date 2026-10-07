"use client"

import Link from "next/link"
import { ChevronLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react"
import { cartCount, cartTotal, lineTotalEGP, lineUnitEGP, useCartStore } from "@/lib/cart-store"

type Props = {
	checkoutHref: string
}

// The running order as it is being built: every row states the quantity, the
// price of one, and the price of the row, so the numbers can be checked at a
// glance. No customer fields live here — they belong to the checkout step.
export function CartSummary({ checkoutHref }: Props) {
	const lines = useCartStore((state) => state.lines)
	const removeLineById = useCartStore((state) => state.removeLineById)
	const setLineQuantity = useCartStore((state) => state.setLineQuantity)

	const total = cartTotal(lines)
	const count = cartCount(lines)

	if (lines.length === 0) {
		return (
			<div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--surface-muted)] p-7 text-center">
				<span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--sesame)] text-[var(--ink)]/35">
					<ShoppingBag className="h-5 w-5" />
				</span>
				<p className="text-sm font-bold text-[var(--ink)]/45">السلة فاضية — دوس أضف على أي صنف</p>
			</div>
		)
	}

	return (
		<div className="card flex flex-col gap-3 p-4">
			<div className="flex items-center justify-between">
				<h2 className="flex items-center gap-2 font-black text-[var(--ink)]">
					<span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--amber)]/18 text-[var(--amber-deep)]">
						<ShoppingBag className="h-4 w-4" />
					</span>
					طلبك
				</h2>
				<span className="chip num">{count} أصناف</span>
			</div>

			<ul className="flex flex-col gap-2">
				{lines.map((line) => (
					<li
						key={line.id}
						className="flex items-center justify-between gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] px-3 py-2.5 text-sm"
					>
						<div className="min-w-0">
							<p className="truncate font-black">
								<span className="num text-[var(--amber-deep)]">{line.quantity}×</span> {line.nameAr}
							</p>
							{line.addons.length > 0 ? (
								<p className="truncate text-xs font-bold text-[var(--ink)]/50">
									+ {line.addons.map((addon) => addon.nameAr).join("، ")}
								</p>
							) : null}
							<p className="num mt-0.5 text-xs font-bold text-[var(--ink)]/55">
								{lineUnitEGP(line)} ج.م للواحد ·{" "}
								<span className="text-[var(--amber-deep)]">{lineTotalEGP(line)} ج.م</span>
							</p>
						</div>
						<div className="flex shrink-0 items-center gap-1">
							<button
								type="button"
								onClick={() => setLineQuantity(line.id, line.quantity - 1)}
								className="btn h-8 w-8 rounded-full border border-[var(--line)] bg-white hover:bg-[var(--sesame)]"
								aria-label="أقل"
							>
								<Minus className="h-3.5 w-3.5" />
							</button>
							<span className="num w-5 text-center font-black">{line.quantity}</span>
							<button
								type="button"
								onClick={() => setLineQuantity(line.id, line.quantity + 1)}
								className="btn h-8 w-8 rounded-full border border-[var(--line)] bg-white hover:bg-[var(--sesame)]"
								aria-label="أكتر"
							>
								<Plus className="h-3.5 w-3.5" />
							</button>
							<button
								type="button"
								onClick={() => removeLineById(line.id)}
								className="btn h-8 w-8 rounded-full text-[var(--terracotta)] hover:bg-[var(--terracotta)]/10"
								aria-label="حذف"
							>
								<Trash2 className="h-4 w-4" />
							</button>
						</div>
					</li>
				))}
			</ul>

			<div className="flex items-center justify-between rounded-2xl bg-[var(--sesame)] px-3 py-2.5 font-black">
				<span>الإجمالي</span>
				<span className="num text-lg text-[var(--amber-deep)]">{total} ج.م</span>
			</div>

			<Link href={checkoutHref} className="btn btn-primary px-4 py-4 text-base">
				اتمام الطلب
				<ChevronLeft className="h-4 w-4" />
			</Link>
		</div>
	)
}
