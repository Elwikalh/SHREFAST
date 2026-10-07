import { NextResponse } from "next/server"
import { SITE_COPY_FIELDS } from "@/app/site-copy-config"
import { loadSiteCopyValues } from "@/app/site-copy-store"

export const dynamic="force-dynamic"
export async function GET(){const values=await loadSiteCopyValues();return NextResponse.json({pairs:SITE_COPY_FIELDS.map((field)=>({sources:field.sources,value:values[field.key]}))},{headers:{"Cache-Control":"no-store"}})}
