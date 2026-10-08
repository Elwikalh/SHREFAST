import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
 return { id:"/", name:"SHARE FAST — إدارة التوصيل", short_name:"SHARE FAST", description:"طلباتك وفريقك في لوحة واحدة", lang:"ar", dir:"rtl", start_url:"/app?launch=installed", scope:"/", display:"standalone", background_color:"#f8fafb", theme_color:"#067567", icons:[{src:"/app-icon/192?v=forward-v1",sizes:"192x192",type:"image/png",purpose:"any"},{src:"/app-icon/512?v=forward-v1",sizes:"512x512",type:"image/png",purpose:"any"},{src:"/app-icon/maskable?v=forward-v1",sizes:"512x512",type:"image/png",purpose:"maskable"}] };
}
