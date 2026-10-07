"use server"

import { revalidatePath } from "next/cache"
import { SITE_COPY_FIELDS, type SiteCopyValues } from "@/app/site-copy-config"
import { saveSiteCopyValues } from "@/app/site-copy-store"
import { requireAdmin } from "@/lib/staff-session"

export async function updateSiteCopy(input:SiteCopyValues){await requireAdmin();const allowed=new Set<string>(SITE_COPY_FIELDS.map((field)=>field.key));for(const[key,value]of Object.entries(input)){if(!allowed.has(key)||typeof value!=="string"||value.trim().length===0||value.length>300)throw new Error("توجد قيمة نصية غير صالحة.")}await saveSiteCopyValues(input);revalidatePath("/");revalidatePath("/order/checkout")}
