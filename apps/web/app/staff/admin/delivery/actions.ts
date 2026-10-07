"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { db, deliveryZones, ensureDeliveryZones } from "@el7bboB/db"
import { requireAdmin } from "@/lib/staff-session"

export async function saveDeliveryZone(input: { id?: string; name: string; feeEGP: number; isActive: boolean }) {
	await requireAdmin()
	await ensureDeliveryZones()
	if (!input.name.trim()) throw new Error("اكتب اسم المنطقة")
	if (!Number.isFinite(input.feeEGP) || input.feeEGP < 0) throw new Error("رسوم التوصيل غير صحيحة")
	if (input.id) await db.update(deliveryZones).set({ name: input.name.trim(), feeEGP: String(input.feeEGP), isActive: input.isActive }).where(eq(deliveryZones.id, input.id))
	else await db.insert(deliveryZones).values({ name: input.name.trim(), feeEGP: String(input.feeEGP), isActive: input.isActive })
	revalidatePath("/staff/admin/delivery")
	revalidatePath("/order/checkout")
}
export async function deleteDeliveryZone(id: string) {
	await requireAdmin()
	await ensureDeliveryZones()
	await db.delete(deliveryZones).where(eq(deliveryZones.id, id))
	revalidatePath("/staff/admin/delivery")
	revalidatePath("/order/checkout")
}
