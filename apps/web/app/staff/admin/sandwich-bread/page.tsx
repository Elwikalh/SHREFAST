import { requireAdmin } from "@/lib/staff-session"
import { loadSandwichBreadCatalog } from "@/app/sandwich-bread-store"
import { sandwichBreadEligible } from "@/app/sandwich-bread"
import { SandwichBreadPanel, type BreadEditProduct } from "./sandwich-bread-panel"
export const dynamic = "force-dynamic"
export default async function SandwichBreadPage() {
 await requireAdmin()
 const { products, configs } = await loadSandwichBreadCatalog(), byId = new Map(products.map(p => [p.id, p]))
 const rows: BreadEditProduct[] = products.filter(sandwichBreadEligible).map(p => ({ id: p.id, nameAr: p.nameAr, available: p.isAvailable, enabled: configs[p.id]?.enabled ?? false, variants: (configs[p.id]?.variants ?? []).map(v => ({ ...v, priceEGP: String(byId.get(v.id)?.priceEGP ?? "") })) }))
 return <main dir="rtl" className="mx-auto max-w-4xl space-y-5"><header className="card p-5"><h1 className="text-2xl font-black">عيش الساندوتشات وأسعاره</h1><p className="mt-2 text-sm">حدد لكل صنف البلدي أو الفينو أو الاتنين. السعر سعر الساندوتش كامل، وليس سعر العيش الإضافي.</p></header><SandwichBreadPanel products={rows}/></main>
}
