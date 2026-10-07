"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { ensureStaffBootstrap } from "../actions"

export function SignupForm() {
	const router = useRouter()

	const [name, setName] = useState("")
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [showPassword, setShowPassword] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [isSubmitting, setIsSubmitting] = useState(false)

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault()
		setError(null)
		setIsSubmitting(true)

		const { error: signUpError } = await authClient.signUp.email({ name, email, password })

		if (signUpError) {
			setIsSubmitting(false)
			setError("مقدرناش نعمل الحساب، ربما الإيميل مستخدم قبل كدة")
			return
		}

		const { promoted } = await ensureStaffBootstrap()
		setIsSubmitting(false)

		if (promoted) {
			router.push("/staff")
		} else {
			router.push("/staff/pending")
		}
		router.refresh()
	}

	return (
		<form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
			<div className="flex flex-col gap-1.5">
				<label htmlFor="name" className="text-sm font-semibold">
					الاسم
				</label>
				<div className="relative">
					<User className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink)]/35" />
					<input
						id="name"
						type="text"
						required
						autoComplete="name"
						value={name}
						onChange={(event) => setName(event.target.value)}
						className="w-full rounded-xl border border-[var(--ink)]/15 py-2.5 pe-3 ps-9 outline-none transition focus:border-[var(--amber)]"
					/>
				</div>
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="email" className="text-sm font-semibold">
					الإيميل
				</label>
				<div className="relative">
					<Mail className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink)]/35" />
					<input
						id="email"
						type="email"
						required
						autoComplete="email"
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						className="w-full rounded-xl border border-[var(--ink)]/15 py-2.5 pe-3 ps-9 outline-none transition focus:border-[var(--amber)]"
					/>
				</div>
			</div>

			<div className="flex flex-col gap-1.5">
				<label htmlFor="password" className="text-sm font-semibold">
					كلمة السر
				</label>
				<div className="relative">
					<Lock className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink)]/35" />
					<input
						id="password"
						type={showPassword ? "text" : "password"}
						required
						minLength={8}
						autoComplete="new-password"
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						className="w-full rounded-xl border border-[var(--ink)]/15 py-2.5 pe-3 ps-9 outline-none transition focus:border-[var(--amber)]"
					/>
					<button
						type="button"
						onClick={() => setShowPassword((v) => !v)}
						className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink)]/35 transition hover:text-[var(--ink)]/70"
						tabIndex={-1}
					>
						{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
					</button>
				</div>
				<p className="text-xs text-[var(--ink)]/40">٨ حروف على الأقل</p>
			</div>

			{error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500">{error}</p> : null}

			<button
				type="submit"
				disabled={isSubmitting}
				className="flex items-center justify-center gap-2 rounded-xl bg-[var(--amber)] px-4 py-2.5 font-bold text-[var(--ink)] transition active:scale-[0.98] disabled:opacity-50"
			>
				{isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
				{isSubmitting ? "جاري الإنشاء..." : "اعمل حساب"}
			</button>
		</form>
	)
}
