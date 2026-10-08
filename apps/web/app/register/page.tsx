import { redirect } from "next/navigation";
import AuthForm from "@/components/site/auth-form";
import { accountRoles, type AccountRole } from "@/lib/wasl-auth-schema";
export const metadata = { title: "إنشاء حساب — SHARE FAST" };
export default async function Register({
	searchParams,
}: {
	searchParams: Promise<{ role?: string; app?: string; intent?: string }>;
}) {
	const { role, app, intent } = await searchParams;
 if (role === "courier" && app !== "1") redirect("/app?role=courier");
	return (
		<AuthForm
			key={`${role || "choose"}-${app || "web"}`}
            mode="register"
            requestIntent={intent === "request"}
            skipRoleSelection={accountRoles.includes(role as AccountRole)}
			initialRole={
				accountRoles.includes(role as AccountRole)
					? (role as AccountRole)
					: "merchant"
			}
		/>
	);
}
