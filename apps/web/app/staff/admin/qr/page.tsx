import { asc, eq } from "drizzle-orm"
import { Download, ExternalLink, QrCode, Store, UtensilsCrossed } from "lucide-react"
import { db, branches } from "@el7bboB/db"
import { pointOfSalePath } from "../../../order/channels"
import { renderQrSvg } from "@/lib/qr"
import { requestOrigin } from "@/lib/site-url"

// Reads live points of sale on every request; must not be prerendered.
export const dynamic = "force-dynamic"

// One page that holds the ordering link and the QR of every point of sale.
// Scanning a code opens that exact point of sale's menu, which is how the
// customer standing at a counter or a street point orders without ever being
// asked where they are.
export default async function PointOfSaleQrPage() {
	const activePoints = await db
		.select()
		.from(branches)
		.where(eq(branches.isActive, true))
		.orderBy(asc(branches.type), asc(branches.name))

	// Same origin the downloaded SVG carries, so what is shown on screen is
	// exactly what a customer's camera will open.
	const base = await requestOrigin()

	const cards = await Promise.all(
		activePoints.map(async (point) => {
			const url = `${base}${pointOfSalePath(point.code)}`
			return {
				code: point.code,
				name: point.name,
				type: point.type,
				address: point.address,
				url,
				svg: await renderQrSvg(url),
			}
		}),
	)

	return (
		<div className="flex flex-col gap-5">
			{/* The explanation sits in one calm band instead of two loose lines. */}
			<div className="card flex items-start gap-3 p-4">
				<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--sesame)] text-[var(--amber-deep)]">
					<QrCode className="h-5 w-5" />
				</span>
				<div className="flex flex-col gap-1.5">
					<p className="text-sm font-bold leading-relaxed text-[var(--ink)]/70">
						كل نقطة بيع لها لينك و QR خاص بيها. العميل يعمل سكان فيفتح مينيو النقطة دي على طول، والطلب بيتسجل عليها.
					</p>
					<p className="text-xs font-bold leading-relaxed text-[var(--ink)]/45">
						الأكواد بتتولّد بدومين الصفحة المفتوحة دلوقتي — لو غيرت الدومين، افتح الصفحة دي من الدومين الجديد ونزلها تاني.
					</p>
				</div>
			</div>

			{cards.length === 0 ? (
				<p className="rounded-3xl border border-dashed border-[var(--line-strong)] bg-[var(--surface-muted)] p-8 text-center text-sm font-black text-[var(--ink)]/50">
					مفيش نقاط بيع مفعّلة
				</p>
			) : (
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
					{cards.map((card) => (
						<div key={card.code} className="card card-lift flex flex-col gap-3 p-4">
							<div className="flex items-start justify-between gap-2">
								<div className="min-w-0">
									<p className="truncate font-black text-[var(--ink)]">{card.name}</p>
									{card.address ? (
										<p className="truncate text-xs font-bold text-[var(--ink)]/45">{card.address}</p>
									) : null}
								</div>
								<span className="chip shrink-0 text-[11px]">
									{card.type === "cart" ? (
										<>
											<Store className="h-3 w-3" /> نقطة بيع
										</>
									) : (
										<>
											<UtensilsCrossed className="h-3 w-3" /> المحل
										</>
									)}
								</span>
							</div>

							{/* The generated SVG scales to the box, so the same code works on a
								small counter sticker and on a large street sign. */}
							<div
								className="mx-auto w-full max-w-[220px] rounded-2xl border border-[var(--line)] bg-white p-3 shadow-[var(--shadow-sm)] [&>svg]:h-auto [&>svg]:w-full"
								dangerouslySetInnerHTML={{ __html: card.svg }}
							/>

							<p
								dir="ltr"
								className="truncate rounded-xl bg-[var(--sesame)]/70 px-2.5 py-2 text-center text-xs font-bold text-[var(--ink)]/65"
							>
								{card.url}
							</p>

							<div className="mt-auto grid grid-cols-2 gap-2">
								<a href={`/api/qr/${card.code}`} className="btn btn-dark rounded-xl px-3 py-2.5 text-xs">
									<Download className="h-3.5 w-3.5" /> تحميل الـ QR
								</a>
								<a
									href={pointOfSalePath(card.code)}
									target="_blank"
									rel="noreferrer"
									className="btn btn-outline rounded-xl px-3 py-2.5 text-xs"
								>
									<ExternalLink className="h-3.5 w-3.5" /> افتح الصفحة
								</a>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
