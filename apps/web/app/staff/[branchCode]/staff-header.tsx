"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { Loader2, LogOut, MonitorSmartphone, UserRound } from "lucide-react"
import { authClient } from "@/lib/auth-client"

// Who is on shift, on which role, with one clear way out. Staff share these
// screens, so the signed-in name has to be readable at a glance.
export function StaffHeader({ name, roleText }: { name: string; roleText: string }) {
	const router = useRouter()
	const [isPending, startTransition] = useTransition()

	function handleSignOut() {
		startTransition(async () => {
			await authClient.signOut()
			router.push("/staff/login")
			router.refresh()
		})
	}

	return (
		<div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] px-4 py-3">
			<span className="flex min-w-0 items-center gap-2.5">
				<span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--sesame)] text-[var(--amber-deep)]">
					<UserRound className="h-4 w-4" />
				</span>
				<span className="min-w-0">
					<span className="block truncate text-sm font-black text-[var(--ink)]">{name}</span>
					<span className="block text-xs font-bold text-[var(--ink)]/45">{roleText}</span>
				</span>
			</span>

			<span className="flex items-center gap-2">
				<Link href="/wasl/index.html#merchant?ref=SX-8&page=newreq&embed=1" target="_blank" className="btn btn-primary rounded-xl px-3 py-2 text-xs">
					🛵 اطلب دليفري
				</Link>
				<Link href="/staff" className="btn btn-outline rounded-xl px-3 py-2 text-xs">
					<MonitorSmartphone className="h-3.5 w-3.5" /> كل الشاشات
				</Link>
				<button
					type="button"
					disabled={isPending}
					onClick={handleSignOut}
					className="btn rounded-xl border border-[var(--terracotta)]/40 px-3 py-2 text-xs text-[var(--terracotta)] hover:bg-[var(--terracotta)]/10"
				>
					{isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
					خروج
				</button>
			</span>
		</div>
	)
}
