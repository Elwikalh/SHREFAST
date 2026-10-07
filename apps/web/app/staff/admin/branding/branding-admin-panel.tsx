"use client"

import { useRef, useState, useTransition } from "react"
import {
	Check,
	GalleryHorizontalEnd,
	ImageOff,
	Link2,
	Loader2,
	Upload,
	Wallet,
	X,
} from "lucide-react"
import { updateHeroImage, updateInstapaySettings } from "./actions"

// Downscales + recompresses the picked file in-browser (via canvas) before
// turning it into a data URL. This becomes the full-page site background,
// so we allow a larger max dimension than menu-item photos.
function resizeImageToDataUrl(file: File, maxSize = 1920, quality = 0.85): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onerror = () => reject(new Error("مقدرناش نقرا الصورة"))
		reader.onload = () => {
			const img = new Image()
			img.onerror = () => reject(new Error("الملف مش صورة صالحة"))
			img.onload = () => {
				const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
				const width = Math.round(img.width * scale)
				const height = Math.round(img.height * scale)
				const canvas = document.createElement("canvas")
				canvas.width = width
				canvas.height = height
				const ctx = canvas.getContext("2d")
				if (!ctx) {
					reject(new Error("مقدرناش نجهز الصورة"))
					return
				}
				ctx.drawImage(img, 0, 0, width, height)
				resolve(canvas.toDataURL("image/jpeg", quality))
			}
			img.src = reader.result as string
		}
		reader.readAsDataURL(file)
	})
}

export type InstapaySettings = {
	instapayAddress: string | null
	instapayWalletNumber: string | null
	instapayAccountName: string | null
}

// The InstaPay account the customer transfers to. Whatever is saved here is
// exactly what appears on the checkout screen, so it stays editable without
// touching code.
function InstapaySection({ settings }: { settings: InstapaySettings }) {
	const [address, setAddress] = useState(settings.instapayAddress ?? "")
	const [wallet, setWallet] = useState(settings.instapayWalletNumber ?? "")
	const [accountName, setAccountName] = useState(settings.instapayAccountName ?? "")
	const [isPending, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)
	const [saved, setSaved] = useState(false)

	function save() {
		setError(null)
		setSaved(false)
		startTransition(async () => {
			try {
				await updateInstapaySettings({
					instapayAddress: address,
					instapayWalletNumber: wallet,
					instapayAccountName: accountName,
				})
				setSaved(true)
			} catch (submitError) {
				setError(submitError instanceof Error ? submitError.message : "حصل خطأ")
			}
		})
	}

	const isConfigured = address.trim().length > 0 || wallet.trim().length > 0

	return (
		<section className="rounded-2xl border border-[var(--ink)]/10 bg-white p-5">
			<h2 className="mb-1 flex items-center gap-2 text-lg font-bold">
				<Wallet className="h-5 w-5 text-[var(--amber-deep)]" /> حساب إنستاباي للتحويل
			</h2>
			<p className="mb-4 text-sm text-[var(--ink)]/55">
				البيانات دي هي اللي تظهر للعميل في شاشة الدفع لما يختار إنستاباي. لو سيبتها فاضية، اختيار إنستاباي هيتخفي
				من الموقع ويفضل الكاش بس.
			</p>

			<div className="flex flex-col gap-3">
				<label className="flex flex-col gap-1">
					<span className="text-xs font-bold text-[var(--ink)]/60">عنوان إنستاباي (IPA)</span>
					<input
						value={address}
						onChange={(event) => setAddress(event.target.value)}
						placeholder="el7bbob@instapay"
						dir="ltr"
						className="rounded-lg border border-[var(--ink)]/15 px-3 py-2 text-sm outline-none transition focus:border-[var(--amber)]"
					/>
				</label>

				<label className="flex flex-col gap-1">
					<span className="text-xs font-bold text-[var(--ink)]/60">رقم المحفظة / الموبايل</span>
					<input
						value={wallet}
						onChange={(event) => setWallet(event.target.value.replace(/[^\d]/g, ""))}
						placeholder="01xxxxxxxxx"
						dir="ltr"
						inputMode="numeric"
						className="rounded-lg border border-[var(--ink)]/15 px-3 py-2 text-sm outline-none transition focus:border-[var(--amber)]"
					/>
				</label>

				<label className="flex flex-col gap-1">
					<span className="text-xs font-bold text-[var(--ink)]/60">اسم صاحب الحساب</span>
					<input
						value={accountName}
						onChange={(event) => setAccountName(event.target.value)}
						placeholder="الاسم اللي هيظهر للعميل قبل التحويل"
						className="rounded-lg border border-[var(--ink)]/15 px-3 py-2 text-sm outline-none transition focus:border-[var(--amber)]"
					/>
				</label>
			</div>

			<div className="mt-4 flex flex-wrap items-center gap-3">
				<button
					type="button"
					onClick={save}
					disabled={isPending}
					className="flex items-center gap-1.5 rounded-lg bg-[var(--amber)] px-4 py-2 text-sm font-bold text-[var(--ink)] transition active:scale-[0.98] disabled:opacity-50"
				>
					{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
					{isPending ? "جاري الحفظ..." : "احفظ الحساب"}
				</button>
				<span className="text-xs font-bold text-[var(--ink)]/45">
					{isConfigured ? "إنستاباي مفعّل للعملاء" : "إنستاباي مخفي حاليًا"}
				</span>
				{saved ? <span className="text-xs font-bold text-emerald-600">اتحفظ</span> : null}
			</div>
			{error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
		</section>
	)
}

export function BrandingAdminPanel({
	heroImageDataUrl,
	instapay,
}: {
	heroImageDataUrl: string | null
	instapay: InstapaySettings
}) {
	const [value, setValue] = useState<string | null>(heroImageDataUrl)
	const [isPending, startTransition] = useTransition()
	const [isProcessing, setIsProcessing] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [showLinkInput, setShowLinkInput] = useState(false)
	const [linkValue, setLinkValue] = useState("")
	const inputRef = useRef<HTMLInputElement>(null)

	function save(next: string | null) {
		setError(null)
		startTransition(async () => {
			try {
				await updateHeroImage(next)
				setValue(next)
			} catch (submitError) {
				setError(submitError instanceof Error ? submitError.message : "حصل خطأ")
			}
		})
	}

	async function handleFile(file: File | undefined) {
		if (!file) return
		setError(null)
		setIsProcessing(true)
		try {
			const dataUrl = await resizeImageToDataUrl(file)
			save(dataUrl)
		} catch (processError) {
			setError(processError instanceof Error ? processError.message : "حصل خطأ في الصورة")
		} finally {
			setIsProcessing(false)
		}
	}

	function handleUseLink() {
		setError(null)
		const trimmed = linkValue.trim()
		if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
			setError("حط رابط صورة يبدأ بـ https:// (رابط عام يقدر أي حد يفتحه)")
			return
		}
		save(trimmed)
		setLinkValue("")
		setShowLinkInput(false)
	}

	return (
		<div className="flex flex-col gap-6">
			<section className="rounded-2xl border border-[var(--ink)]/10 bg-white p-5">
				<h2 className="mb-1 flex items-center gap-2 text-lg font-bold">
					<GalleryHorizontalEnd className="h-5 w-5 text-[var(--amber-deep)]" /> خلفية الموقع بالكامل
				</h2>
				<p className="mb-4 text-sm text-[var(--ink)]/55">
					دي صورة واحدة كبيرة بتفضل ثابتة خلف كل صفحة الموقع الرئيسية بالكامل من أول الهيدر لحد الفوتر (مش مجرد بانر
					في جزء واحد)، وبتتحرك بحركة تكبير بسيطة واحترافية أثناء التمرير. المقاس الأفضل: صورة عرضية عالية الجودة
					للأكل. من غير صورة، هتظهر خلفية متحركة أنيقة بدلاً منها بدون ما يفضل الموقع فاضي.
				</p>

				<div className="mb-4 aspect-[16/9] w-full overflow-hidden rounded-xl border border-[var(--ink)]/10 bg-[var(--sesame)]">
					{value ? (
						// eslint-disable-next-line @next/next/no-img-element
						<img src={value} alt="خلفية الموقع" className="h-full w-full object-cover" />
					) : (
						<div className="flex h-full w-full items-center justify-center text-[var(--ink)]/30">
							<ImageOff className="h-8 w-8" />
						</div>
					)}
				</div>

				<input
					ref={inputRef}
					type="file"
					accept="image/*"
					className="hidden"
					onChange={(event) => handleFile(event.target.files?.[0])}
				/>
				<div className="flex flex-wrap gap-2">
					<button
						type="button"
						disabled={isProcessing || isPending}
						onClick={() => inputRef.current?.click()}
						className="flex items-center gap-1.5 rounded-lg border border-[var(--ink)]/20 px-3 py-2 text-sm font-bold transition hover:bg-[var(--ink)]/5 disabled:opacity-50"
					>
						{isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
						{isProcessing ? "جاري الرفع..." : value ? "غيّر الصورة" : "ارفع صورة"}
					</button>
					<button
						type="button"
						disabled={isProcessing || isPending}
						onClick={() => setShowLinkInput((prev) => !prev)}
						className="flex items-center gap-1.5 rounded-lg border border-[var(--ink)]/20 px-3 py-2 text-sm font-bold transition hover:bg-[var(--ink)]/5 disabled:opacity-50"
					>
						<Link2 className="h-4 w-4" /> الصق رابط صورة
					</button>
					{value ? (
						<button
							type="button"
							disabled={isProcessing || isPending}
							onClick={() => save(null)}
							className="flex items-center gap-1.5 rounded-lg border border-red-300 px-3 py-2 text-sm font-bold text-red-500 transition hover:bg-red-50 disabled:opacity-50"
						>
							<X className="h-4 w-4" /> شيل الصورة (رجّع الخلفية المتحركة الافتراضية)
						</button>
					) : null}
				</div>
				{showLinkInput ? (
					<div className="mt-3 flex gap-2">
						<input
							value={linkValue}
							onChange={(event) => setLinkValue(event.target.value)}
							placeholder="https://example.com/photo.jpg"
							dir="ltr"
							className="flex-1 rounded-lg border border-[var(--ink)]/15 px-3 py-2 text-sm"
						/>
						<button
							type="button"
							onClick={handleUseLink}
							className="rounded-lg bg-[var(--amber)] px-3 py-2 text-sm font-bold text-[var(--ink)]"
						>
							استخدم الرابط
						</button>
					</div>
				) : null}
				{error ? <p className="mt-2 text-xs text-red-500">{error}</p> : null}
			</section>

			<InstapaySection settings={instapay} />
		</div>
	)
}
