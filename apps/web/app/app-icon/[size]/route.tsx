import { ImageResponse } from "next/og";
import { ShareFastMark } from "@/components/brand/share-fast-mark";
export async function GET(_request:Request,{params}:{params:Promise<{size:string}>}) {
 const {size}=await params;
 if(!["192","512","maskable"].includes(size))return new Response("Not found",{status:404});
 const pixels=size==="192"?192:512;
 return new ImageResponse(<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#067567",color:"#fff"}}><ShareFastMark size={Math.round(pixels*.66)}/></div>,{width:pixels,height:pixels,headers:{"Cache-Control":"public, max-age=86400"}});
}
