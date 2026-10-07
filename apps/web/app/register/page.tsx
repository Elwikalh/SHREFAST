import AuthForm from "@/components/site/auth-form";
import { accountRoles, type AccountRole } from "@/lib/wasl-auth-schema";
export const metadata = { title: "إنشاء حساب — SHARE FAST" };
export default async function Register({
	searchParams,
}: {
	searchParams: Promise<{ role?: string }>;
}) {
	const { role } = await searchParams;
	return (
		<AuthForm
			mode="register"
			initialRole={
				accountRoles.includes(role as AccountRole)
					? (role as AccountRole)
					: "merchant"
			}
		/>
	);
}
