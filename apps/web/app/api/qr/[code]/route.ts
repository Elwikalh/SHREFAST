import { eq } from "drizzle-orm"
import { db, branches } from "@el7bboB/db"
import { pointOfSalePath } from "../../../order/channels"
import { renderQrSvg } from "@/lib/qr"
import { requestOrigin } from "@/lib/site-url"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Downloads the QR of one point of sale as an SVG file, ready to be sized and
// stuck anywhere. The domain comes from the request itself, so downloading
// from the new domain later produces working codes with no setup. The code is
// looked up first so the file can only ever contain a real point-of-sale link.
export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
	const { code } = await params

	const [branch] = await db.select().from(branches).where(eq(branches.code, code))
	if (!branch) return new Response("Not found", { status: 404 })

	const origin = await requestOrigin()
	const svg = await renderQrSvg(`${origin}${pointOfSalePath(branch.code)}`)

	return new Response(svg, {
		headers: {
			"Content-Type": "image/svg+xml; charset=utf-8",
			"Content-Disposition": `attachment; filename="el7bbob-qr-${branch.code}.svg"`,
			"Cache-Control": "no-store",
		},
	})
}
