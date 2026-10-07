export type Extra = { name: string; quantity: number; unitPrice: number }
export type Product = { name: string; grams: number; price: number; sold: number; extras: Extra[] }
export type Batch = { id: string; name: string; date: string; purchaseKg: number; purchaseCost: number; freight: number; rawKg: number; cleanKg: number; cookedKg: number; wasteKg: number; staffKg: number; extras: Extra[]; oilStart: number; oilAdded: number; oilLeft: number; oilPrice: number; oilBatchWeight: number; oilOtherWeight: number; oilFactor: number; gasCylinderKg: number; gasCylinderCost: number; gasUsedKg: number; gasEstimated: boolean; rent: number; wages: number; utilities: number; otherMonthly: number; operatingDays: number; batchOverheadPercent: number; products: Product[]; note: string }
export const blankBatch = (): Batch => ({id:'',name:'',date:new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Cairo'}).format(new Date()),purchaseKg:0,purchaseCost:0,freight:0,rawKg:0,cleanKg:0,cookedKg:0,wasteKg:0,staffKg:0,extras:[],oilStart:0,oilAdded:0,oilLeft:0,oilPrice:0,oilBatchWeight:0,oilOtherWeight:0,oilFactor:1,gasCylinderKg:0,gasCylinderCost:0,gasUsedKg:0,gasEstimated:true,rent:0,wages:0,utilities:0,otherMonthly:0,operatingDays:30,batchOverheadPercent:0,products:[{name:'ساندوتش',grams:0,price:0,sold:0,extras:[]},{name:'علبة صغيرة',grams:0,price:0,sold:0,extras:[]}],note:''})
const sumExtras=(rows:Extra[])=>rows.reduce((s,r)=>s+r.quantity*r.unitPrice,0)
export function calculate(b:Batch){
 const errors:string[]=[]
 const numeric=['purchaseKg','purchaseCost','freight','rawKg','cleanKg','cookedKg','wasteKg','staffKg','oilStart','oilAdded','oilLeft','oilPrice','oilBatchWeight','oilOtherWeight','oilFactor','gasCylinderKg','gasCylinderCost','gasUsedKg','rent','wages','utilities','otherMonthly','operatingDays','batchOverheadPercent'] as const
 for(const key of numeric)if(!Number.isFinite(b[key])||b[key]<0||b[key]>100000000)errors.push('قيمة غير صحيحة: '+key)
 const checkExtras=(rows:Extra[])=>{for(const row of rows)if(!row.name.trim()||row.name.length>120||!Number.isFinite(row.quantity)||row.quantity<0||row.quantity>100000000||!Number.isFinite(row.unitPrice)||row.unitPrice<0||row.unitPrice>100000000)errors.push('راجع اسم وكميات وأسعار الإضافات')}
 checkExtras(b.extras)
 if(!b.name.trim()||b.name.length>120)errors.push('اكتب اسم الدفعة')
 if(!/^\d{4}-\d{2}-\d{2}$/.test(b.date)||!Number.isFinite(Date.parse(b.date)))errors.push('راجع تاريخ الدفعة')
 if(b.purchaseKg<=0||b.purchaseCost<=0||b.rawKg<=0||b.cleanKg<=0||b.cookedKg<=0)errors.push('وزن العبوة وتكلفتها والخام المستخدم ووزن التنظيف والناتج النهائي يجب أن يكونوا أكبر من صفر')
 if(b.rawKg>b.purchaseKg)errors.push('الخام المستخدم أكبر من كمية العبوة؛ اجمع المشتريات في عبوة مجمعة أو قسمها على دفعات')
 if(b.cleanKg>b.rawKg)errors.push('وزن ما بعد التنظيف لا يتجاوز الخام؛ الزيادة بالمياه تُسجل في الناتج بعد الطبخ')
 if(b.oilLeft>b.oilStart+b.oilAdded)errors.push('الزيت المتبقي أكبر من الزيت المتاح')
 if(b.gasUsedKg>b.gasCylinderKg)errors.push('استهلاك الغاز أكبر من محتوى الأسطوانة؛ سجل إجمالي أسطوانات الدفعة')
 if(b.gasUsedKg>0&&b.gasCylinderKg<=0)errors.push('أدخل صافي وزن الغاز بالأسطوانة')
 if(b.operatingDays<=0||b.operatingDays>31)errors.push('أيام التشغيل الشهرية بين 1 و31')
 if(b.batchOverheadPercent>100)errors.push('نصيب الدفعة من تشغيل اليوم لا يتجاوز 100%')
 const rawUnit=b.purchaseKg>0?(b.purchaseCost+b.freight)/b.purchaseKg:0
 const rawCost=rawUnit*b.rawKg,batchExtras=sumExtras(b.extras)
 const oilUsed=Math.max(0,b.oilStart+b.oilAdded-b.oilLeft),oilWeight=b.oilBatchWeight*b.oilFactor,oilDenominator=oilWeight+b.oilOtherWeight
 if(oilUsed>0&&oilDenominator<=0)errors.push('حدد أوزان توزيع دورة الزيت')
 const cycleOilCost=oilUsed*b.oilPrice,oilCost=oilDenominator>0?cycleOilCost*oilWeight/oilDenominator:0
 const gasCost=b.gasCylinderKg>0?b.gasCylinderCost*b.gasUsedKg/b.gasCylinderKg:0
 const totalDirect=rawCost+batchExtras+oilCost+gasCost,costKg=b.cookedKg>0?totalDirect/b.cookedKg:0
 const monthly=b.rent+b.wages+b.utilities+b.otherMonthly,daily=b.operatingDays>0?monthly/b.operatingDays:0,overhead=daily*b.batchOverheadPercent/100,overheadKg=b.cookedKg>0?overhead/b.cookedKg:0
 let soldKg=0,revenue=0,directSold=0,fullSold=0
 const products=b.products.map(p=>{
  checkExtras(p.extras)
  if(!p.name.trim()||p.name.length>120||!Number.isFinite(p.grams)||p.grams<=0||!Number.isFinite(p.sold)||p.sold<0||!Number.isInteger(p.sold)||!Number.isFinite(p.price)||p.price<0)errors.push('راجع اسم المنتج وحصة الجرام والعدد الصحيح وسعر البيع')
  const kg=p.grams/1000,additions=sumExtras(p.extras),direct=kg*costKg+additions,full=direct+kg*overheadKg
  soldKg+=kg*p.sold;revenue+=p.price*p.sold;directSold+=direct*p.sold;fullSold+=full*p.sold
  return {...p,direct,full,margin:p.price-full,theoretical:p.grams>0?Math.floor(b.cookedKg*1000/p.grams):0}
 })
 const remaining=b.cookedKg-soldKg-b.wasteKg-b.staffKg
 if(remaining < -0.00001)errors.push('المبيعات والهالك وأكل العاملين أكبر من الناتج؛ راجع الحصص والكميات')
 const wasteCost=b.wasteKg*costKg,staffCost=b.staffKg*costKg
 return {errors,rawUnit,rawCost,batchExtras,oilUsed,cycleOilCost,oilCost,gasCost,totalDirect,costKg,monthly,daily,overhead,products,soldKg,revenue,directSold,fullSold,remaining,wasteCost,staffCost,remainingValue:Math.max(0,remaining)*costKg,estimatedMargin:revenue-fullSold-wasteCost-staffCost}
}
