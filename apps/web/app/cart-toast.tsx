"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { Check } from "lucide-react"
import { useCartStore, cartCount } from "@/lib/cart-store"

export function CartToast() {
	const lines = useCartStore((state) => state.lines)
	const count = cartCount(lines)
	const previousCount = useRef<number | null>(null)
	const mountedAt = useRef(Date.now())
	const [visible, setVisible] = useState(false)
	useEffect(() => {
		const previous = previousCount.current
		previousCount.current = count
		if (previous === null || count <= previous || Date.now() - mountedAt.current < 1200) return
		setVisible(true)
		const timer = window.setTimeout(() => setVisible(false), 1700)
		return () => window.clearTimeout(timer)
	}, [count])
	return <AnimatePresence>{visible ? <motion.div dir="rtl" initial={{ opacity: 0, y: 16, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: .96 }} transition={{ type: "spring", stiffness: 380, damping: 28 }} style={{ bottom: "calc(max(1rem, env(safe-area-inset-bottom)) + 4.5rem)" }} className="pointer-events-none fixed inset-x-0 z-40 flex justify-center px-4"><span className="flex items-center gap-2 rounded-full bg-[var(--ink)] px-4 py-2.5 text-sm font-bold text-white shadow-[var(--shadow-lg)] ring-1 ring-white/10"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--amber)] text-[var(--ink)]"><Check className="h-3 w-3" strokeWidth={3} /></span>تمت الإضافة إلى السلة — <span className="num">{count}</span> منتج</span></motion.div> : null}</AnimatePresence>
}
