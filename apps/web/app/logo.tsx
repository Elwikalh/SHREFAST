// The approved El Habboub mark, rendered directly from the brand-approved
// logo artwork (bean-in-pan icon + "El7bboB" wordmark) — no hand-recreated
// shapes. The icon (orange laughing bean sitting on a dark crescent pan)
// never changes; only the wordmark swaps color so it stays legible on both
// light (cream) and dark (ink/photo) surfaces.
export function BeanMark({
	className = "h-9 w-9",
}: {
	className?: string
	tone?: "light" | "dark"
}) {
	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img src="/brand/mark.svg" alt="" className={`${className} shrink-0 object-contain`} />
	)
}

// The fixed universal lockup: the bean mark on the left, "الحَبّوب" stacked
// above the latin base "El7bboB" — always shown together exactly like the
// approved brand asset. Never split, translate-away, or swap this per site
// language; only the overall size should change for small placements. Keep
// it inside a dir="ltr" wrapper so the mark stays pinned left regardless of
// page direction.
export function Logo({
	tone = "light",
	className = "",
	markClassName = "h-11 w-11",
}: {
	tone?: "light" | "dark"
	className?: string
	markClassName?: string
}) {
	const wordmarkSrc = tone === "dark" ? "/brand/wordmark-light.svg" : "/brand/wordmark-dark.svg"
	return (
		<span dir="ltr" className={`inline-flex items-center gap-3 ${className}`}>
			<BeanMark className={markClassName} />
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={wordmarkSrc} alt="الحَبّوب — El7bboB" className="h-9 w-auto object-contain" />
		</span>
	)
}
