import { eq } from "drizzle-orm"
import { Palette } from "lucide-react"
import { db, siteSettings } from "@el7bboB/db"
import { requireAdmin } from "@/lib/staff-session"
import { BrandingAdminPanel } from "./branding-admin-panel"

// Always resolves the current admin session and the latest settings, so
// this must never be statically cached.
export const dynamic = "force-dynamic"

export default async function BrandingAdminPage() {
	await requireAdmin()

	const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, "default"))

	return (
		<main className="mx-auto max-w-3xl px-4 py-8">
			{/* Says what the screen controls, including the InstaPay account that the
				checkout hides while it is empty. */}
			<div className="card mb-5 flex items-center gap-3 p-5">
				<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--sesame)] text-[var(--amber-deep)]">
					<Palette className="h-5 w-5" />
				</span>
				<div>
					<h1 className="text-2xl font-black text-[var(--ink)]">هوية الموقع والدفع</h1>
					<p className="mt-0.5 text-sm font-bold text-[var(--ink)]/50">
						صورة الواجهة وحساب إنستاباي اللي العميل بيحول عليه
					</p>
				</div>
			</div>

			<BrandingAdminPanel
				heroImageDataUrl={settings?.heroImageDataUrl ?? null}
				instapay={{
					instapayAddress: settings?.instapayAddress ?? null,
					instapayWalletNumber: settings?.instapayWalletNumber ?? null,
					instapayAccountName: settings?.instapayAccountName ?? null,
				}}
			/>
		</main>
	)
}
