"use client"

import { useState, useTransition } from "react"
import { Store, MapPin, Power, Pencil, Plus, Loader2, X, Check, UtensilsCrossed } from "lucide-react"
import { createBranch, updateBranch, toggleBranchActive, type BranchInput } from "./actions"

// The stored enum value stays "cart" for the database, but nothing user-facing
// says "عربية" any more — every selling spot is a نقطة بيع.
const TYPE_OPTIONS = [
	{ value: "restaurant", label: "المحل الرئيسي", icon: UtensilsCrossed },
	{ value: "cart", label: "نقطة بيع", icon: Store },
] as const

type BranchTypeOption = (typeof TYPE_OPTIONS)[number]["value"]

type Branch = {
	id: string
	code: string
	name: string
	type: BranchTypeOption
	address: string | null
	isActive: boolean
}

const EMPTY_FORM: BranchInput = {
	code: "",
	name: "",
	type: "cart",
	address: "",
}

function typeIcon(type: BranchTypeOption) {
	return TYPE_OPTIONS.find((option) => option.value === type)?.icon ?? Store
}

function typeLabel(type: BranchTypeOption) {
	return TYPE_OPTIONS.find((option) => option.value === type)?.label ?? "نقطة بيع"
}

export function BranchesAdminPanel({ branches }: { branches: Branch[] }) {
	const restaurantCount = branches.filter((b) => b.type === "restaurant").length
	const cartCount = branches.filter((b) => b.type === "cart").length
	const activeCount = branches.filter((b) => b.isActive).length

	return (
		<div className="flex flex-col gap-6">
			<div className="card flex items-center gap-3 p-5">
				<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--sesame)] text-[var(--amber-deep)]">
					<Store className="h-5 w-5" />
				</span>
				<div>
					<h1 className="text-2xl font-black text-[var(--ink)]">المحل ونقاط البيع</h1>
					<p className="mt-0.5 text-sm font-bold text-[var(--ink)]/50">
						كل نقطة بيع ليها كود ولينك و QR خاص بيها
					</p>
				</div>
			</div>

			<div className="grid gap-3 sm:grid-cols-3">
				<StatCard icon={UtensilsCrossed} label="محل رئيسي" value={restaurantCount} />
				<StatCard icon={Store} label="نقاط بيع" value={cartCount} />
				<StatCard icon={Power} label="شغالة دلوقتي" value={activeCount} tint="text-[var(--zaatar)]" />
			</div>

			<NewBranchForm />

			<section>
				<h2 className="mb-3 flex items-center gap-2 text-lg font-black text-[var(--ink)]">
					كل النقاط
					<span className="num chip-outline">{branches.length}</span>
				</h2>
				{branches.length === 0 ? (
					<div className="rounded-3xl border border-dashed border-[var(--line-strong)] bg-[var(--surface-muted)] p-8 text-center text-sm font-black text-[var(--ink)]/45">
						مفيش نقاط بيع لسه — ضيف أول نقطة من فوق
					</div>
				) : (
					<div className="grid items-start gap-3 sm:grid-cols-2">
						{branches.map((branch) => (
							<BranchRow key={branch.id} branch={branch} />
						))}
					</div>
				)}
			</section>
		</div>
	)
}

function StatCard({
	icon: Icon,
	label,
	value,
	tint = "text-[var(--amber-deep)]",
}: {
	icon: typeof Store
	label: string
	value: number
	tint?: string
}) {
	return (
		<div className="card flex items-center gap-3 p-4">
			<span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--sesame)] ${tint}`}>
				<Icon className="h-5 w-5" />
			</span>
			<div>
				<p className="num text-2xl font-black text-[var(--ink)]">{value}</p>
				<p className="text-xs font-bold text-[var(--ink)]/50">{label}</p>
			</div>
		</div>
	)
}

function NewBranchForm() {
	const [form, setForm] = useState<BranchInput>(EMPTY_FORM)
	const [isPending, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)

	function handleCreate() {
		setError(null)
		startTransition(async () => {
			try {
				await createBranch(form)
				setForm(EMPTY_FORM)
			} catch (submitError) {
				setError(submitError instanceof Error ? submitError.message : "حصل خطأ")
			}
		})
	}

	return (
		<section className="rounded-3xl border border-dashed border-[var(--line-strong)] bg-[var(--surface-muted)] p-5">
			<h2 className="mb-1 flex items-center gap-2 text-lg font-black text-[var(--ink)]">
				<Plus className="h-5 w-5 text-[var(--amber-deep)]" strokeWidth={3} /> إضافة نقطة بيع جديدة
			</h2>
			<p className="mb-4 text-xs font-bold text-[var(--ink)]/45">
				أول ما تضيفها هتلاقي لينكها والـ QR بتاعها جاهزين في صفحة لينكات وأكواد QR
			</p>
			<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<input
					value={form.code}
					onChange={(event) => setForm({ ...form, code: event.target.value })}
					placeholder="كود النقطة، مثال: POS-01"
					className="input"
				/>
				<input
					value={form.name}
					onChange={(event) => setForm({ ...form, name: event.target.value })}
					placeholder="اسم النقطة"
					className="input"
				/>
				<select
					value={form.type}
					onChange={(event) => setForm({ ...form, type: event.target.value as BranchTypeOption })}
					className="input"
				>
					{TYPE_OPTIONS.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
				<input
					value={form.address}
					onChange={(event) => setForm({ ...form, address: event.target.value })}
					placeholder="العنوان (اختياري)"
					className="input"
				/>
			</div>

			<button
				type="button"
				disabled={isPending || !form.code || !form.name}
				onClick={handleCreate}
				className="btn btn-primary mt-4 rounded-xl px-4 py-2.5 text-sm"
			>
				{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" strokeWidth={3} />}
				إضافة
			</button>

			{error ? <p className="mt-2 text-xs font-bold text-[var(--terracotta)]">{error}</p> : null}
		</section>
	)
}

function BranchRow({ branch }: { branch: Branch }) {
	const [isEditing, setIsEditing] = useState(false)
	const [form, setForm] = useState<BranchInput>({
		code: branch.code,
		name: branch.name,
		type: branch.type,
		address: branch.address ?? "",
	})
	const [isPending, startTransition] = useTransition()
	const [error, setError] = useState<string | null>(null)
	const Icon = typeIcon(branch.type)

	function handleSave() {
		setError(null)
		startTransition(async () => {
			try {
				await updateBranch(branch.id, form)
				setIsEditing(false)
			} catch (submitError) {
				setError(submitError instanceof Error ? submitError.message : "حصل خطأ")
			}
		})
	}

	function handleToggle() {
		startTransition(async () => {
			await toggleBranchActive(branch.id, !branch.isActive)
		})
	}

	if (isEditing) {
		return (
			<div className="card border-[var(--amber)] p-4 sm:col-span-2">
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					<input
						value={form.code}
						onChange={(event) => setForm({ ...form, code: event.target.value })}
						className="input"
					/>
					<input
						value={form.name}
						onChange={(event) => setForm({ ...form, name: event.target.value })}
						className="input"
					/>
					<select
						value={form.type}
						onChange={(event) => setForm({ ...form, type: event.target.value as BranchTypeOption })}
						className="input"
					>
						{TYPE_OPTIONS.map((option) => (
							<option key={option.value} value={option.value}>
								{option.label}
							</option>
						))}
					</select>
					<input
						value={form.address}
						onChange={(event) => setForm({ ...form, address: event.target.value })}
						className="input"
					/>
				</div>
				<div className="mt-3 flex gap-2">
					<button
						type="button"
						disabled={isPending}
						onClick={handleSave}
						className="btn btn-primary rounded-xl px-3 py-2 text-sm"
					>
						{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" strokeWidth={3} />}
						حفظ
					</button>
					<button
						type="button"
						disabled={isPending}
						onClick={() => setIsEditing(false)}
						className="btn btn-outline rounded-xl px-3 py-2 text-sm"
					>
						<X className="h-3.5 w-3.5" strokeWidth={3} /> إلغاء
					</button>
				</div>
				{error ? <p className="mt-2 text-xs font-bold text-[var(--terracotta)]">{error}</p> : null}
			</div>
		)
	}

	return (
		<div className="card card-lift flex flex-wrap items-center gap-3 p-4">
			<span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--sesame)] text-[var(--amber-deep)]">
				<Icon className="h-5 w-5" />
			</span>
			<div className="min-w-0 flex-1">
				<p className="truncate font-black text-[var(--ink)]">
					{branch.name} <span className="num text-sm font-bold text-[var(--ink)]/35">({branch.code})</span>
				</p>
				<p className="mt-0.5 flex items-center gap-1.5 text-xs font-bold text-[var(--ink)]/50">
					{typeLabel(branch.type)}
					{branch.address ? (
						<>
							<span className="text-[var(--ink)]/25">·</span>
							<MapPin className="h-3 w-3" />
							<span className="truncate">{branch.address}</span>
						</>
					) : null}
				</p>
			</div>

			<span
				className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-black ${
					branch.isActive
						? "bg-[var(--zaatar)]/15 text-[var(--zaatar)]"
						: "bg-[var(--terracotta)]/12 text-[var(--terracotta)]"
				}`}
			>
				{branch.isActive ? "شغال" : "متوقف"}
			</span>

			<div className="flex gap-2">
				<button
					type="button"
					disabled={isPending}
					onClick={handleToggle}
					className="btn btn-outline rounded-xl px-2.5 py-2 text-xs"
				>
					<Power className="h-3.5 w-3.5" /> {branch.isActive ? "إيقاف" : "تشغيل"}
				</button>
				<button
					type="button"
					disabled={isPending}
					onClick={() => setIsEditing(true)}
					className="btn btn-primary rounded-xl px-2.5 py-2 text-xs"
				>
					<Pencil className="h-3.5 w-3.5" /> تعديل
				</button>
			</div>
		</div>
	)
}
