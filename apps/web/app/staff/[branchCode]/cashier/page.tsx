import { asc,eq } from "drizzle-orm"
import { notFound,redirect } from "next/navigation"
import { branches,db,menuItems } from "@el7bboB/db"
import { FALLBACK_IMAGE_BY_SLUG } from "@/app/food-fallbacks"
import { CUSTOM_MIX_SLUG } from "@/app/mix/mix-config"
import { loadStaffOrders } from "@/lib/orders/staff-orders"
import { requireBranchAccess,roleLabel } from "@/lib/staff-session"
import { loadSandwichBreadCatalog } from "@/app/sandwich-bread-store"
import { expandBreadProducts } from "@/app/sandwich-bread"
import { StaffHeader } from "../staff-header"
import { CashierPos,type CashierProduct } from "./cashier-pos"

export const dynamic="force-dynamic"
export default async function CashierPage({params}:{params:Promise<{branchCode:string}>}){const{branchCode}=await params,staffSession=await requireBranchAccess(branchCode);if(staffSession.role==="kitchen")redirect("/staff/forbidden");const[branch]=await db.select().from(branches).where(eq(branches.code,branchCode));if(!branch)notFound();const[rows,branchOrders]=await Promise.all([db.select().from(menuItems).where(eq(menuItems.isAvailable,true)).orderBy(asc(menuItems.category),asc(menuItems.sortOrder),asc(menuItems.nameAr)),loadStaffOrders({branchId:branch.id,channels:["in_store","cart_kiosk","online_pickup","online_delivery"],statuses:["pending_payment","queued","in_progress","ready","completed"]})]);const breadCatalog=await loadSandwichBreadCatalog();const products:CashierProduct[]=expandBreadProducts(rows,breadCatalog.products,breadCatalog.configs).filter((item)=>item.slug!==CUSTOM_MIX_SLUG&&Number.isFinite(Number(item.priceEGP))&&Number(item.priceEGP)>0).map((item)=>({id:item.id,nameAr:item.nameAr,category:item.category,priceEGP:Number(item.priceEGP),image:item.photoDataUrl??FALLBACK_IMAGE_BY_SLUG[rows.find(parent=>parent.id===item.breadParentId)?.slug??item.slug]??null}));const openOrders=branchOrders.filter((order)=>order.status!=="completed"||order.paymentStatus!=="confirmed");return <main className="mx-auto max-w-[1760px] px-3 py-4 sm:px-5 lg:px-7"><StaffHeader name={staffSession.name} roleText={roleLabel(staffSession.role)}/><CashierPos branchCode={branch.code} branchName={branch.name} products={products} recentOrders={[...openOrders].reverse()}/></main>}
