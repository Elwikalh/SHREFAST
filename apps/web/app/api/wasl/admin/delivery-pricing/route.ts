import { authorizeWasl } from "@/lib/wasl-access";
import { readLimitedBody } from "@/lib/sharefast-protocol";
import { loadDeliveryPricing,saveDeliveryPricing,previewDeliveryQuote,pricingDestinations } from "@/lib/delivery-pricing-settings";
import { WASL_ZONES } from "@/lib/wasl-store";
export const dynamic="force-dynamic";
const reply=(body:unknown,status=200)=>Response.json(body,{status,headers:{"Cache-Control":"no-store"}});
export async function GET(request:Request){
 const user=await authorizeWasl(request,"admin/control");if(user instanceof Response)return user;if(user.role!=="admin")return reply({ok:false,error:"forbidden"},403);
 try{const current=await loadDeliveryPricing();const fromZone=new URL(request.url).searchParams.get("fromZone")||"المنصورة";const previews=pricingDestinations(fromZone).map(zone=>previewDeliveryQuote(current.settings,fromZone,zone));return reply({ok:true,...current,fromZone,pickupZones:Object.keys(WASL_ZONES),previews,activation:"draft-preview-only"});}catch(e){return reply({ok:false,error:e instanceof Error&&e.message==="unsupported_zone"?"unsupported_zone":"storage_unavailable"},e instanceof Error&&e.message==="unsupported_zone"?400:503);}
}
export async function POST(request:Request){
 const user=await authorizeWasl(request,"admin/control");if(user instanceof Response)return user;if(user.role!=="admin")return reply({ok:false,error:"forbidden"},403);
 try{const body=JSON.parse(await readLimitedBody(request));if(!body||typeof body!=="object"||Array.isArray(body)||Object.keys(body).sort().join(",")!=="expectedVersion,settings")return reply({ok:false,error:"invalid_pricing"},400);return reply({ok:true,...await saveDeliveryPricing(body.settings,body.expectedVersion,user.id)});}catch(e){const code=e instanceof Error?e.message:"";return reply({ok:false,error:code==="settings_changed_reload"?code:["invalid_pricing","body_too_large"].includes(code)||e instanceof SyntaxError?"invalid_pricing":"storage_unavailable"},code==="settings_changed_reload"?409:["invalid_pricing","body_too_large"].includes(code)||e instanceof SyntaxError?400:503);}
}
