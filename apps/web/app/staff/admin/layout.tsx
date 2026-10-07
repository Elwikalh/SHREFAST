import type { Metadata } from "next"
import type { ReactNode } from "react"
import { requireAdmin,roleLabel } from "@/lib/staff-session"
import { AdminShell } from "./admin-shell"

export const dynamic="force-dynamic"
export const metadata:Metadata={title:"لوحة الإدارة",robots:{index:false,follow:false,noarchive:true,nocache:true}}
export default async function AdminLayout({children}:{children:ReactNode}){const session=await requireAdmin();return <AdminShell staffName={session.name} staffEmail={session.email} staffRole={roleLabel(session.role)}>{children}</AdminShell>}
