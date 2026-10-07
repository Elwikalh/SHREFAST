import Link from "next/link"
import { ChevronRight, Lock, MonitorSmartphone } from "lucide-react"
import { BeanMark } from "../../logo"

// A dead end still needs a door: the staff member gets told why, and gets a
// link back to the screens they are allowed to open.
export default function StaffForbiddenPage() {
	return (
		<main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-5 px-4 py-10">
			<div className="card w-full p-6 text-center">
				<div className="flex flex-col items-center gap-3">
					<span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[var(--sesame)]">
						<BeanMark className="h-9 w-9" />
						<span className="absolute -bottom-1 -left-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--terracotta)] text-white shadow-[var(--shadow-sm)]">
							<Lock className="h-3.5 w-3.5" />
						</span>
					</span>
					<h1 className="text-xl font-black text-[var(--ink)]">ممنوع الدخول</h1>
				</div>

				<div className="hairline my-5" />

				<p className="text-sm font-bold leading-relaxed text-[var(--ink)]/60">
					معندكش صلاحية تدخل على المكان ده. اطلب من الأدمن يضيفك عليه لو محتاج.
				</p>

				<Link href="/staff" className="btn btn-primary mt-5 w-full rounded-xl px-4 py-3">
					<MonitorSmartphone className="h-4 w-4" /> روح لشاشاتك
				</Link>
			</div>

			<Link href="/" className="chip-outline hover:border-[var(--line-strong)]">
				<ChevronRight className="h-3.5 w-3.5" />
				ارجع للموقع
			</Link>
		</main>
	)
}
