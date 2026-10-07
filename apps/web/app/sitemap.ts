import type { MetadataRoute } from "next"
const SITE_URL=process.env.NEXT_PUBLIC_SITE_URL??"https://el7bbob-production.up.railway.app"
export default function sitemap():MetadataRoute.Sitemap{return[{url:SITE_URL,lastModified:new Date(),changeFrequency:"daily",priority:1}]}
