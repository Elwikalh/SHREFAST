import Link from "next/link"
import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { ChevronLeft, MonitorSmartphone, Store, UtensilsCrossed, Users } from "lucide-react"
import { db, branches } from "@el7bboB/db"
import { getStaffSession } from "@/lib/staff-session"

// Always resolves the visitor's live session/role, so this must never be
// statically cached.
export const dynamic = "force-dynamic"

export default async function StaffLandingPage() {
	const staffSession = await getStaffSession()
	if (!staffSession) redirect("/staff/login")

	if (staffSession.role !== "admin") {
		if (!staffSession.branchId) redirect("/staff/pending")

		const [assignedBranch] = await db
			.select()
			.from(branches)
			.where(eq(branches.id, staffSession.branchId))

		if (!assignedBranch) redirect("/staff/pending")
		redirect(`/staff/${assignedBranch.code}`)
	}

	// Admins oversee every point of sale and the main store from here.
	const allBranches = await db.select().from(branches)

	return (
		<main className="mx-auto max-w-3xl px-4 py-10">
			<div className="card mb-5 flex flex-wrap items-center justify-between gap-3 p-5">
				<div className="flex items-center gap-3">
					<span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--sesame)] text-[var(--amber-deep)]">
						<MonitorSmartphone className="h-5 w-5" />
					</span>
					<div>
						<h1 className="text-2xl font-black text-[var(--ink)]">شاشات الطلبات</h1>
						<p className="mt-0.5 text-sm font-bold text-[var(--ink)]/50">اختار نقطة البيع عشان تتابع طلباتها اللحظة</p>
					</div>
				</div>
				<Link href="/staff/admin" className="btn btn-outline rounded-xl px-4 py-2.5 text-sm">
					<Users className="h-4 w-4" /> لوحة الإدارة
				</Link>
			</div>

			<div className="grid gap-4 sm:grid-cols-2">
				{allBranches.map((branch) => (
					<Link
						key={branch.id}
						href={`/staff/${branch.code}`}
						className="card card-lift flex items-center justify-between gap-3 p-5"
					>
						<span className="flex min-w-0 items-center gap-3">
							<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--sesame)] text-[var(--amber-deep)]">
								{branch.type === "restaurant" ? (
									<UtensilsCrossed className="h-5 w-5" />
								) : (
									<Store className="h-5 w-5" />
								)}
							</span>
							<span className="min-w-0">
								<span className="block truncate font-black text-[var(--ink)]">{branch.name}</span>
								<span className="block text-xs font-bold text-[var(--ink)]/45">
									{branch.type === "restaurant" ? "المحل الرئيسي" : "نقطة بيع"}
								</span>
							</span>
						</span>
						<ChevronLeft className="h-4 w-4 shrink-0 text-[var(--ink)]/30" />
					</Link>
				))}
			</div>
		</main>
	)
}
