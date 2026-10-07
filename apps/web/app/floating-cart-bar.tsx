"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react"
import { useCartStore, cartTotal, cartCount } from "@/lib/cart-store"

export function FloatingCartBar({ isAr }: { isAr: boolean }) {
	const lines = useCartStore((state) => state.lines)
	const total = cartTotal(lines)
	const count = cartCount(lines)
	const Arrow = isAr ? ChevronLeft : ChevronRight
	return <AnimatePresence>{count > 0 ? <motion.div dir={isAr ? "rtl" : "ltr"} initial={{ y: 90, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 90, opacity: 0 }} transition={{ type: "spring", stiffness: 320, damping: 30 }} style={{ bottom: "max(1rem, env(safe-area-inset-bottom))" }} className="fixed inset-x-4 z-30 mx-auto max-w-md"><Link href="/order/checkout" className="btn w-full justify-between rounded-2xl bg-[var(--ink)] px-3.5 py-3 text-white shadow-[var(--shadow-lg)] ring-1 ring-white/10"><span className="flex items-center gap-2.5"><span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-white/10"><ShoppingBag className="h-4 w-4" /><motion.span key={count} initial={{ scale: .5 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }} className="num absolute -top-1 -left-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--amber)] px-1 text-[11px] font-black text-[var(--ink)]">{count}</motion.span></span><span className="num text-base font-black">{total} {isAr ? "ج.م" : "EGP"}</span></span><span className="flex items-center gap-1 text-sm font-black text-[var(--amber)]">{isAr ? "إتمام الطلب" : "Checkout"}<Arrow className="h-4 w-4" /></span></Link></motion.div> : null}</AnimatePresence>
}
