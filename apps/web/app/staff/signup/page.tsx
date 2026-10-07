import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { BeanMark } from "../../logo"
import { SignupForm } from "./signup-form"

// Same brand card as the sign-in screen: staff should not feel like they
// crossed into a different, unfinished product when they create an account.
export default function StaffSignupPage() {
	return (
		<main className="mx-auto flex min-h-screen w-full max-w-sm flex-col items-center justify-center gap-5 px-4 py-10">
			<div className="card w-full p-6">
				<div className="flex flex-col items-center gap-3 text-center">
					<span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--sesame)]">
						<BeanMark className="h-9 w-9" />
					</span>
					<div>
						<h1 className="text-xl font-black text-[var(--ink)]">إنشاء حساب موظف</h1>
						<p className="mt-1 text-sm font-bold text-[var(--ink)]/50">أول حساب بيبقى أدمن أوتوماتيك</p>
					</div>
				</div>

				<div className="hairline my-5" />

				<SignupForm />

				<p className="mt-5 text-center text-xs font-bold leading-relaxed text-[var(--ink)]/45">
					أي حساب تاني لازم الأدمن يحددله الفرع والصلاحيات
				</p>

				<p className="mt-4 text-center text-sm font-bold text-[var(--ink)]/55">
					عندك حساب بالفعل؟{" "}
					<Link href="/staff/login" className="font-black text-[var(--amber-deep)] hover:underline">
						دخول
					</Link>
				</p>
			</div>

			<Link href="/" className="chip-outline hover:border-[var(--line-strong)]">
				<ChevronRight className="h-3.5 w-3.5" />
				ارجع للموقع
			</Link>
		</main>
	)
}
