type BootstrapAccount = { name: string; email: string; password: string; role: "admin" | "cashier"; branchCode?: string }
const BOOTSTRAP_ACCOUNTS: BootstrapAccount[] = [
	{ name: "مدير الحبوب", email: "owner@el7bbob.com", password: "Admin@El7bbob2026", role: "admin" },
	{ name: "كاشير الحبوب", email: "cashier@el7bbob.com", password: "Cashier@El7bbob2026", role: "cashier", branchCode: "MAIN" },
]

export async function register() {
	if (process.env.NEXT_RUNTIME !== "nodejs") return
	const { bootstrapDatabase, branches, db, staff, user } = await import("@el7bboB/db")
	const { eq } = await import("drizzle-orm")
	await bootstrapDatabase()
	const { syncCurrentMenu } = await import("./lib/current-menu")
	await syncCurrentMenu()
	const { refineCurrentMenu } = await import("./lib/refine-current-menu")
	await refineCurrentMenu()
	const { syncMortadellaAndPaperGaps } = await import("./lib/menu-additions-mortadella")
	await syncMortadellaAndPaperGaps()
	const { auth } = await import("./lib/auth")
	for (const account of BOOTSTRAP_ACCOUNTS) {
		try {
			let [accountUser] = await db.select().from(user).where(eq(user.email, account.email))
			if (!accountUser) {
				const result = await auth.api.signUpEmail({ body: { name: account.name, email: account.email, password: account.password } })
				const userId = result?.user?.id
				if (!userId) throw new Error(`No user id returned for ${account.email}`)
				;[accountUser] = await db.select().from(user).where(eq(user.id, userId))
			}
			if (!accountUser) throw new Error(`Could not load ${account.email}`)
			const [existingStaff] = await db.select().from(staff).where(eq(staff.userId, accountUser.id))
			let branchId: string | null = null
			if (account.branchCode) {
				const [branch] = await db.select().from(branches).where(eq(branches.code, account.branchCode))
				if (!branch) throw new Error(`Branch ${account.branchCode} was not found`)
				branchId = branch.id
			}
			if (existingStaff) await db.update(staff).set({ name: account.name, role: account.role, branchId }).where(eq(staff.id, existingStaff.id))
			else await db.insert(staff).values({ userId: accountUser.id, name: account.name, role: account.role, branchId })
			console.log(`Bootstrap staff account ready: ${account.email}`)
		} catch (error) { console.error(`Failed to bootstrap staff account ${account.email}`, error) }
	}
}
