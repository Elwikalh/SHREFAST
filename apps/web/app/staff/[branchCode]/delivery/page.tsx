import Link from "next/link"
import { eq } from "drizzle-orm"
import { notFound, redirect } from "next/navigation"
import { ArrowRight, Bike, Banknote, MapPin } from "lucide-react"
import { branches, db } from "@el7bboB/db"
import { loadStaffOrders } from "@/lib/orders/staff-orders"
import { requireBranchAccess, roleLabel } from "@/lib/staff-session"
import { AutoRefresh } from "../auto-refresh"
import { OrderCard } from "../order-card"
import { StaffHeader } from "../staff-header"

export const dynamic = "force-dynamic"
export default async function DeliveryOrdersPage({params}:{params:Promise<{branchCode:string}>}){
 const {branchCode}=await params,staffSession=await requireBranchAccess(branchCode)
 if(staffSession.role==="kitchen")redirect(`/staff/${branchCode}/kitchen`)
 const [branch]=await db.select().from(branches).where(eq(branches.code,branchCode));if(!branch)notFound()
 const rows=await loadStaffOrders({branchId:branch.id,channels:["online_delivery"],statuses:["pending_payment","queued","in_progress","ready","completed"]})
 const deliveryOrders=rows.filter(order=>order.status!=="completed"||order.paymentStatus!=="confirmed")
 return <main className="mx-auto max-w-7xl px-4 py-8"><AutoRefresh intervalMs={3000}/><StaffHeader name={staffSession.name} roleText={roleLabel(staffSession.role)}/><div className="card mb-5 flex flex-wrap items-center justify-between gap-4 p-5"><div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--terracotta)]/12 text-[var(--terracotta)]"><Bike className="h-6 w-6"/></span><div><p className="text-xs font-black text-[var(--terracotta)]">تشغيل الدليفري</p><h1 className="text-2xl font-black">طلبات الدليفري · {branch.name}</h1><p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-[var(--ink)]/50"><MapPin className="h-3.5 w-3.5"/> الطلب الكاش يدخل المطبخ فورًا ويتحصل عند التسليم</p></div></div><div className="flex items-center gap-2"><span className="num rounded-full bg-[var(--terracotta)] px-3 py-1.5 text-sm font-black text-white">{deliveryOrders.length} نشط</span><Link href={`/staff/${branch.code}`} className="btn btn-outline rounded-xl px-3 py-2 text-xs"><ArrowRight className="h-4 w-4"/> التشغيل</Link></div></div><div className="mb-5 grid gap-3 md:grid-cols-2"><div className="rounded-2xl border border-[var(--line)] bg-white p-4"><p className="flex items-center gap-2 text-sm font-black"><Banknote className="h-4 w-4 text-[var(--zaatar)]"/> كاش عند الاستلام</p><p className="mt-1 text-xs font-bold text-[var(--ink)]/50">يدخل المطبخ مباشرة، وعند التسليم اضغط «تم التسليم والتحصيل» فيتأكد الدفع ويُغلق الطلب.</p></div><div className="rounded-2xl border border-[var(--line)] bg-white p-4"><p className="flex items-center gap-2 text-sm font-black"><Bike className="h-4 w-4 text-[var(--amber-deep)]"/> إنستاباي</p><p className="mt-1 text-xs font-bold text-[var(--ink)]/50">راجع التحويل واضغط «تأكيد التحويل»؛ بعدها فقط يدخل الطلب للمطبخ.</p></div></div>{deliveryOrders.length===0?<div className="rounded-3xl border border-dashed border-[var(--line-strong)] bg-[var(--surface-muted)] p-12 text-center"><Bike className="mx-auto h-9 w-9 text-[var(--ink)]/20"/><p className="mt-3 font-black text-[var(--ink)]/55">مفيش طلبات دليفري نشطة دلوقتي</p></div>:<div className="grid items-start gap-4 sm:grid-cols-2 xl:grid-cols-3">{deliveryOrders.map(order=><OrderCard key={order.id} branchCode={branch.code} order={order} surface="delivery"/>)}</div>}</main>
}
