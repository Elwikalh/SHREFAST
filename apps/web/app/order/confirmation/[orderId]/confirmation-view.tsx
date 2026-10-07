"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bike, Check, CheckCircle2, ChefHat, Clock3, Copy, Home, MapPin, Phone, Plus, ReceiptText, Wallet, X } from "lucide-react"
import { getOrderProgress } from "./actions"
import {InstapayQr} from '../../instapay-qr'

const STATUS_TONE: Record<string, string> = {
	pending_payment: "border-[var(--amber)]/40 bg-[var(--amber)]/15 text-[var(--amber)]",
	queued: "border-white/20 bg-white/10 text-white",
	in_progress: "border-blue-400/40 bg-blue-400/15 text-blue-200",
	ready: "border-green-400/40 bg-green-400/15 text-green-200",
	completed: "border-green-400/40 bg-green-400/15 text-green-200",
	cancelled: "border-red-400/40 bg-red-400/15 text-red-200",
}

type OrderItemView = { nameAr: string; quantity: number; lineTotalEGP: number; addons: Array<{ nameAr: string; priceEGP: number }> }
type InstapayAccountView = { address: string | null; walletNumber: string | null; accountName: string | null }
type Props = { orderId: string; branchName: string; displayNumber: string; totalEGP: number; deliveryFeeEGP: number; initialStatus: string; items: OrderItemView[]; createdAt: string; channel: string; paymentMethod: "cash" | "instapay"; paymentConfirmed: boolean; deliveryAddress: string | null; customerPhone: string | null; instapay: InstapayAccountView | null }

function CopyValue({ label, value }: { label: string; value: string }) {
	const [copied, setCopied] = useState(false)
	async function copy() { try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1400) } catch { setCopied(false) } }
	return <div className="flex items-center justify-between rounded-2xl bg-black/20 px-3 py-2.5"><div><p className="text-[10px] font-bold text-white/40">{label}</p><p dir="ltr" className="num mt-0.5 text-sm font-bold text-white/90">{value}</p></div><button type="button" onClick={copy} className="btn h-9 w-9 rounded-xl bg-white/10" aria-label={`نسخ ${label}`}>{copied ? <Check className="h-4 w-4 text-green-300" /> : <Copy className="h-4 w-4" />}</button></div>
}

export function ConfirmationView({ orderId, branchName, displayNumber, totalEGP, deliveryFeeEGP, initialStatus, items, createdAt, channel, paymentMethod, paymentConfirmed, deliveryAddress, customerPhone, instapay }: Props) {
	// Live status AND live payment confirmation: a customer watching this page
	// sees the InstaPay review clear and the order move to the kitchen without
	// ever refreshing. Polls fast and re-checks when the tab regains focus.
	const [live, setLive] = useState({ status: initialStatus, paymentConfirmed })
	useEffect(() => {
		let stopped = false
		const poll = async () => { const latest = await getOrderProgress(orderId); if (latest && !stopped) setLive(latest) }
		const interval = window.setInterval(() => void poll(), 4000)
		const refreshNow = () => { if (document.visibilityState === "visible") void poll() }
		document.addEventListener("visibilitychange", refreshNow)
		window.addEventListener("focus", refreshNow)
		return () => { stopped = true; window.clearInterval(interval); document.removeEventListener("visibilitychange", refreshNow); window.removeEventListener("focus", refreshNow) }
	}, [orderId])
	const status = live.status
	const paidLive = live.paymentConfirmed
	const segments = displayNumber.split("-")
	const branchLetter = segments.length > 1 ? segments.slice(0, -1).join("-") : ""
	const orderNumber = segments.length > 1 && !Number.isNaN(Number(segments[segments.length - 1])) ? String(Number(segments[segments.length - 1])) : displayNumber
	const isDelivery = channel === "online_delivery"
	const isInstapay = paymentMethod === "instapay"
	const statusLabels: Record<string, string> = {
		pending_payment: isInstapay ? "قيد مراجعة تحويل إنستاباي" : "في انتظار تأكيد الدفع",
		queued: "تم تأكيد الطلب",
		in_progress: "بيتحضر",
		ready: isDelivery ? "خرج مع الدليفري 🛵" : "جاهز للاستلام",
		completed: isDelivery ? "تم التوصيل" : "تم التسليم",
		cancelled: "تم إلغاء الطلب",
	}
	// Delivery flow: once the kitchen marks the order ready it is out with the
	// driver, and completion means handed over to the customer — the cash is
	// collected in the same moment, so no separate tracking step is needed.
	const statusLabel = statusLabels[status] ?? "جارٍ تحديث حالة الطلب"
	useEffect(() => { document.title = `${statusLabel} — طلب ${displayNumber}` }, [statusLabel, displayNumber])
	// Milestone tracker under the order number: fills as the order advances so
	// the customer always sees at a glance how far along their order is.
	const milestones = isDelivery ? ["تأكيد الطلب", "بيتحضر", "خرج مع الدليفري", "تم التوصيل"] : ["تأكيد الطلب", "بيتحضر", "جاهز للاستلام", "تم التسليم"]
	const milestoneIndex = status === "completed" ? 5 : status === "ready" ? 4 : status === "in_progress" ? 3 : 1
	const showInstapayAccount = isInstapay && !paidLive && status==='pending_payment' && Boolean(instapay?.address || instapay?.walletNumber)
	const steps = isDelivery ? [
		{ icon: CheckCircle2, text: "تم تأكيد الطلب بنجاح" },
		{ icon: ChefHat, text: status === "pending_payment" ? "يبدأ التجهيز بعد مراجعة الدفع" : "تم إرسال الطلب إلى قسم التجهيز" },
		{ icon: Phone, text: customerPhone ? `سيتم التواصل على ${customerPhone} عند الحاجة` : "سيتم التواصل على رقم الهاتف المسجل عند الحاجة" },
		{ icon: Bike, text: "سيتم توصيل الطلب إلى العنوان المسجل" },
	] : [
		{ icon: CheckCircle2, text: "تم تأكيد الطلب بنجاح" },
		{ icon: ChefHat, text: "تم إرسال الطلب إلى قسم التجهيز" },
		{ icon: Clock3, text: "تابع الحالة حتى يصبح الطلب جاهزًا" },
	]

	return <main dir="rtl" className="relative flex min-h-screen flex-col items-center gap-4 bg-[var(--ink)] px-4 py-8 text-white"><div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(600px_260px_at_50%_-40px,rgba(247,174,51,0.28),transparent_70%)]" />
		<section className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/12 bg-white/[0.06] shadow-[0_30px_60px_-25px_rgba(0,0,0,0.7)] backdrop-blur"><div className="flex flex-col items-center gap-1 bg-black/25 px-6 py-7"><p className="text-xs font-bold tracking-[0.2em] text-white/40">رقم الطلب</p><div dir="ltr" className="num flex items-end justify-center gap-2">{branchLetter ? <span className="pb-3 text-2xl font-black text-white/30">{branchLetter}</span> : null}<span className="text-[5.5rem] font-black leading-none text-[var(--amber)] sm:text-[7rem]">{orderNumber}</span></div>{branchName ? <p className="text-sm font-bold text-white/45">{branchName}</p> : null}<span className={`mt-3 flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-bold ${STATUS_TONE[status] ?? STATUS_TONE.queued}`}>{status === "cancelled" ? <X className="h-3.5 w-3.5" /> : status === "completed" ? <Check className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}{statusLabel}</span>{status !== "cancelled" ? <div className="mt-6 flex w-full items-start">{milestones.map((label, i) => { const done = status === "completed" || i < milestoneIndex - 1, current = status === "completed" ? false : i === milestoneIndex - 1; return <div key={label} className="flex flex-1 flex-col items-center gap-1.5 last:flex-none"><div className="flex w-full items-center"><span className={`h-0.5 flex-1 ${i === 0 ? "opacity-0" : done || current ? "bg-[var(--amber)]" : "bg-white/12"}`} /><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-black ${done ? "border-[var(--amber)] bg-[var(--amber)] text-[var(--ink)]" : current ? "border-[var(--amber)] bg-[var(--amber)]/20 text-[var(--amber)] animate-pulse" : "border-white/15 bg-white/5 text-white/35"}`}>{done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}</span><span className={`h-0.5 flex-1 ${i === milestones.length - 1 ? "opacity-0" : done ? "bg-[var(--amber)]" : "bg-white/12"}`} /></div><span className={`text-[10px] font-bold ${done || current ? "text-white/85" : "text-white/35"}`}>{label}</span></div> })}</div> : null}</div>
			<div className="relative h-4 bg-black/25"><span className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[var(--ink)]" /><span className="absolute -left-2 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[var(--ink)]" /><span className="absolute inset-x-5 top-1/2 border-t border-dashed border-white/20" /></div>
			<div className="flex flex-col gap-3 px-5 py-5"><div className="flex items-center gap-2 text-sm font-black text-white/80"><ReceiptText className="h-4 w-4 text-[var(--amber)]" /> تفاصيل الطلب</div><ul className="flex flex-col gap-2.5 text-sm">{items.map((item, index) => <li key={index} className="flex items-start justify-between gap-3"><span className="flex min-w-0 items-start gap-2"><span className="num mt-0.5 flex h-5 min-w-5 items-center justify-center rounded-md bg-white/10 px-1 text-[11px] font-black text-white/70">{item.quantity}</span><span><span className="font-bold text-white/90">{item.nameAr}</span>{item.addons.length ? <span className="block text-xs text-white/40">+ {item.addons.map((addon) => addon.nameAr).join("، ")}</span> : null}</span></span><span className="num shrink-0 font-bold text-white/70">{item.lineTotalEGP} ج.م</span></li>)}</ul>{deliveryFeeEGP > 0 ? <div className="flex justify-between border-t border-white/10 pt-3 text-sm text-white/60"><span className="flex items-center gap-1.5"><Bike className="h-3.5 w-3.5" /> رسوم التوصيل</span><span className="num">{deliveryFeeEGP} ج.م</span></div> : null}<div className="flex items-center justify-between rounded-2xl bg-[var(--amber)]/12 px-4 py-3"><span className="text-sm font-bold text-white/70">الإجمالي المستحق</span><span className="num text-2xl font-black text-[var(--amber)]">{totalEGP} ج.م</span></div>{isDelivery && deliveryAddress ? <div className="flex items-start gap-2 rounded-2xl bg-white/[0.06] px-4 py-3 text-sm text-white/70"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--amber)]" /><span>{deliveryAddress}</span></div> : null}</div>
		</section>

		<section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-5"><div className="mb-3 flex items-center gap-2"><Wallet className="h-5 w-5 text-[var(--amber)]" /><h2 className="font-black">حالة الدفع</h2></div>{isInstapay ? <div className={`rounded-2xl p-4 ${paidLive ? "bg-green-400/10 text-green-200" : "bg-[var(--amber)]/10 text-white/80"}`}><p className="font-black">{paidLive ? "تم تأكيد تحويل إنستاباي" : "جارٍ مراجعة تحويل إنستاباي"}</p><p className="mt-1 text-xs font-bold opacity-70">{paidLive ? "لا يوجد مبلغ إضافي مطلوب عند الاستلام." : "سيتم تحديث حالة الطلب بعد مطابقة التحويل. إذا كنت حولت المبلغ بالفعل، لا تعِد التحويل."}</p></div> : <div className="rounded-2xl bg-white/[0.06] p-4"><p className="font-black">الدفع نقدًا عند الاستلام</p><p className="mt-1 text-xs font-bold text-white/55">المبلغ المستحق لمندوب التوصيل: <span className="num text-[var(--amber)]">{totalEGP} ج.م</span></p></div>}</section>

		{showInstapayAccount ? <section className="w-full max-w-md rounded-3xl border border-[var(--amber)]/30 bg-[var(--amber)]/10 p-5"><p className="font-black">بيانات التحويل عبر إنستاباي</p><p className="mb-3 mt-1 text-xs font-bold text-white/55">قيمة التحويل المطلوبة: <span className="num text-[var(--amber)]">{totalEGP} ج.م</span> — لو حولت بالفعل، لا تدفع مرة ثانية.</p><div className="space-y-2">{instapay?.accountName ? <p className="px-1 text-xs font-bold text-white/60">اسم المستفيد: {instapay.accountName}</p> : null}{instapay?.address ? <CopyValue label="عنوان إنستاباي" value={instapay.address} /> : null}{instapay?.walletNumber ? <CopyValue label="رقم الهاتف المرتبط بالحساب" value={instapay.walletNumber} /> : null}<InstapayQr address={instapay?.address}/></div></section> : null}

		<section className="w-full max-w-md rounded-3xl border border-white/10 bg-white/[0.04] p-5"><h2 className="mb-4 font-black">متابعة الطلب</h2><ol className="flex flex-col gap-3.5 text-sm">{steps.map((step, index) => { const Icon = step.icon; return <li key={index} className="flex items-start gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--amber)]/15 text-[var(--amber)]"><Icon className="h-4 w-4" /></span><span className="pt-1.5 text-white/75">{step.text}</span></li> })}</ol></section>
		<div className="flex w-full max-w-md items-center gap-2"><Link href="/order" className="btn btn-primary flex-1 rounded-2xl px-4 py-4 text-sm"><Plus className="h-4 w-4" /> طلب جديد</Link><Link href="/" className="btn rounded-2xl border border-white/15 px-4 py-4 text-sm text-white/70 hover:bg-white/5"><Home className="h-4 w-4" /> الرئيسية</Link></div><p className="num text-xs text-white/35">{new Date(createdAt).toLocaleString("ar-EG")}</p>
	</main>
}
