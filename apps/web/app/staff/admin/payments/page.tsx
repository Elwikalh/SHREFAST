import { eq } from "drizzle-orm"
import { CreditCard, ShieldCheck } from "lucide-react"
import { db, siteSettings } from "@el7bboB/db"
import { requireAdmin } from "@/lib/staff-session"
import {ensureProvidedInstapay} from '@/lib/instapay-bootstrap'
import {InstapayQr} from '@/app/order/instapay-qr'
import { PaymentSettingsPanel } from "./payment-settings-panel"

export const dynamic = "force-dynamic"
export default async function PaymentsAdminPage() {
	await requireAdmin()
	await ensureProvidedInstapay()
	const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, "default"))
	return <main className="mx-auto max-w-3xl px-4 py-8"><div className="card mb-5 flex items-center gap-4 p-5"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--zaatar)] text-white"><CreditCard className="h-6 w-6" /></span><div><h1 className="text-2xl font-black">إعدادات الدفع الإلكتروني</h1><p className="mt-1 text-sm font-bold text-[var(--ink)]/50">إدارة حساب إنستاباي المستخدم في طلبات التوصيل والطلبات الإلكترونية.</p></div></div><div className="mb-5 flex items-start gap-3 rounded-2xl border border-[var(--zaatar)]/25 bg-[var(--zaatar)]/8 p-4"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--zaatar)]" /><p className="text-sm font-bold leading-relaxed text-[var(--ink)]/65">تُسجل الطلبات المحولة بحالة «قيد مراجعة الدفع» حتى يؤكد المطعم استلام المبلغ. عنوان الدفع من الصورة هو el7bbob@instapay؛ اسم المستفيد المسجل لم يظهر بالصورة، أضفه فقط إذا كان مطابقًا للتطبيق. QR المرفق صالح لهذا العنوان فقط، ويختفي إذا غيرت العنوان.</p></div><PaymentSettingsPanel initial={{ instapayAddress: settings?.instapayAddress ?? "", instapayWalletNumber: settings?.instapayWalletNumber ?? "", instapayAccountName: settings?.instapayAccountName ?? "" }} /><InstapayQr address={settings?.instapayAddress}/></main>
}
