"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, UtensilsCrossed } from "lucide-react"

// Cover photo + admin-uploaded extra photos, browsable with arrows and
// thumbnails. Works right-to-left: the right arrow goes to the next photo.
export function ProductGallery({ photos, alt }: { photos: string[]; alt: string }) {
	const [index, setIndex] = useState(0)

	if (photos.length === 0) {
		return (
			<div className="flex aspect-square w-full items-center justify-center rounded-3xl border border-white/10 bg-white/10">
				<UtensilsCrossed className="h-12 w-12 text-white/30" />
			</div>
		)
	}

	const safeIndex = Math.min(index, photos.length - 1)
	const hasMultiple = photos.length > 1

	function step(direction: number) {
		setIndex((current) => (current + direction + photos.length) % photos.length)
	}

	return (
		<div className="flex flex-col gap-3">
			<div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-2xl shadow-black/40">
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={photos[safeIndex]} alt={alt} className="h-full w-full object-cover" />
				{hasMultiple ? (
					<>
						<button
							type="button"
							aria-label="الصورة السابقة"
							onClick={() => step(-1)}
							className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-black/75"
						>
							<ChevronLeft className="h-5 w-5" />
						</button>
						<button
							type="button"
							aria-label="الصورة التالية"
							onClick={() => step(1)}
							className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-black/75"
						>
							<ChevronRight className="h-5 w-5" />
						</button>
						<span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs font-bold text-white backdrop-blur">
							{safeIndex + 1} / {photos.length}
						</span>
					</>
				) : null}
			</div>

			{hasMultiple ? (
				<div className="flex flex-wrap gap-2">
					{photos.map((photo, photoIndex) => (
						<button
							key={`${photoIndex}-${photo.slice(-24)}`}
							type="button"
							onClick={() => setIndex(photoIndex)}
							aria-label={`صورة ${photoIndex + 1}`}
							className={`h-16 w-16 overflow-hidden rounded-xl border-2 transition ${
								photoIndex === safeIndex
									? "border-[var(--amber)] opacity-100"
									: "border-white/15 opacity-70 hover:opacity-100"
							}`}
						>
							{/* eslint-disable-next-line @next/next/no-img-element */}
							<img src={photo} alt="" className="h-full w-full object-cover" />
						</button>
					))}
				</div>
			) : null}
		</div>
	)
}
