import { expect, test, type Page } from "@playwright/test";
const courier={id:"test-courier",ref:"CRX-1",role:"courier",name:"مندوب اختبار",phone:"01000000001",zone:"المنصورة",governorate:"الدقهلية",address:"",status:"active",phoneVerified:false};
const offer={ref:"SX-100",merchantName:"مطعم الاختبار",pickupZone:"المنصورة",destinationZone:"ميدان مشعل",feeEGP:20,readyMinutes:15,readyAt:null,restaurantPriority:true};
async function mock(page:Page,role="courier",enabled=true){
  const state={enabled,revision:1,offersReads:0,claimRefs:[] as string[],settingBodies:[] as Record<string,unknown>[]};
  await page.route("**/api/wasl/**",async route=>{
    const path=new URL(route.request().url()).pathname;
    let data:unknown={ok:true,user:{...courier,role},account:courier,canWork:true,entities:[],orders:[],couriers:[],invites:[],clients:[],partnerships:[],
      policy:{subscriptionExempt:false,subscriptionRequired:false,effectiveMonthlyFeeEGP:0},priorityEnabled:false,
      settings:{courier:{enabled:false},merchant:{enabled:false},company:{enabled:false}}};
    if(path.endsWith("/freelance/settings")){
      if(route.request().method()==="POST"){const body=route.request().postDataJSON();state.settingBodies.push(body);state.enabled=body.enabled;state.revision++;}
      data={ok:true,setting:{enabled:state.enabled,revision:state.revision}};
    }
    if(path.endsWith("/freelance/offers")){state.offersReads++;data={ok:true,available:true,busy:false,offers:[offer]};}
    if(path.endsWith("/freelance/claim")){state.claimRefs.push(route.request().postDataJSON().orderRef);data={ok:true,claim:{ref:offer.ref,status:"accepted",replayed:false}};}
    if(path.endsWith("/preparation"))data={ok:true,orders:[]};
    await route.fulfill({contentType:"application/json",body:JSON.stringify(data)});
  });
  return state;
}
const panel=(page:Page)=>page.getByRole("region",{name:"عروض شبكة المناديب"});
test("courier sees redacted offer and server-confirmed acceptance",async({page})=>{
  const state=await mock(page);await page.goto("/wasl");
  await expect(panel(page).getByText("مطعم الاختبار — SX-100")).toBeVisible();
  await expect(panel(page)).toContainText("مدة تجهيز تقديرية: 15 دقيقة؛ ليست إعلان جاهزية");
  await expect(panel(page)).not.toContainText("PRIVATE PHONE");
  await panel(page).getByRole("button",{name:"قبول هذا الطلب",exact:true}).click();
  await expect(panel(page)).toContainText("مرجع الطلب: SX-100 — الحالة المسجلة: accepted");
  expect(state.claimRefs).toEqual(["SX-100"]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
test("offline courier does not fetch offers until explicit activation",async({page})=>{
  const state=await mock(page,"courier",false);await page.goto("/wasl");
  const enable=panel(page).getByRole("button",{name:"تفعيل عروض الشبكة",exact:true});
  await expect(enable).toBeEnabled();expect(state.offersReads).toBe(0);
  await enable.click();await expect(panel(page).getByRole("button",{name:"قبول هذا الطلب"})).toBeVisible();
  expect(state.settingBodies).toEqual([{enabled:true,expectedRevision:1}]);
});
test("lost claim acknowledgement locks other actions and recovers the same ref after reload",async({page})=>{
  await mock(page);const refs:string[]=[];let first=true;
  await page.route("**/api/wasl/freelance/claim",async route=>{
    refs.push(route.request().postDataJSON().orderRef);
    if(first){first=false;await route.abort();return;}
    await route.fulfill({contentType:"application/json",body:JSON.stringify({ok:true,claim:{ref:"SX-100",status:"accepted",replayed:true}})});
  });
  await page.goto("/wasl");await panel(page).getByRole("button",{name:"قبول هذا الطلب",exact:true}).click();
  await expect(panel(page).getByRole("button",{name:"إعادة التحقق من نفس الطلب"})).toBeEnabled();
  await expect(panel(page).getByRole("button",{name:"قبول هذا الطلب",exact:true})).toBeDisabled();
  await page.reload();await panel(page).getByRole("button",{name:"إعادة التحقق من نفس الطلب"}).click();
  await expect(panel(page)).toContainText("مرجع الطلب: SX-100");
  expect(refs).toEqual(["SX-100","SX-100"]);
});
test("conflict never invents acceptance and clears the pending attempt",async({page})=>{
  await mock(page);await page.route("**/api/wasl/freelance/claim",route=>route.fulfill({status:409,contentType:"application/json",body:JSON.stringify({ok:false,error:"offer_unavailable"})}));
  await page.goto("/wasl");await panel(page).getByRole("button",{name:"قبول هذا الطلب",exact:true}).click();
  await expect(panel(page)).toContainText("الطلب اتغير أو قبله مندوب آخر");
  await expect(panel(page).getByText("مرجع الطلب:",{exact:false})).toHaveCount(0);
  await expect(panel(page).getByRole("button",{name:"إعادة التحقق من نفس الطلب"})).toHaveCount(0);
});
test("merchant opt-in sends no identity, fee or courier fields",async({page})=>{
  const state=await mock(page,"merchant",false);await page.goto("/wasl");
  await panel(page).getByRole("button",{name:"تفعيل عروض الشبكة",exact:true}).click();
  await expect(panel(page)).toContainText("تم تفعيل استقبال عروض الشبكة");
  expect(state.settingBodies).toEqual([{enabled:true,expectedRevision:1}]);
  expect(state.offersReads).toBe(0);
});