"use server"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { savePromoBanners } from "@/app/promo-banner-store"
import { requireAdmin } from "@/lib/staff-session"
const banner=z.object({id:z.string().min(1).max(80),titleAr:z.string().max(120),titleEn:z.string().max(120),subtitleAr:z.string().max(180),subtitleEn:z.string().max(180),buttonAr:z.string().min(1).max(40),buttonEn:z.string().min(1).max(40),href:z.string().min(1).max(300),imageUrl:z.string().min(1).max(1_500_000),mobileImageUrl:z.string().min(1).max(1_500_000),enabled:z.boolean()})
export async function updatePromoBanners(input:unknown){await requireAdmin();const parsed=z.array(banner).max(10).parse(input);await savePromoBanners(parsed);revalidatePath("/");revalidatePath("/staff/admin/banners")}
