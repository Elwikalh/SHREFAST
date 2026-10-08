import AuthForm from "@/components/site/auth-form";
import type { Principal } from "@/lib/wasl-auth";
export const metadata = { title: "تسجيل الدخول — SHARE FAST" };
export default async function Login({
	searchParams,
}: {
	searchParams: Promise<{ role?: string; intent?: string }>;
}) {
	const { role, intent } = await searchParams;
	return (
		<AuthForm
			mode="login"
            requestIntent={intent === "request"}
			initialRole={
				["merchant", "company", "courier", "admin"].includes(role || "")
					? (role as Principal["role"])
					: "merchant"
			}
		/>
	);
}
