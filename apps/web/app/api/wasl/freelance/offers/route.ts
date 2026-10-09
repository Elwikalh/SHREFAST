import { NextResponse } from "next/server";
import { authorizeWasl } from "@/lib/wasl-access";
import { freelanceOffers, DispatchError } from "@/lib/freelance-dispatch";
export const dynamic="force-dynamic";
export async function GET(request: Request) {
  const user=await authorizeWasl(request,"freelance");if(user instanceof Response)return user;
  if(user.role!=="courier")return NextResponse.json({ok:false,error:"forbidden"},{status:403});
  if(new URL(request.url).search)return NextResponse.json({ok:false,error:"invalid_fields"},{status:400});
  try {return NextResponse.json({ok:true,...await freelanceOffers(user)},{headers:{"Cache-Control":"no-store"}});}
  catch(error) {
    const known=error instanceof DispatchError;
    return NextResponse.json({ok:false,error:known?error.code:"dispatch_unavailable"},{status:known?error.status:503,headers:{"Cache-Control":"no-store"}});
  }
}