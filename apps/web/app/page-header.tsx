"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

type Props = {
	title?: string
	subtitle?: string
	fallbackHref: string
	tone?: "light" | "dark"
}

// Every flow screen gets the same sticky bar: a real back button (browser
// history first, an explicit fallback second so a shared/scanned link never
// dead-ends) plus a shortcut home. The bar is frosted and only grows a shadow
// once the page is scrolled, so it separates from the content without drawing
// a hard line across a resting screen.
export function PageHeader({ title, subtitle, fallbackHref, tone = "light" }: Props) {
	const router = useRouter()
	const isDark = tone === "dark"
	const [lifted, setLifted] = useState(false)

	useEffect(() => {
		function onScroll() {
			setLifted(window.scrollY > 6)
		}
		onScroll()
		window.addEventListener("scroll", onScroll, { passive: true })
		return () => window.removeEventListener("scroll", onScroll)
	}, [])

	function handleBack() {
		if (typeof window !== "undefined" && window.history.length > 1) {
			router.back()
			return
		}
		router.push(fallbackHref)
	}

	return (
		<header
			dir="rtl"
			className={`sticky top-0 z-40 flex items-center justify-between gap-2 px-3 py-2.5 transition-shadow duration-200 ${
				isDark ? "glass-dark text-white" : "glass text-[var(--ink)]"
			} ${
				lifted
					? isDark
						? "border-b border-white/10 shadow-[var(--shadow-md)]"
						: "border-b border-[var(--line)] shadow-[var(--shadow-md)]"
					: "border-b border-transparent"
			}`}
		>
			<button
				type="button"
				onClick={handleBack}
				className={`btn shrink-0 rounded-full px-3 py-2 text-sm ${
					isDark
						? "border border-white/15 text-white/85 hover:bg-white/10"
						: "border border-[var(--line)] bg-white/70 text-[var(--ink)]/80 hover:bg-white"
				}`}
			>
				<ChevronRight className="h-4 w-4" />
				رجوع
			</button>

			<div className="min-w-0 flex-1 text-center">
				{title ? <p className="truncate text-[15px] font-black leading-tight">{title}</p> : null}
				{subtitle ? (
					<p
						className={`truncate text-[11px] font-bold ${isDark ? "text-white/50" : "text-[var(--ink)]/50"}`}
					>
						{subtitle}
					</p>
				) : null}
			</div>

			<Link
				href="/"
				aria-label="الصفحة الرئيسية"
				className={`btn h-9 w-9 shrink-0 rounded-full ${
					isDark
						? "border border-white/15 text-white/85 hover:bg-white/10"
						: "border border-[var(--line)] bg-white/70 text-[var(--ink)]/80 hover:bg-white"
				}`}
			>
				<Home className="h-4 w-4" />
			</Link>
		</header>
	)
}
