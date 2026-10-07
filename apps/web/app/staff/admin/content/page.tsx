import { Type } from "lucide-react"
import { requireAdmin } from "@/lib/staff-session"
import { loadSiteCopyValues } from "@/app/site-copy-store"
import { ContentSettingsPanel } from "./content-settings-panel"

export const dynamic="force-dynamic"
export default async function ContentAdminPage(){await requireAdmin();const values=await loadSiteCopyValues();return <main className="mx-auto max-w-4xl px-4 py-8"><div className="card mb-5 flex items-center gap-4 p-5"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--ink)] text-[var(--amber)]"><Type className="h-6 w-6"/></span><div><h1 className="text-2xl font-black">نصوص الموقع</h1><p className="mt-1 text-sm font-bold text-[var(--ink)]/50">تعديل العناوين والأزرار والنصوص التي تظهر للعملاء دون تعديل الكود.</p></div></div><ContentSettingsPanel initialValues={values}/></main>}
