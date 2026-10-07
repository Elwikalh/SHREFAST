"use server"

import { revalidatePath } from "next/cache"
import { randomUUID } from "node:crypto"
import { databaseErrorCode, MENU_ITEM_REFERENCED_MESSAGE } from "./database-error-code"
import { eq, inArray, sql } from "drizzle-orm"
import { db, menuItems, menuItemCategoryEnum, auditLog } from "@el7bboB/db"
import { requireAdmin } from "@/lib/staff-session"
import { nextMenuCode, nextMenuSortOrder } from "./menu-product-code"
import { storefrontSectionFor, type StorefrontSection } from "@/app/storefront-menu-sections"
import { isSandwichBread } from "@/app/sandwich-bread"

type MenuCategory = (typeof menuItemCategoryEnum.enumValues)[number]

export type MenuItemInput = {
	slug: string
	nameAr: string
	nameEn: string
	category: MenuCategory
	priceEGP: string
	costEGP: string
	sortOrder: number
	// Either an uploaded file turned into a data URL ("data:image/...;base64,...")
	// or a pasted public image link ("https://..."). undefined = leave the
	// existing photo untouched, null = clear it.
	photoDataUrl?: string | null
	// Extra gallery photos shown on the product detail page (the cover above
	// stays photo #1). undefined = leave untouched, null/[] = clear.
	photosJson?: string[] | null
	descriptionAr?: string | null
	descriptionEn?: string | null
}

// A phone photo can encode to a few MB of base64 text; keep a generous but
// bounded ceiling so a stray huge upload can't blow up the database column.
const MAX_PHOTO_DATA_URL_LENGTH = 3_000_000
// The whole gallery lives in one row, so cap the number of extra photos to
// keep the row (and the pages that read it) a sane size.
const MAX_GALLERY_PHOTOS = 6
const MAX_DESCRIPTION_LENGTH = 1_000

function assertValidPhoto(photoDataUrl: string | null | undefined) {
	if (photoDataUrl === undefined || photoDataUrl === null) return
	const isUploadedImage = photoDataUrl.startsWith("data:image/")
	const isPastedLink = photoDataUrl.startsWith("https://") || photoDataUrl.startsWith("http://")
	if (!isUploadedImage && !isPastedLink) {
		throw new Error("صيغة الصورة/الرابط غير مدعومة")
	}
	if (photoDataUrl.length > MAX_PHOTO_DATA_URL_LENGTH) {
		throw new Error("حجم الصورة كبير جدًا — استخدم صورة أصغر")
	}
}

// Validates + normalises the gallery: drops blanks, de-duplicates, and keeps
// the admin-chosen order (first extra photo shows right after the cover).
function normalizeGallery(photos: string[] | null | undefined) {
	if (photos === undefined) return undefined
	if (photos === null) return null
	const cleaned: string[] = []
	for (const photo of photos) {
		const trimmed = typeof photo === "string" ? photo.trim() : ""
		if (!trimmed) continue
		assertValidPhoto(trimmed)
		if (!cleaned.includes(trimmed)) cleaned.push(trimmed)
	}
	if (cleaned.length > MAX_GALLERY_PHOTOS) {
		throw new Error(`أقصى عدد صور للصنف ${MAX_GALLERY_PHOTOS} صور غير صورة الغلاف`)
	}
	return cleaned.length > 0 ? cleaned : null
}

function normalizeDescription(description: string | null | undefined) {
	if (description === undefined) return undefined
	if (description === null) return null
	const trimmed = description.trim()
	if (!trimmed) return null
	if (trimmed.length > MAX_DESCRIPTION_LENGTH) {
		throw new Error("الوصف طويل جدًا — خليه أقصر")
	}
	return trimmed
}

export async function createMenuItem(input: MenuItemInput) {
	await requireAdmin()
	const salePrice = Number(input.priceEGP)
	if (!Number.isFinite(salePrice) || salePrice <= 0) {
		throw new Error("سعر البيع لازم يكون أكبر من صفر عشان المنتج يظهر للعميل")
	}
	assertValidPhoto(input.photoDataUrl)
	const photosJson = normalizeGallery(input.photosJson)
	const descriptionAr = normalizeDescription(input.descriptionAr)
	const descriptionEn = normalizeDescription(input.descriptionEn)

	await db.transaction(async (tx) => {
		// Serialize code allocation across app instances; the lock is released
		// on commit/rollback. Unique slug is a second database-level guard.
		await tx.execute(sql`select pg_advisory_xact_lock(741071, 1)`)
		const rows = await tx.select({ slug: menuItems.slug, category: menuItems.category, sortOrder: menuItems.sortOrder }).from(menuItems)
		// Reservation history prevents reusing a code after a product deletion.
		const reservations = await tx.select({ entityId: auditLog.entityId }).from(auditLog).where(eq(auditLog.action, "menu_code_allocated"))
		const slug = nextMenuCode(input, [...rows.map((row) => row.slug), ...reservations.map((row) => row.entityId)])
		const sortOrder = nextMenuSortOrder(input.category, rows)
		await tx.insert(menuItems).values({
			slug,
			nameAr: input.nameAr,
			nameEn: input.nameEn,
			category: input.category,
			priceEGP: input.priceEGP,
			costEGP: input.costEGP,
			isAvailable: true,
			sortOrder,
			photoDataUrl: input.photoDataUrl ?? null,
			photosJson: photosJson ?? null,
			descriptionAr: descriptionAr ?? null,
			descriptionEn: descriptionEn ?? null,
		})
		await tx.insert(auditLog).values({
			action: "menu_code_allocated", entityType: "menu", entityId: slug,
			reason: "Automatic product code allocation", metadataJson: { category: input.category, sortOrder },
		})
	})

	revalidatePath("/staff/admin/menu")
	revalidatePath("/")
	revalidatePath("/menu", "layout")
	revalidatePath("/order", "layout")
}

export async function updateMenuItem(id: string, input: MenuItemInput) {
	await requireAdmin()
	assertValidPhoto(input.photoDataUrl)
	const photosJson = normalizeGallery(input.photosJson)
	const descriptionAr = normalizeDescription(input.descriptionAr)
	const descriptionEn = normalizeDescription(input.descriptionEn)

	const updateValues: Record<string, unknown> = {
		// Product codes are permanent even if the name/category changes.
		nameAr: input.nameAr,
		nameEn: input.nameEn,
		category: input.category,
		priceEGP: input.priceEGP,
		costEGP: input.costEGP,
		sortOrder: input.sortOrder,
		updatedAt: new Date(),
	}
	// Only touch the photo column when the caller explicitly sent a value —
	// this lets the edit form save other fields without re-sending the photo.
	if (input.photoDataUrl !== undefined) {
		updateValues.photoDataUrl = input.photoDataUrl
	}
	if (photosJson !== undefined) {
		updateValues.photosJson = photosJson
	}
	if (descriptionAr !== undefined) {
		updateValues.descriptionAr = descriptionAr
	}
	if (descriptionEn !== undefined) {
		updateValues.descriptionEn = descriptionEn
	}

	await db.update(menuItems).set(updateValues).where(eq(menuItems.id, id))

	revalidatePath("/staff/admin/menu")
	revalidatePath("/")
	revalidatePath("/menu", "layout")
	revalidatePath("/order", "layout")
}

export async function toggleMenuItemAvailability(id: string, isAvailable: boolean) {
	await requireAdmin()
	if (isAvailable) {
		const [item] = await db.select({ priceEGP: menuItems.priceEGP }).from(menuItems).where(eq(menuItems.id, id)).limit(1)
		if (!item || Number(item.priceEGP) <= 0) {
			throw new Error("اكتب سعر بيع أكبر من صفر قبل إظهار الصنف على الموقع")
		}
	}

	await db
		.update(menuItems)
		.set({ isAvailable, updatedAt: new Date() })
		.where(eq(menuItems.id, id))

	revalidatePath("/staff/admin/menu")
	revalidatePath("/")
	revalidatePath("/menu", "layout")
	revalidatePath("/order", "layout")
}

// Menu items can be referenced by past orders, mixes, and recipes, so a hard
// delete can fail on a foreign-key constraint. Only a verified 23503 error
// should be reported as a reference constraint; other failures are not evidence
// of a mix/order association. Deletion protections and authorization stay intact.
export async function deleteMenuItem(id: string) {
	await requireAdmin()

	try {
		await db.delete(menuItems).where(eq(menuItems.id, id))
	} catch (error) {
		const code = databaseErrorCode(error), reference = randomUUID()
		console.error("[menu-delete] " + JSON.stringify({ reference, code: code ?? "UNKNOWN" }))
		if (code === "23503") {
			throw new Error(MENU_ITEM_REFERENCED_MESSAGE, { cause: { code } })
		}
		// Forward only the verified code, never the raw SQL error or parameters.
		throw new Error(`تعذّر حذف الصنف بسبب خطأ في النظام. حدّث القائمة للتحقق قبل إعادة المحاولة. مرجع: ${reference}`, { cause: code ? { code } : undefined })
	}

	revalidatePath("/staff/admin/menu")
	revalidatePath("/")
	revalidatePath("/menu", "layout")
	revalidatePath("/order", "layout")
}


export async function reorderMenuItems(
	section: StorefrontSection,
	orderedIds: string[],
) {
	await requireAdmin()
	if (orderedIds.length < 1 || orderedIds.length > 1000) {
		throw new Error("راجع قائمة ترتيب الأصناف")
	}
	if (new Set(orderedIds).size !== orderedIds.length || orderedIds.some((id) => !/^[0-9a-f-]{36}$/i.test(id))) {
		throw new Error("قائمة الترتيب غير صالحة")
	}

	await db.transaction(async (tx) => {
		await tx.execute(sql`select pg_advisory_xact_lock(741071, 2)`)
		const rows = await tx.select().from(menuItems).where(inArray(menuItems.id, orderedIds))
		if (rows.length !== orderedIds.length) throw new Error("بعض الأصناف لم تعد موجودة — حدّث الصفحة")
		for (const item of rows) {
			if (isSandwichBread(item.slug) || storefrontSectionFor(item) !== section) {
				throw new Error("لا يمكن نقل صنف خارج قسمه بهذه الطريقة")
			}
		}
		for (const [index, id] of orderedIds.entries()) {
			await tx.update(menuItems).set({ sortOrder: (index + 1) * 10, updatedAt: new Date() }).where(eq(menuItems.id, id))
		}
		await tx.insert(auditLog).values({
			action: "menu_reordered",
			entityType: "menu_section",
			entityId: section,
			reason: "Admin storefront ordering",
			metadataJson: { orderedIds },
		})
	})

	revalidatePath("/staff/admin/menu")
	revalidatePath("/")
	revalidatePath("/menu", "layout")
	revalidatePath("/order", "layout")
}
