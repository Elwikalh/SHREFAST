import { asc } from "drizzle-orm"
import { Bike } from "lucide-react"
import { db, deliveryZones, ensureDeliveryZones } from "@el7bboB/db"
import { requireAdmin } from "@/lib/staff-session"
import { DeliveryZonesPanel } from "./delivery-zones-panel"

export const dynamic = "force-dynamic"
export default async function DeliveryAdminPage() {
	await requireAdmin()
	await ensureDeliveryZones()
	const rows = await db.select().from(deliveryZones).orderBy(asc(deliveryZones.sortOrder), asc(deliveryZones.name))
	return <div className="mx-auto max-w-4xl space-y-5">
		<div className="card flex items-center gap-3 p-5"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--sesame)]"><Bike className="h-5 w-5" /></span><div><h1 className="text-2xl font-black">إدارة الدليفري</h1><p className="text-sm font-bold text-[var(--ink)]/50">المناطق ورسوم التوصيل المتاحة للعميل</p></div></div>
		<DeliveryZonesPanel initialZones={rows.map((zone) => ({ id: zone.id, name: zone.name, feeEGP: Number(zone.feeEGP), isActive: zone.isActive }))} />
	</div>
}
