import "server-only"
import { eq } from "drizzle-orm"
import { db, siteSettings } from "@el7bboB/db"
import { SITE_COPY_FIELDS, type SiteCopyValues } from "./site-copy-config"

const CONTENT_ROW_ID="content"
export async function loadSiteCopyValues():Promise<SiteCopyValues>{
	const [row]=await db.select().from(siteSettings).where(eq(siteSettings.id,CONTENT_ROW_ID)).limit(1)
	let saved:SiteCopyValues={}
	if(row?.heroImageDataUrl){try{const value=JSON.parse(row.heroImageDataUrl) as unknown;if(value&&typeof value==="object"&&!Array.isArray(value))saved=value as SiteCopyValues}catch{/* Use defaults when the saved value is malformed. */}}
	return Object.fromEntries(SITE_COPY_FIELDS.map((field)=>{
		const current=saved[field.key]
		return [field.key,typeof current==="string"&&current.trim().length>0?current.trim():field.defaultText]
	}))
}
export async function saveSiteCopyValues(values:SiteCopyValues){
	const allowed=new Set<string>(SITE_COPY_FIELDS.map((field)=>field.key)),clean:SiteCopyValues={}
	for(const[key,value]of Object.entries(values)){if(allowed.has(key)&&typeof value==="string"&&value.trim().length<=300)clean[key]=value.trim()}
	await db.insert(siteSettings).values({id:CONTENT_ROW_ID,heroImageDataUrl:JSON.stringify(clean)}).onConflictDoUpdate({target:siteSettings.id,set:{heroImageDataUrl:JSON.stringify(clean),updatedAt:new Date()}})
}
