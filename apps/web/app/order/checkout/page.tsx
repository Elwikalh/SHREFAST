import { asc, eq } from "drizzle-orm"
import { notFound } from "next/navigation"
import { Bike } from "lucide-react"
import { db, deliveryZones, ensureDeliveryZones, siteSettings } from "@el7bboB/db"
import {ensureProvidedInstapay} from '@/lib/instapay-bootstrap'
import { PageHeader } from "../../page-header"
import { CHANNEL_LABELS, DELIVERY_CHANNEL } from "../channels"
import { loadDeliveryBranch } from "../delivery-branch"
import { CartPanel } from "../[branchCode]/cart-panel"

export const dynamic = "force-dynamic"
export default async function DeliveryCheckoutPage() {
	const branch = await loadDeliveryBranch()
	if (!branch) notFound()
	await ensureDeliveryZones()
	await ensureProvidedInstapay()
	const [[settings], zones] = await Promise.all([
		db.select().from(siteSettings).where(eq(siteSettings.id, "default")),
		db.select().from(deliveryZones).where(eq(deliveryZones.isActive, true)).orderBy(asc(deliveryZones.sortOrder)),
	])
	return <><PageHeader title="إتمام الطلب" subtitle={CHANNEL_LABELS[DELIVERY_CHANNEL]} fallbackHref="/#menu" /><main className="mx-auto flex max-w-6xl flex-col gap-5 px-4 pb-10 pt-5 sm:px-6"><div className="flex items-center gap-4 rounded-[1.75rem] border border-[var(--line)] bg-white/75 px-5 py-4 shadow-[var(--shadow-sm)] backdrop-blur-xl"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--amber)] text-[var(--ink)] shadow-[var(--shadow-amber)]"><Bike className="h-5 w-5" /></span><div><p className="font-black">بيانات طلب التوصيل</p><p className="mt-0.5 text-xs font-bold text-[var(--ink)]/45">أدخل المنطقة والعنوان التفصيلي، وستظهر رسوم التوصيل والإجمالي قبل التأكيد.</p></div></div><CartPanel branchCode={branch.code} channel={DELIVERY_CHANNEL} menuHref="/#menu" deliveryZones={zones.map((zone) => ({ id: zone.id, name: zone.name, feeEGP: Number(zone.feeEGP) }))} instapay={{ address: settings?.instapayAddress ?? null, walletNumber: settings?.instapayWalletNumber ?? null, accountName: settings?.instapayAccountName ?? null }} /></main></>
}
