"use client";
import OwnedPolicyBanner from "./owned-policy-banner";
import DispatchQueuePanel from "./dispatch-queue-panel";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, LoaderCircle, LogOut, RotateCcw } from "lucide-react";
import type { Principal } from "@/lib/wasl-auth";
import { apiFetch } from "@/lib/wasl-api";
import QuickRequest from "./quick-request";
import PreparationAlerts from "./preparation-alerts";
const Portal = dynamic(() => import("./portal"), {
	ssr: false,
	loading: () => (
		<main className="portal-loading" role="status">
			<LoaderCircle className="spin" aria-hidden="true" /> جارٍ تحميل بوابة
			حسابك...
		</main>
	),
});
export default function WaslClient({ quickRequest = false }: { quickRequest?: boolean }) {
	const router = useRouter();
	const [user, setUser] = useState<Principal | null>(null),
		[error, setError] = useState(false),
		[retry, setRetry] = useState(0);
	useEffect(() => {
		const controller = new AbortController();
		apiFetch("/api/wasl/auth/me", { signal: controller.signal })
			.then(async (response) => {
				if (response.status === 401) {
					router.replace(quickRequest ? "/login?role=merchant&intent=request" : "/login");
					return;
				}
				if (!response.ok) throw new Error("unavailable");
				const data = await response.json();
				if (!data.user) throw new Error("unavailable");
				// Legacy presentation state contains no session secret; server authorization remains authoritative.
				try {
					if (data.user.role === "courier")
						localStorage.setItem(
							"wasl_courier_acct",
							JSON.stringify(data.user),
						);
				} catch {}
				setUser(data.user);
			})
			.catch(() => {
				if (!controller.signal.aborted) setError(true);
			});
		return () => controller.abort();
	}, [retry, router, quickRequest]);
	async function logout() {
		try {
			const response = await apiFetch("/api/wasl/auth/logout", {
				method: "POST",
			});
			if (!response.ok) throw new Error("logout");
			try {
				localStorage.removeItem("wasl_courier_acct");
			} catch {}
			router.replace("/login");
		} catch {
			setError(true);
		}
	}
	if (error)
		return (
			<main className="portal-loading" role="alert">
				<AlertCircle aria-hidden="true" />
				<div>تعذر الاتصال بحسابك. بياناتك لم تُحذف.</div>
				<button
					className="btn btn-o"
					onClick={() => {
						setError(false);
						setRetry((x) => x + 1);
					}}
				>
					<RotateCcw size={16} /> إعادة المحاولة
				</button>
			</main>
		);
	if (!user)
		return (
			<main className="portal-loading" role="status">
				<LoaderCircle className="spin" aria-hidden="true" /> جارٍ التحقق من جلسة
				الدخول...
			</main>
		);

 if (quickRequest) return user.role === "merchant" ? <><OwnedPolicyBanner key={user.id} accountId={user.id} /><QuickRequest principal={user} /></> : <main className="portal-loading"><div>طلب مندوب متاح من حساب مطعم أو نشاط تجاري.</div><Link href="/wasl">العودة إلى لوحة حسابك</Link></main>;
	return (
		<>
			<div className="account-session-bar">
				<span>
					<b>{user.name}</b>{" "}
					<small>
						{user.phoneVerified
							? "رقم الهاتف موثّق"
							: "رقم الهاتف غير موثّق"}
					</small>
				</span>
				<Link className="account-install-link" href={`/app?role=${user.role === "admin" ? "merchant" : user.role}`}>تثبيت التطبيق</Link>
                <button onClick={logout}>
					<LogOut size={16} aria-hidden="true" /> تسجيل الخروج
				</button>
			</div>
			{["admin", "company"].includes(user.role) && (
				<div className="portal-review-notice" role="note">
					بعض التقارير تحتوي بيانات توضيحية ولا تصلح للحسابات المالية. الطلبات المرتبطة بحسابك تُحمّل من الخادم.
				</div>
			)}
			{user.role === "courier" && <PreparationAlerts accountId={user.id} />}
			{user.role === "admin" && <Link href="/wasl/delivery-pricing">إعدادات تسعيرة التوصيل</Link>}
			{user.role === "merchant" && <OwnedPolicyBanner key={user.id} accountId={user.id} />}
			{["admin","merchant","company"].includes(user.role) && <DispatchQueuePanel key={user.id} accountId={user.id} />}
			{user.role === "admin" && <Link href="/wasl/owned-restaurants">سياسة الحبوب والفروع الموثقة</Link>}
			<Portal principal={user} />
		</>
	);
}
