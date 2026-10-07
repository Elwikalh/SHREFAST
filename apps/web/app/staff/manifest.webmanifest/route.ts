import type { MetadataRoute } from "next"

// Separate installable manifest for staff screens: installing the app while
// on the operations board must reopen THAT screen, not the customer
// storefront (the root manifest's start_url is "/").
export function GET(): Response {
	const manifest: MetadataRoute.Manifest = {
		name: "شاشة شغلي | الحَبّوب",
		short_name: "شاشة شغلي",
		description: "شاشة تشغيل الطلبات — الحَبّوب",
		start_url: "/staff/owner/orders",
		display: "standalone",
		background_color: "#f6f3ed",
		theme_color: "#182720",
		lang: "ar",
		dir: "rtl",
		icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
	}
	return new Response(JSON.stringify(manifest), { headers: { "Content-Type": "application/manifest+json" } })
}
