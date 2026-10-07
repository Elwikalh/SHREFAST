"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

// Lightweight polling refresh for the staff/KDS screen. This keeps the
// implementation simple for the first version; a future iteration should
// replace this with Postgres LISTEN/NOTIFY + Server-Sent Events for instant
// (non-polling) updates, per the platform spec.
export function AutoRefresh({ intervalMs = 3000 }: { intervalMs?: number }) {
	const router = useRouter()

	useEffect(() => {
		const id = setInterval(() => {
			router.refresh()
		}, intervalMs)
		const refreshNow = () => {
			if (document.visibilityState === "visible") router.refresh()
		}
		document.addEventListener("visibilitychange", refreshNow)
		window.addEventListener("focus", refreshNow)
		return () => {
			clearInterval(id)
			document.removeEventListener("visibilitychange", refreshNow)
			window.removeEventListener("focus", refreshNow)
		}
	}, [router, intervalMs])

	return null
}
