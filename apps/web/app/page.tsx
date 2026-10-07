import { redirect } from "next/navigation"

// المنصة كلها تعيش على /wasl/index.html كملف ثابت —
// الرابط الرئيسي يحوّل مباشرة عليها.
export default function Home() {
	redirect("/wasl/index.html")
}
