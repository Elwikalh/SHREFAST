import { NextResponse } from "next/server"

// Simple, DB-independent health check for Railway's healthcheckPath, so a
// deploy doesn't fail purely on a slow database connection at boot.
export function GET() {
	return NextResponse.json({ status: "ok", service: "el7bboB-web", timestamp: new Date().toISOString() })
}
