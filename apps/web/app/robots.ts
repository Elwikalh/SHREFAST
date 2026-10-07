import type { MetadataRoute } from "next"
const SITE_URL=process.env.NEXT_PUBLIC_SITE_URL??"https://el7bbob-production.up.railway.app"
export default function robots():MetadataRoute.Robots{return{rules:{userAgent:"*",allow:"/",disallow:["/staff/","/api/","/order/checkout","/order/confirmation/"]},sitemap:`${SITE_URL}/sitemap.xml`,host:SITE_URL}}
