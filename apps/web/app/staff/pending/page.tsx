import Link from "next/link"
import { ChevronRight, Clock } from "lucide-react"
import { BeanMark } from "../../logo"

// A staff member who lands here is stuck until an admin assigns them. The
// screen has to say that plainly and still give them a way back out.
export default function StaffPendingPage() {
	return (
		<main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-5 px-4 py-10">
			<div className="card w-full p-6 text-center">
				<div className="flex flex-col items-center gap-3">
					<span className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[var(--sesame)]">
						<BeanMark className="h-9 w-9" />
						<span className="absolute -bottom-1 -left-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--amber)] text-[var(--ink)] shadow-[var(--shadow-sm)]">
							<Clock className="h-3.5 w-3.5" />
						</span>
					</span>
					<h1 className="text-xl font-black text-[var(--ink)]">الحساب تحت المراجعة</h1>
				</div>

				<div className="hairline my-5" />

				<p className="text-sm font-bold leading-relaxed text-[var(--ink)]/60">
					حسابك اتعمل خلاص، بس لسه محددشلك دور ولا نقطة بيع. اطلب من الأدمن يحددلك دورك والمكان التابع له.
				</p>

				<div className="mt-4 flex flex-wrap justify-center gap-2">
					<span className="chip-outline">أدمن</span>
					<span className="chip-outline">مدير</span>
					<span className="chip-outline">كاشير</span>
					<span className="chip-outline">مطبخ</span>
				</div>
			</div>

			<Link href="/" className="chip-outline hover:border-[var(--line-strong)]">
				<ChevronRight className="h-3.5 w-3.5" />
				ارجع للموقع
			</Link>
		</main>
	)
}
