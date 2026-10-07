"use server"

import { sql, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { db, staff } from "@el7bboB/db"
import { auth } from "@/lib/auth"

// Called right after a successful staff signup. New accounts have no staff
// record (no role, no branch) until an admin assigns one — except the very
// first account ever created, which is auto-promoted to admin so there is
// always at least one person who can grant access to everyone else.
export async function ensureStaffBootstrap() {
	const authSession = await auth.api.getSession({ headers: await headers() })
	if (!authSession) return { promoted: false }

	const [existing] = await db.select().from(staff).where(eq(staff.userId, authSession.user.id))
	if (existing) return { promoted: existing.role === "admin" }

	const countRows = await db.select({ staffCount: sql<number>`count(*)` }).from(staff)
	const staffCount = Number(countRows[0]?.staffCount ?? 0)

	if (staffCount === 0) {
		await db.insert(staff).values({
			userId: authSession.user.id,
			name: authSession.user.name,
			role: "admin",
			branchId: null,
		})
		return { promoted: true }
	}

	return { promoted: false }
}
