import { headers } from "next/headers"

// Absolute origin used when no request is available (build-time metadata,
// background work). NEXT_PUBLIC_SITE_URL wins once the real domain exists.
export function siteUrl(): string {
	const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "https://el7bbob-production.up.railway.app"
	return raw.replace(/\/+$/, "")
}

// QR codes get printed and stuck on a counter, so the domain inside them
// decides whether a sticker keeps working. Reading it from the live request
// means the code always carries the exact domain the admin is browsing: move
// the site to a new host or a new domain and the codes follow by themselves,
// with no environment variable to remember and nothing to redeploy.
export async function requestOrigin(): Promise<string> {
	const headerList = await headers()

	// Railway (and any reverse proxy) forwards the public host here; `host`
	// alone would be the internal container address.
	const forwardedHost = headerList.get("x-forwarded-host")
	const host = (forwardedHost ?? headerList.get("host") ?? "").split(",")[0]?.trim()
	if (!host) return siteUrl()

	const forwardedProto = headerList.get("x-forwarded-proto")?.split(",")[0]?.trim()
	const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1")
	const proto = forwardedProto ?? (isLocal ? "http" : "https")

	return `${proto}://${host}`
}
