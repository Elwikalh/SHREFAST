import { Megaphone } from "lucide-react"
import { requireAdmin } from "@/lib/staff-session"
import { loadPromoBanners } from "@/app/promo-banner-store"
import { BannerSettingsPanel } from "./banner-settings-panel"
export const dynamic="force-dynamic"
export default async function BannersPage(){await requireAdmin();const banners=await loadPromoBanners();return <main className="mx-auto max-w-5xl px-4 py-8"><div className="card mb-5 flex items-center gap-4 p-5"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--ink)] text-[var(--amber)]"><Megaphone className="h-6 w-6"/></span><div><h1 className="text-2xl font-black">العروض والبنرات</h1><p className="mt-1 text-sm font-bold text-[var(--ink)]/50">تحكم في صور وعناوين وروابط العروض التي تظهر أعلى الموقع.</p></div></div><BannerSettingsPanel initialBanners={banners}/></main>}
