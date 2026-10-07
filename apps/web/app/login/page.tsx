import AuthForm from "@/components/site/auth-form";
import type { Principal } from "@/lib/wasl-auth";
export const metadata = { title: "تسجيل الدخول — Super X" };
export default async function Login({
	searchParams,
}: {
	searchParams: Promise<{ role?: string }>;
}) {
	const { role } = await searchParams;
	return (
		<AuthForm
			mode="login"
			initialRole={
				["merchant", "company", "courier", "admin"].includes(role || "")
					? (role as Principal["role"])
					: "merchant"
			}
		/>
	);
}
