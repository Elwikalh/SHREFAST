"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { ShoppingBag, ChevronLeft } from "lucide-react"
import { useCartStore, cartTotal, cartCount } from "@/lib/cart-store"

type Props = {
	href: string
}

// A fixed bottom bar shown only on mobile once the cart has items. It moves the
// customer forward to the checkout step instead of scrolling the current page,
// so the menu stays exactly where the customer left it.
export function MobileCartBar({ href }: Props) {
	const lines = useCartStore((state) => state.lines)
	const total = cartTotal(lines)
	const count = cartCount(lines)

	return (
		<AnimatePresence>
			{count > 0 ? (
				<motion.div
					dir="rtl"
					initial={{ y: 90, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					exit={{ y: 90, opacity: 0 }}
					transition={{ type: "spring", stiffness: 320, damping: 30 }}
					/* Sits above the phone's home indicator instead of under it. */
					style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }}
					className="fixed inset-x-4 z-30 md:hidden"
				>
					<Link
						href={href}
						className="btn w-full justify-between rounded-2xl bg-[var(--ink)] px-3.5 py-3 text-white shadow-[var(--shadow-lg)]"
					>
						<span className="flex items-center gap-2.5">
							<span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
								<ShoppingBag className="h-4 w-4" />
								<motion.span
									key={count}
									initial={{ scale: 0.5 }}
									animate={{ scale: 1 }}
									transition={{ type: "spring", stiffness: 500, damping: 18 }}
									className="num absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--amber)] px-1 text-[11px] font-black text-[var(--ink)]"
								>
									{count}
								</motion.span>
							</span>
							<span className="num text-base font-black">{total} ج.م</span>
						</span>
						<span className="flex items-center gap-1 text-sm font-black text-[var(--amber)]">
							اتمام الطلب
							<ChevronLeft className="h-4 w-4" />
						</span>
					</Link>
				</motion.div>
			) : null}
		</AnimatePresence>
	)
}
