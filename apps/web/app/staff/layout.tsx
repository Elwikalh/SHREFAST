import type { Metadata } from "next"
import type { ReactNode } from "react"
// Staff pages install as their own app ("شاشة شغلي") opening straight onto the
// operations board instead of the customer storefront.
export const metadata:Metadata={manifest:"/staff/manifest.webmanifest",robots:{index:false,follow:false,noarchive:true,nocache:true}}
export default function StaffLayout({children}:{children:ReactNode}){return children}
