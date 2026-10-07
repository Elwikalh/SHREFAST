"use server"

import { revalidatePath } from "next/cache"
import { eq,inArray } from "drizzle-orm"
import { z } from "zod"
import { allocateOrderNumber,branches,db,menuItems,orderItems,orders,payments,staff } from "@el7bboB/db"
import { computeLineTotal } from "@el7bboB/core"
import { deductBranchStockForOrder } from "@/lib/orders/inventory"
import { requireBranchAccess } from "@/lib/staff-session"
import { loadSandwichBreadCatalog } from "@/app/sandwich-bread-store"
import { resolveBreadSale } from "@/app/sandwich-bread"

const cashierOrderSchema=z.object({branchCode:z.string().trim().min(1),paymentMethod:z.enum(["cash","instapay"]),customerName:z.string().trim().max(80).optional(),orderNote:z.string().trim().max(200).optional(),lines:z.array(z.object({menuItemId:z.string().uuid(),quantity:z.number().int().min(1).max(50)})).min(1,"أضف صنفًا واحدًا على الأقل.").max(100)})
export type CashierOrderInput=z.infer<typeof cashierOrderSchema>
export type CashierReceipt={orderId:string;displayNumber:string;branchName:string;createdAt:string;paymentMethod:"cash"|"instapay";customerName:string|null;totalEGP:number;lines:Array<{nameAr:string;quantity:number;unitPriceEGP:number;lineTotalEGP:number}>}
export async function createCashierOrder(input:CashierOrderInput):Promise<CashierReceipt>{
	const parsed=cashierOrderSchema.parse(input),staffSession=await requireBranchAccess(parsed.branchCode);if(staffSession.role==="kitchen")throw new Error("شاشة الكاشير غير متاحة لحساب المطبخ.")
	const[branch]=await db.select().from(branches).where(eq(branches.code,parsed.branchCode));if(!branch?.isActive)throw new Error("نقطة البيع غير متاحة.")
	const ids=Array.from(new Set(parsed.lines.map((line)=>line.menuItemId))),products=await db.select().from(menuItems).where(inArray(menuItems.id,ids)),productById=new Map(products.map((item)=>[item.id,item]));let totalEGP=0
	const breadCatalog=await loadSandwichBreadCatalog(),sales=new Map(parsed.lines.map(line=>[line.menuItemId,resolveBreadSale(line.menuItemId,breadCatalog.products,breadCatalog.configs)]))
	const receiptLines=parsed.lines.map((line)=>{const product={...productById.get(line.menuItemId),...sales.get(line.menuItemId)!.product};if(!product?.isAvailable)throw new Error("أحد الأصناف غير متاح. يرجى تحديث القائمة.");const unitPriceEGP=Number(product.priceEGP);if(!Number.isFinite(unitPriceEGP)||unitPriceEGP<=0)throw new Error(`سعر ${product.nameAr} غير صالح.`);const lineTotalEGP=computeLineTotal({unitPriceEGP,quantity:line.quantity,addonsEGP:[]});totalEGP+=lineTotalEGP;return{menuItemId:product.id,nameAr:product.nameAr,quantity:line.quantity,unitPriceEGP,lineTotalEGP}})
	if(!Number.isFinite(totalEGP)||totalEGP<=0)throw new Error("إجمالي الفاتورة غير صالح.")
	const[cashier]=await db.select().from(staff).where(eq(staff.userId,staffSession.userId)),displayNumber=await allocateOrderNumber(branch.id,branch.code),now=new Date(),channel=branch.type==="cart"?"cart_kiosk":"in_store"
	const order=await db.transaction(async(tx)=>{const[created]=await tx.insert(orders).values({branchId:branch.id,displayNumber,channel,status:"queued",subtotalEGP:String(totalEGP),deliveryFeeEGP:"0",totalEGP:String(totalEGP),customerName:parsed.customerName||null,customerNote:parsed.orderNote||null,cashierStaffId:cashier?.id??null}).returning();if(!created)throw new Error("تعذر إنشاء الفاتورة.");await tx.insert(orderItems).values(receiptLines.map((line)=>({orderId:created.id,menuItemId:line.menuItemId,quantity:line.quantity,unitPriceEGP:String(line.unitPriceEGP),addonsJson:[],lineTotalEGP:String(line.lineTotalEGP)})));await tx.insert(payments).values({orderId:created.id,method:parsed.paymentMethod,status:"confirmed",amountEGP:String(totalEGP),confirmedByStaffId:cashier?.id??null,confirmedAt:now});return created})
	try{await deductBranchStockForOrder(branch.id,parsed.lines.map(line=>({...line,menuItemId:sales.get(line.menuItemId)!.parent.id})))}catch(error){console.error(`Inventory deduction failed for cashier order ${order.id}`,error)}
	revalidatePath(`/staff/${branch.code}`);revalidatePath(`/staff/${branch.code}/cashier`);revalidatePath(`/staff/${branch.code}/kitchen`)
	return{orderId:order.id,displayNumber,branchName:branch.name,createdAt:now.toISOString(),paymentMethod:parsed.paymentMethod,customerName:parsed.customerName||null,totalEGP,lines:receiptLines.map(({nameAr,quantity,unitPriceEGP,lineTotalEGP})=>({nameAr,quantity,unitPriceEGP,lineTotalEGP}))}
}
