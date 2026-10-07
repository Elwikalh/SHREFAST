import Link from "next/link"
import { notFound } from "next/navigation"
import { and, asc, eq, ne } from "drizzle-orm"
import { ChevronRight } from "lucide-react"
import { db, menuItems } from "@el7bboB/db"
import { Logo } from "../../logo"
import { FALLBACK_IMAGE_BY_SLUG } from "../../food-fallbacks"
import { QuickAddButton } from "../../quick-add-button"
import { FloatingCartBar } from "../../floating-cart-bar"
import { CartToast } from "../../cart-toast"
import { loadSandwichBreadCatalog } from "../../sandwich-bread-store"
import { breadChoices, sandwichBreadEligible, isSandwichBread } from "../../sandwich-bread"
import { SandwichBreadSelector } from "../../sandwich-bread-selector"
import { ProductGallery } from "./product-gallery"

// Prices, availability, photos, and descriptions all come from the admin
// panel and must show up immediately after an edit.
export const dynamic = "force-dynamic"

// Same wording as the storefront sections and the admin dropdown.
const CATEGORY_LABEL_AR: Record<string, string> = {
	base_item: "ساندوتش",
	mix: "ميكس",
	platter: "طبق / وجبة",
	breakfast_box: "بوكس فطار",
	addon: "مقبلات",
	beverage: "مشروب",
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params

	const [item] = await db.select().from(menuItems).where(eq(menuItems.slug, slug)).limit(1)
	if (!item || !item.isAvailable || isSandwichBread(item.slug)) {
		// Server-side diagnostics only: no customer data, SQL, row contents,
		// credentials, or client-visible changes. Keep the existing guards intact.
		console.warn("[menu-detail-v1] " + JSON.stringify({
			reason: !item ? "slug_not_found" : !item.isAvailable ? "unavailable" : "internal_bread_variant",
			requestedSlug: slug.slice(0, 100),
			requestedLength: slug.length,
			requestedCodePoints: Array.from(slug.slice(0, 100), char => char.codePointAt(0)),
		}))
		notFound()
	}

	// Cover photo first, then the admin-ordered gallery photos.
	const cover = item.photoDataUrl ?? FALLBACK_IMAGE_BY_SLUG[item.slug] ?? null
	const photos = [cover, ...(item.photosJson ?? [])].filter((photo): photo is string => Boolean(photo))

	// A few more items from the same category, so the page is a real menu
	// section and not a dead end.
	const related = await db
		.select()
		.from(menuItems)
		.where(and(eq(menuItems.category, item.category), eq(menuItems.isAvailable, true), ne(menuItems.id, item.id)))
		.orderBy(asc(menuItems.sortOrder))
		.limit(4)

	const price = Number(item.priceEGP), breadCatalog = await loadSandwichBreadCatalog(), configured = sandwichBreadEligible(item) && breadCatalog.configs[item.id]?.enabled, choices = breadChoices(item, breadCatalog.products, breadCatalog.configs[item.id])

	return (
		<main dir="rtl" className="min-h-screen">
			<header className="glass sticky top-0 z-30 border-b border-[var(--line)]">
				<div dir="ltr" className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6">
					<Link href="/" className="shrink-0">
						<Logo tone="light" markClassName="h-10 w-10" />
					</Link>
					<Link href="/order" className="btn btn-primary rounded-full px-5 py-2.5 text-sm">
						اطلب دلوقتي
					</Link>
				</div>
			</header>

			<div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
				<Link
					href="/#menu"
					className="btn rounded-full border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--ink)]/70 hover:bg-[var(--sesame)]"
				>
					<ChevronRight className="h-4 w-4" /> المينيو
				</Link>

				<div className="mt-5 grid gap-8 md:grid-cols-2">
					<div className="card overflow-hidden p-2">
						<ProductGallery photos={photos} alt={item.nameAr} />
					</div>

					<div className="flex flex-col gap-4">
						<span className="chip w-fit border border-[var(--amber-deep)]/30 bg-[var(--amber)]/15 text-[var(--amber-deep)]">
							{CATEGORY_LABEL_AR[item.category] ?? "صنف"}
						</span>
						<div>
							<h1 className="text-3xl font-black leading-tight text-[var(--ink)] sm:text-4xl">{item.nameAr}</h1>
							<p dir="ltr" className="mt-1 text-sm font-bold text-[var(--ink)]/45">
								{item.nameEn}
							</p>
						</div>

						{/* Price and the add control sit together: the customer decides and
							orders in the same place instead of being sent to another screen. */}
						<div className="card flex items-center justify-between gap-3 p-3">
							{configured ? <SandwichBreadSelector parentId={item.id} nameAr={item.nameAr} choices={choices}/> : <>
							<p className="num text-3xl font-black text-[var(--amber-deep)]">{price} ج.م</p>
							<QuickAddButton
								menuItemId={item.id}
								nameAr={item.nameAr}
								priceEGP={price}
								label="أضف للطلب"
							/>
							</>}
						</div>

						{item.descriptionAr ? (
							<p className="whitespace-pre-line text-base leading-relaxed text-[var(--ink)]/75">
								{item.descriptionAr}
							</p>
						) : null}

						{item.descriptionEn ? (
							<p
								dir="ltr"
								className="whitespace-pre-line border-t border-[var(--line)] pt-4 text-sm leading-relaxed text-[var(--ink)]/50"
							>
								{item.descriptionEn}
							</p>
						) : null}

						<div className="mt-1 flex flex-wrap gap-3">
							<Link href="/order" className="btn btn-dark rounded-full px-7 py-3 text-sm">
								روح للطلب
							</Link>
							<Link href="/#menu" className="btn btn-outline rounded-full px-7 py-3 text-sm">
								شوف المينيو
							</Link>
						</div>
					</div>
				</div>

				{related.length > 0 ? (
					<section className="mt-14">
						<div className="mb-5 flex items-center gap-3">
							<h2 className="text-xl font-black text-[var(--ink)]">
								كمان من {CATEGORY_LABEL_AR[item.category] ?? "نفس القسم"}
							</h2>
							<span className="hairline flex-1" />
						</div>
						<div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
							{related.filter(other => !isSandwichBread(other.slug)).map((other) => {
								const otherImage = other.photoDataUrl ?? FALLBACK_IMAGE_BY_SLUG[other.slug] ?? null
								return (
									<Link
										key={other.id}
										href={`/menu/${other.slug}`}
										className="card card-lift group overflow-hidden"
									>
										<div className="aspect-square w-full overflow-hidden bg-[var(--sesame)]">
											{otherImage ? (
												// eslint-disable-next-line @next/next/no-img-element
												<img
													src={otherImage}
													alt={other.nameAr}
													className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
												/>
											) : null}
										</div>
										<div className="p-3">
											<p className="truncate text-sm font-black text-[var(--ink)]">{other.nameAr}</p>
											<p className="num mt-1 text-sm font-black text-[var(--amber-deep)]">
												{sandwichBreadEligible(other) && breadCatalog.configs[other.id]?.enabled ? (breadChoices(other, breadCatalog.products, breadCatalog.configs[other.id]).map(c => `${c.nameAr}: ${c.priceEGP} ج.م`).join(" · ") || "غير متاح") : `${Number(other.priceEGP)} ج.م`}
											</p>
										</div>
									</Link>
								)
							})}
						</div>
					</section>
				) : null}
			</div>

			<footer className="border-t border-[var(--line)] bg-[var(--surface-muted)] py-8 pb-28 text-center text-xs font-bold text-[var(--ink)]/50">
				© {new Date().getFullYear()} الحَبّوب · EL HABBOUB
			</footer>

			{/* Anything added here stays one tap from checkout, exactly like the
				storefront. */}
			<FloatingCartBar isAr />
			<CartToast />
		</main>
	)
}
