import { NextResponse } from "next/server";
import { authorizeWasl } from "@/lib/wasl-access";
import { readJsonRecord } from "@/lib/wasl-validation";
import { claimFreelanceOffer, DispatchError } from "@/lib/freelance-dispatch";
export const dynamic="force-dynamic";
export async function POST(request: Request) {
  const user=await authorizeWasl(request,"freelance");if(user instanceof Response)return user;
  if(user.role!=="courier")return NextResponse.json({ok:false,error:"forbidden"},{status:403});
  if(new URL(request.url).search)return NextResponse.json({ok:false,error:"invalid_fields"},{status:400});
  try {return NextResponse.json({ok:true,claim:await claimFreelanceOffer(user,await readJsonRecord(request))},{headers:{"Cache-Control":"no-store"}});}
  catch(error) {
    if(error instanceof SyntaxError || (error instanceof Error && error.message==="bad_json"))
      return NextResponse.json({ok:false,error:"invalid_fields"},{status:400});
    const known=error instanceof DispatchError;
    return NextResponse.json({ok:false,error:known?error.code:"dispatch_unavailable"},{status:known?error.status:503,headers:{"Cache-Control":"no-store"}});
  }
}