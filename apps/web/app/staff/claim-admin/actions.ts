"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { db, staff } from "@el7bboB/db"
import { auth } from "@/lib/auth"

// One-time bootstrap escape hatch: normally only an existing admin can grant
// the admin role (see staff/admin/actions.ts), which is a chicken-and-egg
// problem for a brand-new deployment with zero staff rows. This action lets
// the first logged-in user claim the admin role directly, but only while no
// admin exists yet. Once any admin exists, this always throws.
export async function claimFirstAdmin() {
	const authSession = await auth.api.getSession({ headers: await headers() })
	if (!authSession) throw new Error("لازم تسجل دخول الأول من صفحة تسجيل الدخول أو إنشاء حساب")

	const existingAdmins = await db.select().from(staff).where(eq(staff.role, "admin"))
	if (existingAdmins.length > 0) {
		throw new Error("فيه أدمن متسجل بالفعل على المنصة. اطلب من الأدمن الحالي يفعّل حسابك من لوحة تحكم الموظفين")
	}

	const alreadyStaff = await db.select().from(staff).where(eq(staff.userId, authSession.user.id))
	if (alreadyStaff.length > 0) {
		throw new Error("عندك حساب موظف مسجل بالفعل")
	}

	await db.insert(staff).values({
		userId: authSession.user.id,
		name: authSession.user.name,
		role: "admin",
		branchId: null,
	})

	revalidatePath("/staff")
	revalidatePath("/staff/admin")
}
