import { redirect } from "next/navigation"

// There is no second menu on this site. The storefront home page lists every
// category with an add button on each card, so this route was showing the same
// menu twice. It is kept only as a redirect so old links, bookmarks, shared
// URLs and printed material land on the menu instead of a 404.
export default function OrderRedirectPage() {
	redirect("/#menu")
}
