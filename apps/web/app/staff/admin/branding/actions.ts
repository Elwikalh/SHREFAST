"use server"

import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { db, siteSettings } from "@el7bboB/db"
import { requireAdmin } from "@/lib/staff-session"

const MAX_IMAGE_DATA_URL_LENGTH = 6_000_000
const WALLET_PATTERN = /^01[0125][0-9]{8}$/
function assertValidImage(dataUrl: string | null) {
	if (dataUrl === null) return
	if (!dataUrl.startsWith("data:image/") && !dataUrl.startsWith("https://") && !dataUrl.startsWith("http://")) throw new Error("صيغة الصورة أو الرابط غير مدعومة.")
	if (dataUrl.length > MAX_IMAGE_DATA_URL_LENGTH) throw new Error("حجم الصورة يتجاوز الحد المسموح.")
}
export async function updateHeroImage(heroImageDataUrl: string | null) {
	await requireAdmin(); assertValidImage(heroImageDataUrl)
	await db.insert(siteSettings).values({ id: "default", heroImageDataUrl }).onConflictDoUpdate({ target: siteSettings.id, set: { heroImageDataUrl, updatedAt: new Date() } })
	revalidatePath("/staff/admin/branding"); revalidatePath("/")
}
export type InstapaySettingsInput = { instapayAddress: string; instapayWalletNumber: string; instapayAccountName: string }
export async function updateInstapaySettings(input: InstapaySettingsInput) {
	await requireAdmin()
	const address = input.instapayAddress.trim(), wallet = input.instapayWalletNumber.trim(), accountName = input.instapayAccountName.trim()
	if (address.length > 120 || wallet.length > 20 || accountName.length > 120) throw new Error("إحدى القيم المدخلة تتجاوز الحد المسموح.")
	if (address && !address.includes("@")) throw new Error("يرجى إدخال عنوان إنستاباي بصيغة صحيحة مثل name@instapay.")
	if (wallet && !WALLET_PATTERN.test(wallet)) throw new Error("يرجى إدخال رقم هاتف مصري صحيح.")
	if (!address && !wallet && accountName) throw new Error("يرجى إدخال عنوان إنستاباي أو رقم الهاتف المرتبط بالحساب.")
	const values = { instapayAddress: address || null, instapayWalletNumber: wallet || null, instapayAccountName: accountName || null }
	await db.insert(siteSettings).values({ id: "default", ...values }).onConflictDoUpdate({ target: siteSettings.id, set: { ...values, updatedAt: new Date() } })
	revalidatePath("/staff/admin/branding")
	revalidatePath("/staff/admin/payments")
	revalidatePath("/order/checkout")
}
export async function getSiteSettings() { await requireAdmin(); const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, "default")); return settings ?? null }
