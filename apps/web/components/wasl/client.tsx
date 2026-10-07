"use client";
import dynamic from "next/dynamic";
import { LoaderCircle } from "lucide-react";
const Portal = dynamic(() => import("./portal"), {
	ssr: false,
	loading: () => (
		<main className="portal-loading" role="status">
			<LoaderCircle className="spin" aria-hidden="true" /> جارٍ تحميل منصة
			التوصيل...
		</main>
	),
});
export default function WaslClient() {
	return <Portal />;
}
