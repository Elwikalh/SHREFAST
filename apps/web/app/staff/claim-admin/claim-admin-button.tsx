"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { claimFirstAdmin } from "./actions"

export function ClaimAdminButton() {
	const [isPending, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)
	const router = useRouter()

	function handleClaim() {
		setError(null)
		startTransition(async () => {
			try {
				await claimFirstAdmin()
				router.push("/staff/admin")
			} catch (submitError) {
				setError(submitError instanceof Error ? submitError.message : "حصل خطأ")
			}
		})
	}

	return (
		<div className="flex flex-col items-center gap-2">
			<button
				type="button"
				disabled={isPending}
				onClick={handleClaim}
				className="rounded-full bg-[var(--amber)] px-6 py-3 text-sm font-bold text-[var(--ink)] shadow shadow-[var(--amber)]/30 transition hover:opacity-90 disabled:opacity-50"
			>
				{isPending ? "جاري التفعيل..." : "فعّل حسابي كأدمن"}
			</button>
			{error ? <p className="max-w-xs text-center text-xs text-red-500">{error}</p> : null}
		</div>
	)
}
