import { redirect } from "next/navigation"

// وصل platform lives at /wasl/index.html as a static file.
// Make the short URLs /wasl and /wasl/ land on the exact static path.
export default function WaslRedirectPage() {
	redirect("/wasl/index.html")
}
