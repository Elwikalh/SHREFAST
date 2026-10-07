import Link from "next/link"
import { eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { ArrowRight, ChefHat } from "lucide-react"
import { branches, db } from "@el7bboB/db"
import { loadStaffOrders } from "@/lib/orders/staff-orders"
import { requireBranchAccess, roleLabel } from "@/lib/staff-session"
import { AutoRefresh } from "../auto-refresh"
import { OrderCard } from "../order-card"
import { StaffHeader } from "../staff-header"

export const dynamic = "force-dynamic"

export default async function KitchenBoardPage({ params }: { params: Promise<{ branchCode: string }> }) {
	const { branchCode } = await params
	const staffSession = await requireBranchAccess(branchCode)
	const [branch] = await db.select().from(branches).where(eq(branches.code, branchCode))
	if (!branch) notFound()

	const kitchenOrders = await loadStaffOrders({
		branchId: branch.id,
		statuses: ["queued", "in_progress", "ready"],
	})

	return (
		<main className="mx-auto max-w-7xl px-4 py-8">
			<AutoRefresh intervalMs={3000} />
			<StaffHeader name={staffSession.name} roleText={roleLabel(staffSession.role)} />

			<div className="card mb-5 flex flex-wrap items-center justify-between gap-4 p-5">
				<div className="flex items-center gap-3">
					<span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--zaatar)]/14 text-[var(--zaatar)]">
						<ChefHat className="h-6 w-6" />
					</span>
					<div>
						<p className="text-xs font-black text-[var(--zaatar)]">شاشة التحضير</p>
						<h1 className="text-2xl font-black text-[var(--ink)]">المطبخ · {branch.name}</h1>
						<p className="mt-1 text-xs font-bold text-[var(--ink)]/45">الكاشير والدليفري بيدخلوا هنا بعد تأكيد الدفع</p>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<span className="num rounded-full bg-[var(--zaatar)] px-3 py-1.5 text-sm font-black text-white">{kitchenOrders.length} أوردر</span>
					<Link href={`/staff/${branch.code}`} className="btn btn-outline rounded-xl px-3 py-2 text-xs"><ArrowRight className="h-4 w-4" /> التشغيل</Link>
				</div>
			</div>

			{kitchenOrders.length === 0 ? (
				<div className="rounded-3xl border border-dashed border-[var(--line-strong)] bg-[var(--surface-muted)] p-12 text-center">
					<ChefHat className="mx-auto h-9 w-9 text-[var(--ink)]/20" />
					<p className="mt-3 font-black text-[var(--ink)]/55">المطبخ هادي — مفيش أوردرات للتحضير</p>
				</div>
			) : (
				<div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">
					{kitchenOrders.map((order) => <OrderCard key={order.id} branchCode={branch.code} order={order} />)}
				</div>
			)}
		</main>
	)
}
