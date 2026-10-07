import type { Metadata } from "next"
import { loadOwnerData, requireOwner } from "./actions"
import { OwnerPanel } from "./owner-panel"
export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "مساحة المالك | الحَبّوب", robots: { index: false, follow: false } }
export default async function OwnerPage() {
 const owner = await requireOwner()
 const initial = await loadOwnerData()
 return <OwnerPanel initial={initial} name={owner.name}/>
}
