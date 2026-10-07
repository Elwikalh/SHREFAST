"use client"

import { useState, useTransition } from "react"
import { Check, Copy, CreditCard, Loader2, Smartphone, UserRound } from "lucide-react"
import { updateInstapaySettings } from "../branding/actions"

type Settings = { instapayAddress: string; instapayWalletNumber: string; instapayAccountName: string }
export function PaymentSettingsPanel({ initial }: { initial: Settings }) {
	const [address, setAddress] = useState(initial.instapayAddress)
	const [wallet, setWallet] = useState(initial.instapayWalletNumber)
	const [accountName, setAccountName] = useState(initial.instapayAccountName)
	const [pending, startTransition] = useTransition()
	const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
	const active = Boolean(address.trim() || wallet.trim())
	function save() {
		setMessage(null)
		startTransition(async () => {
			try {
				await updateInstapaySettings({ instapayAddress: address, instapayWalletNumber: wallet, instapayAccountName: accountName })
				setMessage({ type: "success", text: active ? "تم حفظ حساب إنستاباي وتفعيل الدفع الإلكتروني." : "تم إيقاف الدفع عبر إنستاباي." })
			} catch (error) { setMessage({ type: "error", text: error instanceof Error ? error.message : "تعذر حفظ إعدادات الدفع." }) }
		})
	}
	return <div className="space-y-5"><section className="card overflow-hidden"><div className="flex items-center justify-between border-b border-[var(--line)] p-5"><div><h2 className="text-lg font-black">حساب التحويل</h2><p className="mt-1 text-xs font-bold text-[var(--ink)]/45">تظهر هذه البيانات للعميل عند اختيار الدفع عبر إنستاباي.</p></div><span className={`rounded-full px-3 py-1.5 text-xs font-black ${active ? "bg-[var(--zaatar)]/12 text-[var(--zaatar)]" : "bg-[var(--terracotta)]/10 text-[var(--terracotta)]"}`}>{active ? "مفعّل" : "غير مفعّل"}</span></div><div className="space-y-4 p-5"><label className="block"><span className="mb-2 flex items-center gap-2 text-sm font-black"><CreditCard className="h-4 w-4 text-[var(--amber-deep)]" /> عنوان إنستاباي (IPA)</span><input dir="ltr" className="input h-14 text-left" value={address} onChange={(event) => setAddress(event.target.value.slice(0,120))} placeholder="name@instapay" autoComplete="off" /></label><label className="block"><span className="mb-2 flex items-center gap-2 text-sm font-black"><Smartphone className="h-4 w-4 text-[var(--amber-deep)]" /> رقم الهاتف المرتبط بالحساب</span><input dir="ltr" inputMode="numeric" className="input h-14 text-left" value={wallet} onChange={(event) => setWallet(event.target.value.replace(/\D/g,"").slice(0,11))} placeholder="01xxxxxxxxx" /></label><label className="block"><span className="mb-2 flex items-center gap-2 text-sm font-black"><UserRound className="h-4 w-4 text-[var(--amber-deep)]" /> اسم المستفيد</span><input className="input h-14" value={accountName} onChange={(event) => setAccountName(event.target.value.slice(0,120))} placeholder="الاسم المسجل على الحساب" /></label></div></section><section className="rounded-3xl border border-[var(--line)] bg-[var(--ink)] p-5 text-white"><div className="mb-4 flex items-center justify-between"><h2 className="font-black">معاينة بيانات الدفع</h2><span className="text-xs font-bold text-white/40">كما ستظهر للعميل</span></div>{active ? <div className="space-y-2">{accountName.trim() ? <p className="text-sm font-bold text-white/70">اسم المستفيد: {accountName.trim()}</p> : null}{address.trim() ? <div className="flex items-center justify-between rounded-2xl bg-white/8 p-3"><div><p className="text-[10px] font-bold text-white/40">عنوان إنستاباي</p><p dir="ltr" className="num mt-0.5 font-black">{address.trim()}</p></div><Copy className="h-4 w-4 text-[var(--amber)]" /></div> : null}{wallet.trim() ? <div className="flex items-center justify-between rounded-2xl bg-white/8 p-3"><div><p className="text-[10px] font-bold text-white/40">رقم الهاتف المرتبط بالحساب</p><p dir="ltr" className="num mt-0.5 font-black">{wallet.trim()}</p></div><Copy className="h-4 w-4 text-[var(--amber)]" /></div> : null}</div> : <p className="rounded-2xl border border-dashed border-white/15 p-5 text-center text-sm font-bold text-white/45">أدخل عنوان إنستاباي أو رقم الهاتف لتفعيل وسيلة الدفع.</p>}</section>{message ? <p className={`rounded-2xl p-3 text-sm font-black ${message.type === "success" ? "bg-[var(--zaatar)]/10 text-[var(--zaatar)]" : "bg-[var(--terracotta)]/10 text-[var(--terracotta)]"}`}>{message.text}</p> : null}<button type="button" onClick={save} disabled={pending} className="btn btn-primary w-full py-4 text-base">{pending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Check className="h-5 w-5" />}{pending ? "جارٍ حفظ الإعدادات..." : "حفظ إعدادات الدفع"}</button></div>
}
