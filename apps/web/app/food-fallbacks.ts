// Curated default photos so the storefront still looks populated for the
// well-known starter items before an admin uploads a real photo for them.
// An uploaded photo (photoDataUrl) always takes priority over these.
// Shared by the homepage and the product detail pages.
export const FALLBACK_IMAGE_BY_SLUG: Record<string, string> = {
	"foul-sada": "/food/foul-sandwich.svg",
	"foul-zeit-har": "/food/foul-pan.svg",
	"batates-mehamara": "/food/potato.svg",
	"beid-omelette": "/food/egg-cheese.svg",
	babaghanoug: "/food/babaganoug.svg",
	"hummus-tahina": "/food/mezze.svg",
}
