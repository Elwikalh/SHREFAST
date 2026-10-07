import Landing from "@/components/site/landing";
import type { Metadata } from "next";
export const metadata: Metadata = {
	title: "Super X — كل طلب في الاتجاه الصحيح",
	description:
		"مساحة عربية واحدة لإدارة طلبات التوصيل والأنشطة التجارية وشركات التوصيل والمناديب. ابدأ بحساب مناسب لدورك.",
};
export default function Home() {
	return <Landing />;
}
