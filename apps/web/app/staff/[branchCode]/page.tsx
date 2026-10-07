import Link from "next/link"
import { and, eq, inArray, sql } from "drizzle-orm"
import { notFound } from "next/navigation"
import { Bike, ChefHat, ChevronLeft, MonitorSmartphone, ReceiptText, ShoppingCart } from "lucide-react"
import { branches, db, orders } from "@el7bboB/db"
import { requireBranchAccess, roleLabel } from "@/lib/staff-session"
import { AutoRefresh } from "./auto-refresh"
import { StaffHeader } from "./staff-header"

export const dynamic = "force-dynamic"

const ACTIVE_STATUSES = ["pending_payment", "queued", "in_progress", "ready"] as const

export default async function BranchOperationsPage({ params }: { params: Promise<{ branchCode: string }> }) {
	const { branchCode } = await params
	const staffSession = await requireBranchAccess(branchCode)
	const [branch] = await db.select().from(branches).where(eq(branches.code, branchCode))
	if (!branch) notFound()

	const [deliveryCountRow] = await db
		.select({ count: sql<number>`count(*)` })
		.from(orders)
		.where(
			and(
				eq(orders.branchId, branch.id),
				eq(orders.channel, "online_delivery"),
				inArray(orders.status, [...ACTIVE_STATUSES]),
			),
		)

	const [kitchenCountRow] = await db
		.select({ count: sql<number>`count(*)` })
		.from(orders)
		.where(
			and(
				eq(orders.branchId, branch.id),
				inArray(orders.status, ["queued", "in_progress", "ready"]),
			),
		)

	const deliveryCount = Number(deliveryCountRow?.count ?? 0)
	const kitchenCount = Number(kitchenCountRow?.count ?? 0)
	const canManageFront = staffSession.role !== "kitchen"

	return (
		<main className="mx-auto max-w-6xl px-4 py-8">
			<AutoRefresh intervalMs={5000} />
			<StaffHeader name={staffSession.name} roleText={roleLabel(staffSession.role)} />

			<section className="card mb-5 overflow-hidden p-6 sm:p-8">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div>
						<p className="text-xs font-black text-[var(--amber-deep)]">مركز تشغيل الفرع</p>
						<h1 className="mt-1 text-3xl font-black text-[var(--ink)]">{branch.name}</h1>
						<p className="mt-2 max-w-xl text-sm font-bold leading-relaxed text-[var(--ink)]/50">
							الكاشير، الدليفري والمطبخ كل واحد له شاشة ولوجيك مستقل، والأوردر بيتنقل بينهم برقم واضح.
						</p>
					</div>
					<span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--ink)] text-[var(--amber)]">
						<MonitorSmartphone className="h-8 w-8" />
					</span>
				</div>
			</section>

			<div className="grid gap-4 md:grid-cols-3">
				{canManageFront ? (
					<Link href={`/staff/${branch.code}/cashier`} className="card card-lift group flex min-h-56 flex-col justify-between p-5">
						<div>
							<span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--amber)] text-[var(--ink)] shadow-[var(--shadow-amber)]">
								<ShoppingCart className="h-6 w-6" />
							</span>
							<h2 className="mt-5 text-xl font-black text-[var(--ink)]">الكاشير ونقطة البيع</h2>
							<p className="mt-2 text-sm font-bold leading-relaxed text-[var(--ink)]/50">منتجات وأسعار، حساب فوري، دفع وطباعة فاتورة برقم.</p>
						</div>
						<span className="mt-5 flex items-center justify-between text-sm font-black text-[var(--amber-deep)]">
							فتح الكاشير <ChevronLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
						</span>
					</Link>
				) : null}

				{canManageFront ? (
					<Link href={`/staff/${branch.code}/delivery`} className="card card-lift group flex min-h-56 flex-col justify-between p-5">
						<div>
							<span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--terracotta)]/12 text-[var(--terracotta)]">
								<Bike className="h-6 w-6" />
							</span>
							<div className="mt-5 flex items-center justify-between gap-2">
								<h2 className="text-xl font-black text-[var(--ink)]">طلبات الدليفري</h2>
								<span className="num rounded-full bg-[var(--terracotta)] px-2.5 py-1 text-sm font-black text-white">{deliveryCount}</span>
							</div>
							<p className="mt-2 text-sm font-bold leading-relaxed text-[var(--ink)]/50">طلبات الموقع فقط: العميل، الهاتف، العنوان وحالة الدفع.</p>
						</div>
						<span className="mt-5 flex items-center justify-between text-sm font-black text-[var(--terracotta)]">
							إدارة الدليفري <ChevronLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
						</span>
					</Link>
				) : null}

				<Link href={`/staff/${branch.code}/kitchen`} className="card card-lift group flex min-h-56 flex-col justify-between p-5">
					<div>
						<span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--zaatar)]/14 text-[var(--zaatar)]">
							<ChefHat className="h-6 w-6" />
						</span>
						<div className="mt-5 flex items-center justify-between gap-2">
							<h2 className="text-xl font-black text-[var(--ink)]">شاشة المطبخ</h2>
							<span className="num rounded-full bg-[var(--zaatar)] px-2.5 py-1 text-sm font-black text-white">{kitchenCount}</span>
						</div>
						<p className="mt-2 text-sm font-bold leading-relaxed text-[var(--ink)]/50">كل الأوردرات المدفوعة من الكاشير والدليفري مرتبة للتحضير.</p>
					</div>
					<span className="mt-5 flex items-center justify-between text-sm font-black text-[var(--zaatar)]">
						فتح المطبخ <ChevronLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
					</span>
				</Link>
			</div>

			<div className="mt-5 flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-[var(--surface-muted)] px-4 py-3 text-xs font-bold text-[var(--ink)]/50">
				<ReceiptText className="h-4 w-4 text-[var(--amber-deep)]" />
				طلبات الكاشير بدون رسوم توصيل، وطلبات الموقع دليفري فقط برسوم وعنوان مستقلين.
			</div>
		</main>
	)
}
