"use client"

import { useState, useTransition } from "react"
import { ShieldCheck, Store, Wallet, ChefHat, Trash2, Loader2, UserPlus, Mail, Check } from "lucide-react"
import { assignStaff, updateStaffAssignment, removeStaffAccess } from "./actions"

// Role colours come from the brand palette instead of raw Tailwind hues, so the
// panel matches the rest of the site.
const ROLE_OPTIONS = [
	{
		value: "admin",
		label: "أدمن",
		icon: ShieldCheck,
		tint: "bg-[var(--ink)]/8 text-[var(--ink)]",
	},
	{
		value: "branch_manager",
		label: "مدير نقطة بيع",
		icon: Store,
		tint: "bg-[var(--amber)]/20 text-[var(--amber-deep)]",
	},
	{
		value: "cashier",
		label: "كاشير",
		icon: Wallet,
		tint: "bg-[var(--zaatar)]/15 text-[var(--zaatar)]",
	},
	{
		value: "kitchen",
		label: "مطبخ",
		icon: ChefHat,
		tint: "bg-[var(--terracotta)]/12 text-[var(--terracotta)]",
	},
] as const

type Role = (typeof ROLE_OPTIONS)[number]["value"]

type Branch = { id: string; name: string }
type StaffRow = { id: string; name: string; email: string; role: Role; branchId: string | null }
type PendingRow = { userId: string; name: string; email: string }

function roleMeta(role: Role) {
	return ROLE_OPTIONS.find((option) => option.value === role) ?? ROLE_OPTIONS[2]
}

function Avatar({ name }: { name: string }) {
	return (
		<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--sesame)] text-base font-black text-[var(--amber-deep)]">
			{name.slice(0, 1)}
		</span>
	)
}

function RoleSelect({ role, onChange }: { role: Role; onChange: (role: Role) => void }) {
	return (
		<select
			value={role}
			onChange={(event) => onChange(event.target.value as Role)}
			className="input w-auto py-2 text-sm"
		>
			{ROLE_OPTIONS.map((option) => (
				<option key={option.value} value={option.value}>
					{option.label}
				</option>
			))}
		</select>
	)
}

function BranchSelect({
	branchId,
	branches,
	onChange,
}: {
	branchId: string
	branches: Branch[]
	onChange: (id: string) => void
}) {
	return (
		<select
			value={branchId}
			onChange={(event) => onChange(event.target.value)}
			className="input w-auto py-2 text-sm"
		>
			{branches.map((branch) => (
				<option key={branch.id} value={branch.id}>
					{branch.name}
				</option>
			))}
		</select>
	)
}

export function StaffAdminPanel({
	branches,
	staffRows,
	pendingRows,
}: {
	branches: Branch[]
	staffRows: StaffRow[]
	pendingRows: PendingRow[]
}) {
	return (
		<div className="flex flex-col gap-8">
			{pendingRows.length > 0 ? (
				<section>
					<h2 className="mb-3 flex items-center gap-2 text-lg font-black text-[var(--ink)]">
						<UserPlus className="h-5 w-5 text-[var(--amber-deep)]" /> حسابات مستنية دور
						<span className="num chip bg-[var(--amber)]/18 text-[var(--amber-deep)]">{pendingRows.length}</span>
					</h2>
					<div className="flex flex-col gap-3">
						{pendingRows.map((row) => (
							<PendingRowCard key={row.userId} row={row} branches={branches} />
						))}
					</div>
				</section>
			) : null}

			<section>
				<h2 className="mb-3 flex items-center gap-2 text-lg font-black text-[var(--ink)]">
					<ShieldCheck className="h-5 w-5 text-[var(--amber-deep)]" /> الموظفين الحاليين
					<span className="num chip-outline">{staffRows.length}</span>
				</h2>
				{staffRows.length === 0 ? (
					<p className="rounded-3xl border border-dashed border-[var(--line-strong)] bg-[var(--surface-muted)] p-8 text-center text-sm font-black text-[var(--ink)]/45">
						مفيش موظفين لسه
					</p>
				) : (
					<div className="flex flex-col gap-3">
						{staffRows.map((row) => (
							<StaffRowCard key={row.id} row={row} branches={branches} />
						))}
					</div>
				)}
			</section>
		</div>
	)
}

function PendingRowCard({ row, branches }: { row: PendingRow; branches: Branch[] }) {
	const [role, setRole] = useState<Role>("cashier")
	const [branchId, setBranchId] = useState<string>(branches[0]?.id ?? "")
	const [isPending, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)

	function handleAssign() {
		setError(null)
		startTransition(async () => {
			try {
				await assignStaff({
					userId: row.userId,
					name: row.name,
					role,
					branchId: role === "admin" ? null : branchId,
				})
			} catch (submitError) {
				setError(submitError instanceof Error ? submitError.message : "حصل خطأ")
			}
		})
	}

	return (
		<div className="flex flex-wrap items-center gap-3 rounded-3xl border border-dashed border-[var(--amber)]/60 bg-[var(--surface)] p-4">
			<Avatar name={row.name} />
			<div className="min-w-0 flex-1">
				<p className="truncate font-black text-[var(--ink)]">{row.name}</p>
				<p className="mt-0.5 flex items-center gap-1.5 text-xs font-bold text-[var(--ink)]/50">
					<Mail className="h-3 w-3" /> <span className="truncate" dir="ltr">{row.email}</span>
				</p>
			</div>

			<RoleSelect role={role} onChange={setRole} />
			{role !== "admin" ? <BranchSelect branchId={branchId} branches={branches} onChange={setBranchId} /> : null}

			<button
				type="button"
				disabled={isPending}
				onClick={handleAssign}
				className="btn btn-primary rounded-xl px-4 py-2 text-sm"
			>
				{isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" strokeWidth={3} />}
				تعيين
			</button>

			{error ? <p className="w-full text-xs font-bold text-[var(--terracotta)]">{error}</p> : null}
		</div>
	)
}

function StaffRowCard({ row, branches }: { row: StaffRow; branches: Branch[] }) {
	const [role, setRole] = useState<Role>(row.role)
	const [branchId, setBranchId] = useState<string>(row.branchId ?? branches[0]?.id ?? "")
	const [isPending, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)
	const meta = roleMeta(row.role)
	const RoleIcon = meta.icon

	function handleUpdate() {
		setError(null)
		startTransition(async () => {
			try {
				await updateStaffAssignment({
					staffId: row.id,
					role,
					branchId: role === "admin" ? null : branchId,
				})
			} catch (submitError) {
				setError(submitError instanceof Error ? submitError.message : "حصل خطأ")
			}
		})
	}

	function handleRemove() {
		startTransition(async () => {
			await removeStaffAccess(row.id)
		})
	}

	return (
		<div className="card flex flex-wrap items-center gap-3 p-4">
			<Avatar name={row.name} />
			<div className="min-w-0 flex-1">
				<p className="truncate font-black text-[var(--ink)]">{row.name}</p>
				<p className="mt-0.5 flex items-center gap-1.5 text-xs font-bold text-[var(--ink)]/50">
					<Mail className="h-3 w-3" /> <span className="truncate" dir="ltr">{row.email}</span>
				</p>
			</div>

			<span className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-black ${meta.tint}`}>
				<RoleIcon className="h-3.5 w-3.5" /> {meta.label}
			</span>

			<RoleSelect role={role} onChange={setRole} />
			{role !== "admin" ? <BranchSelect branchId={branchId} branches={branches} onChange={setBranchId} /> : null}

			<button
				type="button"
				disabled={isPending}
				onClick={handleUpdate}
				className="btn btn-primary rounded-xl px-4 py-2 text-sm"
			>
				{isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" strokeWidth={3} />}
				حفظ
			</button>

			<button
				type="button"
				disabled={isPending}
				onClick={handleRemove}
				className="btn rounded-xl border border-[var(--terracotta)]/40 px-3 py-2 text-sm text-[var(--terracotta)] hover:bg-[var(--terracotta)]/10"
			>
				<Trash2 className="h-3.5 w-3.5" /> إلغاء الصلاحية
			</button>

			{error ? <p className="w-full text-xs font-bold text-[var(--terracotta)]">{error}</p> : null}
		</div>
	)
}
