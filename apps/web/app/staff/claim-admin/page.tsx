import { eq } from "drizzle-orm"
import { redirect } from "next/navigation"
import Link from "next/link"
import { ChevronRight, ShieldCheck } from "lucide-react"
import { db, staff } from "@el7bboB/db"
import { getStaffSession } from "@/lib/staff-session"
import { BeanMark } from "../../logo"
import { ClaimAdminButton } from "./claim-admin-button"

// Always resolves the current session and the live admin count, so this
// must never be statically cached.
export const dynamic = "force-dynamic"

export default async function ClaimAdminPage() {
	const staffSession = await getStaffSession()
	if (staffSession) redirect("/staff")

	const existingAdmins = await db.select().from(staff).where(eq(staff.role, "admin"))
	const adminAlreadyExists = existingAdmins.length > 0

	return (
		<main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-5 px-4 py-10">
			<div className="card w-full p-6 text-center">
				<div className="flex flex-col items-center gap-3">
					<span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[var(--sesame)]">
						<BeanMark className="h-9 w-9" />
						<span className="absolute -bottom-1 -left-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--amber)] text-[var(--ink)] shadow-[var(--shadow-sm)]">
							<ShieldCheck className="h-3.5 w-3.5" />
						</span>
					</span>
					<h1 className="text-xl font-black text-[var(--ink)]">تفعيل أول حساب أدمن</h1>
				</div>

				<div className="hairline my-5" />

				{adminAlreadyExists ? (
					<>
						<p className="text-sm font-bold leading-relaxed text-[var(--ink)]/60">
							فيه أدمن متسجل بالفعل على المنصة. سجّل دخولك من صفحة تسجيل الدخول العادية، ولو حسابك لسه مستني دور اطلب من الأدمن يفعّلك من لوحة التحكم.
						</p>
						<Link href="/staff/login" className="btn btn-primary mt-5 w-full rounded-xl px-4 py-3">
							دخول الموظفين
						</Link>
					</>
				) : (
					<>
						{/* Two steps, numbered, because this page is used exactly once and
							the order matters: account first, then claim. */}
						<ol className="flex flex-col gap-3 text-right">
							<li className="flex items-start gap-3 rounded-2xl bg-[var(--surface-muted)] p-3">
								<span className="num flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--sesame)] text-xs font-black text-[var(--amber-deep)]">
									1
								</span>
								<span className="text-sm font-bold leading-relaxed text-[var(--ink)]/70">
									اعمل حساب من{" "}
									<Link href="/staff/signup" className="font-black text-[var(--amber-deep)] underline">
										إنشاء حساب موظف
									</Link>{" "}
									لو لسه معملتش
								</span>
							</li>
							<li className="flex items-start gap-3 rounded-2xl bg-[var(--surface-muted)] p-3">
								<span className="num flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--sesame)] text-xs font-black text-[var(--amber-deep)]">
									2
								</span>
								<span className="text-sm font-bold leading-relaxed text-[var(--ink)]/70">
									ارجع للصفحة دي واضغط الزرار عشان تبقى الأدمن الأول
								</span>
							</li>
						</ol>

						<div className="mt-5">
							<ClaimAdminButton />
						</div>
					</>
				)}
			</div>

			<Link href="/" className="chip-outline hover:border-[var(--line-strong)]">
				<ChevronRight className="h-3.5 w-3.5" />
				ارجع للموقع
			</Link>
		</main>
	)
}
