import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { eq } from "drizzle-orm"
import { db, staff, branches } from "@el7bboB/db"
import { auth } from "./auth"

export type StaffSession = {
	userId: string
	name: string
	email: string
	role: "admin" | "branch_manager" | "cashier" | "kitchen"
	branchId: string | null
}

// Returns the logged-in staff member for the current request, or null if
// there is no session or the account has no staff record yet (e.g. just
// signed up and waiting for an admin to assign a role/branch).
export async function getStaffSession(): Promise<StaffSession | null> {
	const authSession = await auth.api.getSession({ headers: await headers() })
	if (!authSession) return null

	const [staffRow] = await db.select().from(staff).where(eq(staff.userId, authSession.user.id))
	if (!staffRow) return null

	return {
		userId: authSession.user.id,
		name: staffRow.name,
		email: authSession.user.email,
		role: staffRow.role,
		branchId: staffRow.branchId,
	}
}

// Ensures the visitor is logged-in staff with access to `branchCode`.
// Admins can see every branch; everyone else is restricted to the single
// branch they are assigned to (their restaurant or their cart).
export async function requireBranchAccess(branchCode: string): Promise<StaffSession> {
	const staffSession = await getStaffSession()
	if (!staffSession) {
		redirect(`/staff/login?next=/staff/${branchCode}`)
	}

	if (staffSession.role === "admin") return staffSession

	const [branch] = await db.select().from(branches).where(eq(branches.code, branchCode))
	if (!branch || staffSession.branchId !== branch.id) {
		redirect("/staff/forbidden")
	}

	return staffSession
}

// Ensures the visitor is a logged-in admin. Used to gate the staff/roles
// admin panel, and by admin-only server actions as a second line of defense
// (never trust the client to only render admin controls for admins).
export async function requireAdmin(): Promise<StaffSession> {
	const staffSession = await getStaffSession()
	if (!staffSession) redirect("/staff/login?next=/staff/admin")
	if (staffSession.role !== "admin") redirect("/staff/forbidden")
	return staffSession
}

const ROLE_LABELS: Record<StaffSession["role"], string> = {
	admin: "أدمن",
	branch_manager: "مدير فرع",
	cashier: "كاشير",
	kitchen: "مطبخ",
}

export function roleLabel(role: StaffSession["role"]): string {
	return ROLE_LABELS[role]
}
