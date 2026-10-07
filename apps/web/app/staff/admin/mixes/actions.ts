"use server"

import { inArray, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db, ensureCustomMixMenuItem, menuItems } from "@el7bboB/db"
import { CUSTOM_MIX_SLUG, serializeMixSettings } from "@/app/mix/mix-config"
import { requireAdmin } from "@/lib/staff-session"

const inputSchema = z.array(z.object({ slug:z.string().min(1).max(100), enabled:z.boolean(), priceEGP:z.number().min(0).max(1000), sortOrder:z.number().int().min(0).max(500) })).max(100)
export async function saveMixSettings(input: unknown) {
	await requireAdmin(); await ensureCustomMixMenuItem()
	const values = inputSchema.parse(input)
	const slugs = values.map((item) => item.slug)
	const products = slugs.length ? await db.select().from(menuItems).where(inArray(menuItems.slug,slugs)) : []
	const allowed = new Set(products.filter((item) => item.category === "base_item" || item.category === "addon").map((item) => item.slug))
	if (values.some((item) => !allowed.has(item.slug))) throw new Error("تتضمن الإعدادات صنفًا غير صالح للميكس.")
	await db.update(menuItems).set({ photosJson:serializeMixSettings(values.sort((a,b) => a.sortOrder-b.sortOrder)), updatedAt:new Date() }).where(eq(menuItems.slug,CUSTOM_MIX_SLUG))
	revalidatePath("/"); revalidatePath("/staff/admin/mixes")
}
