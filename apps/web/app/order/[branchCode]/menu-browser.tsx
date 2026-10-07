"use client"

import { useMemo, useState } from "react"
import {
	Search,
	Sandwich,
	Flame,
	UtensilsCrossed,
	Package,
	Salad,
	Coffee,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { AddToCartButton } from "./add-to-cart-button"
import { ItemDetailModal } from "./item-detail-modal"

type MenuItem = {
	id: string
	nameAr: string
	nameEn: string
	category: string
	priceEGP: number
	photoDataUrl: string | null
	descriptionAr: string | null
}

// Same order and naming as the storefront menu, so the sections the customer
// browsed on the home page are the sections they order from here.
const CATEGORY_ORDER = ["base_item", "mix", "platter", "breakfast_box", "addon", "beverage"] as const

const CATEGORY_LABELS: Record<string, string> = {
	base_item: "الساندويتشات",
	mix: "الميكسات",
	platter: "الأطباق والوجبات",
	breakfast_box: "بوكسات الفطار",
	addon: "المقبلات",
	beverage: "المشروبات",
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
	base_item: Sandwich,
	mix: Flame,
	platter: UtensilsCrossed,
	breakfast_box: Package,
	addon: Salad,
	beverage: Coffee,
}

function categoryRank(category: string): number {
	const index = CATEGORY_ORDER.indexOf(category as (typeof CATEGORY_ORDER)[number])
	return index === -1 ? CATEGORY_ORDER.length : index
}

type Props = {
	items: MenuItem[]
}

// Ordering happens on this list and nowhere else: every card carries its own
// add control and its own description, so the customer never has to open a
// sheet to buy something. Tapping a card only enlarges it.
export function MenuBrowser({ items }: Props) {
	const categories = useMemo(() => {
		const seen = new Set<string>()
		for (const item of items) seen.add(item.category)
		return Array.from(seen).sort((a, b) => categoryRank(a) - categoryRank(b))
	}, [items])

	const addonOptions = useMemo(
		() =>
			items
				.filter((item) => item.category === "addon")
				.map((item) => ({ id: item.id, nameAr: item.nameAr, priceEGP: item.priceEGP })),
		[items],
	)

	const [activeCategory, setActiveCategory] = useState<string>("all")
	const [query, setQuery] = useState("")
	const [detailItem, setDetailItem] = useState<MenuItem | null>(null)

	const filteredItems = useMemo(() => {
		const normalizedQuery = query.trim().toLowerCase()
		return items.filter((item) => {
			const matchesCategory = activeCategory === "all" || item.category === activeCategory
			const matchesQuery =
				normalizedQuery.length === 0 ||
				item.nameAr.toLowerCase().includes(normalizedQuery) ||
				item.nameEn.toLowerCase().includes(normalizedQuery)
			return matchesCategory && matchesQuery
		})
	}, [items, activeCategory, query])

	const groupedItems = useMemo(() => {
		const map = new Map<string, MenuItem[]>()
		for (const item of filteredItems) {
			const list = map.get(item.category) ?? []
			list.push(item)
			map.set(item.category, list)
		}
		return Array.from(map.entries()).sort(([a], [b]) => categoryRank(a) - categoryRank(b))
	}, [filteredItems])

	const chipClass = (active: boolean) =>
		`btn shrink-0 rounded-full px-4 py-2 text-sm ${
			active ? "btn-primary" : "border border-[var(--line)] bg-white text-[var(--ink)]/65 hover:bg-[var(--sesame)]"
		}`

	return (
		<div>
			{/* Search and the category rail stay under the page header at every
				scroll depth, so a long menu never traps the customer. */}
			<div className="glass sticky top-[57px] z-10 -mx-4 mb-6 border-b border-[var(--line)] px-4 pb-3 pt-3">
				<div className="relative mb-3">
					<Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink)]/35" />
					<input
						type="search"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="دور على صنف..."
						className="input rounded-full py-3 pe-4 ps-11 text-sm"
					/>
				</div>

				<div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
					<button type="button" onClick={() => setActiveCategory("all")} className={chipClass(activeCategory === "all")}>
						الكل
					</button>
					{categories.map((category) => {
						const Icon = CATEGORY_ICONS[category] ?? UtensilsCrossed
						return (
							<button
								key={category}
								type="button"
								onClick={() => setActiveCategory(category)}
								className={chipClass(activeCategory === category)}
							>
								<Icon className="h-3.5 w-3.5" />
								{CATEGORY_LABELS[category] ?? category}
							</button>
						)
					})}
				</div>
			</div>

			{filteredItems.length === 0 ? (
				<p className="rounded-2xl border border-dashed border-[var(--line-strong)] bg-[var(--surface-muted)] p-8 text-center text-sm font-bold text-[var(--ink)]/45">
					مفيش أصناف مطابقة للبحث
				</p>
			) : (
				groupedItems.map(([category, categoryItems]) => {
					const Icon = CATEGORY_ICONS[category] ?? UtensilsCrossed
					return (
						<section key={category} className="mb-9">
							<div className="mb-4 flex items-center gap-3">
								<h2 className="flex items-center gap-2 text-lg font-black text-[var(--ink)]">
									<span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--amber)]/18 text-[var(--amber-deep)]">
										<Icon className="h-4 w-4" />
									</span>
									{CATEGORY_LABELS[category] ?? category}
									<span className="num text-xs font-bold text-[var(--ink)]/35">{categoryItems.length}</span>
								</h2>
								<span className="hairline flex-1" />
							</div>
							<ul className="grid gap-3 sm:grid-cols-2">
								{categoryItems.map((item) => {
									const ItemIcon = CATEGORY_ICONS[item.category] ?? UtensilsCrossed
									return (
										<li key={item.id} className="card card-lift flex items-stretch gap-3 p-2.5">
											{/* Tapping the card only zooms the item in — it is never a
												required step for ordering. */}
											<button
												type="button"
												onClick={() => setDetailItem(item)}
												className="group flex min-w-0 flex-1 items-center gap-3 text-right"
											>
												<div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-[var(--sesame)]">
													{item.photoDataUrl ? (
														// eslint-disable-next-line @next/next/no-img-element
														<img
															src={item.photoDataUrl}
															alt={item.nameAr}
															className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.06]"
														/>
													) : (
														<ItemIcon className="h-7 w-7 text-[var(--amber-deep)]/45" />
													)}
												</div>
												<div className="min-w-0 flex-1 py-0.5">
													<p className="truncate font-black leading-snug">{item.nameAr}</p>
													{item.descriptionAr ? (
														<p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--ink)]/50">
															{item.descriptionAr}
														</p>
													) : null}
													<p className="num mt-1.5 inline-flex rounded-lg bg-[var(--sesame)] px-2 py-0.5 text-sm font-black text-[var(--amber-deep)]">
														{item.priceEGP} ج.م
													</p>
												</div>
											</button>
											<div
												className="flex shrink-0 items-center"
												onClick={(event) => event.stopPropagation()}
											>
												<AddToCartButton menuItemId={item.id} nameAr={item.nameAr} priceEGP={item.priceEGP} />
											</div>
										</li>
									)
								})}
							</ul>
						</section>
					)
				})
			)}

			{detailItem ? (
				<ItemDetailModal
					item={detailItem}
					addonOptions={detailItem.category === "addon" ? [] : addonOptions}
					onClose={() => setDetailItem(null)}
				/>
			) : null}
		</div>
	)
}
