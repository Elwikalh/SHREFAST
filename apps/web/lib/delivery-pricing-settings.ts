import {MANSOURA_AREA_DEFAULTS} from "./mansoura-pricing-areas";
import { sql } from "drizzle-orm";
import { db } from "@el7bboB/db";
import { WASL_ZONES } from "./wasl-store";
const rows=<T>(r:unknown):T[]=>Array.isArray(r)?r as T[]:(r as {rows?:T[]}).rows||[];
export type DeliveryPricingSettings={baseEGP:number;perKmEGP:number;minimumEGP:number;roadFactor:number;roundStepEGP:number;mansouraLocal:{minimumEGP:number;maximumEGP:number};zoneOverrides:Record<string,number>};
export const DEFAULT_DELIVERY_PRICING:DeliveryPricingSettings={baseEGP:15,perKmEGP:2.5,minimumEGP:25,roadFactor:1.3,roundStepEGP:5,mansouraLocal:{minimumEGP:15,maximumEGP:30},zoneOverrides:{}};
const bounded=(x:unknown,lo:number,hi:number)=>typeof x==="number"&&Number.isFinite(x)&&x>=lo&&x<=hi;
export function parseDeliveryPricing(value:unknown):DeliveryPricingSettings {
 if(!value||typeof value!=="object"||Array.isArray(value))throw Error("invalid_pricing");const v=value as Record<string,unknown>;
 if(Object.keys(v).some(k=>!["baseEGP","minimumEGP","perKmEGP","roadFactor","roundStepEGP","zoneOverrides","mansouraLocal"].includes(k))||!bounded(v.baseEGP,0,1000)||!bounded(v.perKmEGP,0,100)||!bounded(v.minimumEGP,0,1000)||!Number.isSafeInteger(v.minimumEGP)||!bounded(v.roadFactor,1,3)||![1,5,10].includes(v.roundStepEGP as number)||!v.zoneOverrides||typeof v.zoneOverrides!=="object"||Array.isArray(v.zoneOverrides))throw Error("invalid_pricing");
 const local=(v.mansouraLocal===undefined?{minimumEGP:15,maximumEGP:30}:v.mansouraLocal) as Record<string,unknown>;
 if(!local||typeof local!=="object"||Array.isArray(local)||Object.keys(local).sort().join(",")!=="maximumEGP,minimumEGP"||!Number.isSafeInteger(local.minimumEGP)||!Number.isSafeInteger(local.maximumEGP)||!bounded(local.minimumEGP,0,1000)||!bounded(local.maximumEGP,0,1000)||(local.minimumEGP as number)>(local.maximumEGP as number))throw Error("invalid_pricing");
 for(const [pair,fee]of Object.entries(v.zoneOverrides)){const zones=pair.split("|");if(zones.length!==2||zones[0]===undefined||zones[1]===undefined||!Object.hasOwn(WASL_ZONES,zones[0])||(!Object.hasOwn(WASL_ZONES,zones[1])&&!(zones[0]==="المنصورة"&&Object.hasOwn(MANSOURA_AREA_DEFAULTS,zones[1])))||!Number.isSafeInteger(fee)||!bounded(fee,0,1000))throw Error("invalid_pricing");}
 return {baseEGP:v.baseEGP as number,perKmEGP:v.perKmEGP as number,minimumEGP:v.minimumEGP as number,roadFactor:v.roadFactor as number,roundStepEGP:v.roundStepEGP as number,mansouraLocal:{minimumEGP:local.minimumEGP as number,maximumEGP:local.maximumEGP as number},zoneOverrides:{...v.zoneOverrides as Record<string,number>}};
}
export function previewDeliveryQuote(config:DeliveryPricingSettings,fromZone:string,toZone:string){
 const area=Object.hasOwn(MANSOURA_AREA_DEFAULTS,toZone)?MANSOURA_AREA_DEFAULTS[toZone]:undefined;
 if(fromZone==="المنصورة"&&area){
   const pair=fromZone+"|"+toZone;const overridden=Object.hasOwn(config.zoneOverrides,pair);const fee=overridden?config.zoneOverrides[pair]!:area.local?Math.max(config.mansouraLocal.minimumEGP,Math.min(config.mansouraLocal.maximumEGP,area.feeEGP)):area.feeEGP;
   return {fromZone,toZone,km:null,feeEGP:fee,feeMinEGP:fee,feeMaxEGP:fee,estimated:!overridden,provisionalLocalRange:area.local&&!overridden};
 }
 // Only known service zones: no silent 8km fallback for arbitrary text.
 if(!Object.hasOwn(WASL_ZONES,fromZone)||!Object.hasOwn(WASL_ZONES,toZone))throw Error("unsupported_zone");
 const a=WASL_ZONES[fromZone]!,b=WASL_ZONES[toZone]!;
 const radius:Record<string,number>={المقطم:4.5,"التجمع الخامس":4.5,الرحاب:3.5,المعادي:3,الهرم:3.5};
 const r=radius[toZone]||2.5;
 const km=fromZone===toZone?Math.round(Math.max(1,(radius[fromZone]||2.5)*0.45)*10)/10:Math.round(Math.hypot((b[0]-a[0])*111.32,(b[1]-a[1])*111.32*0.866)*config.roadFactor*10)/10;
 const local=fromZone==="المنصورة"&&toZone==="المنصورة";
 const round=(n:number)=>{const rounded=Math.max(local?config.mansouraLocal.minimumEGP:config.minimumEGP,Math.round(n/config.roundStepEGP)*config.roundStepEGP);return local?Math.min(config.mansouraLocal.maximumEGP,rounded):rounded;};
 const feeMin=round(config.baseEGP+config.perKmEGP*Math.max(1,km-r)),feeMax=round(config.baseEGP+config.perKmEGP*(km+r));
 const pair=fromZone+"|"+toZone;const override=Object.hasOwn(config.zoneOverrides,pair)?config.zoneOverrides[pair]:undefined;
 const fee=override??Math.max(feeMin,Math.min(feeMax,Math.round((feeMin+feeMax)/(2*config.roundStepEGP))*config.roundStepEGP));
 return{fromZone,toZone,km,feeEGP:fee,feeMinEGP:override??feeMin,feeMaxEGP:override??feeMax,estimated:override===undefined,provisionalLocalRange:local&&override===undefined};
}
let ensured:Promise<void>|null=null;
export function ensureDeliveryPricing(){if(!ensured)ensured=(async()=>{
 await db.execute(sql`CREATE TABLE IF NOT EXISTS sharefast_delivery_pricing(id integer PRIMARY KEY CHECK(id=1),version integer NOT NULL,settings jsonb NOT NULL,updated_by text NOT NULL,updated_at timestamptz NOT NULL DEFAULT now())`);
 await db.execute(sql`CREATE TABLE IF NOT EXISTS sharefast_delivery_pricing_history(version integer PRIMARY KEY,settings jsonb NOT NULL,updated_by text NOT NULL,updated_at timestamptz NOT NULL DEFAULT now())`);
 })().catch(e=>{ensured=null;throw e;});return ensured;}
export async function loadDeliveryPricing(){await ensureDeliveryPricing();const row=rows<{version:number;settings:unknown}>(await db.execute(sql`SELECT version,settings FROM sharefast_delivery_pricing WHERE id=1`))[0];return row?{version:row.version,settings:parseDeliveryPricing(row.settings)}:{version:0,settings:parseDeliveryPricing(DEFAULT_DELIVERY_PRICING)};}
export async function saveDeliveryPricing(value:unknown,expectedVersion:number,actorId:string){
 const clean=parseDeliveryPricing(value);if(!Number.isSafeInteger(expectedVersion)||expectedVersion<0||!actorId)throw Error("invalid_pricing");await ensureDeliveryPricing();
 return db.transaction(async tx=>{
 const saved=rows<{version:number}>(await tx.execute(sql`INSERT INTO sharefast_delivery_pricing(id,version,settings,updated_by) SELECT 1,1,${JSON.stringify(clean)}::jsonb,${actorId} WHERE ${expectedVersion}=0 ON CONFLICT(id) DO NOTHING RETURNING version`))[0]||rows<{version:number}>(await tx.execute(sql`UPDATE sharefast_delivery_pricing SET version=version+1,settings=${JSON.stringify(clean)}::jsonb,updated_by=${actorId},updated_at=now() WHERE id=1 AND version=${expectedVersion} RETURNING version`))[0];
 if(!saved)throw Error("settings_changed_reload");await tx.execute(sql`INSERT INTO sharefast_delivery_pricing_history(version,settings,updated_by)VALUES(${saved.version},${JSON.stringify(clean)}::jsonb,${actorId})`);return{version:saved.version,settings:clean};
 });
}

export function pricingDestinations(fromZone:string){return [...new Set([...Object.keys(WASL_ZONES),...(fromZone==="المنصورة"?Object.keys(MANSOURA_AREA_DEFAULTS):[])])];}
