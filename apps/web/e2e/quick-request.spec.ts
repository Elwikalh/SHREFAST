import { test, expect, type Page } from "@playwright/test";
const user = { id: "test", ref: "SX-test", role: "merchant", name: "مطعم الاختبار", phone: "01000000001", zone: "المعادي", governorate: "القاهرة", address: "شارع مطعم الاختبار", status: "active", phoneVerified: false };
async function mock(page: Page, role = "merchant") {
 await page.route("**/api/wasl/**", route => {
  const url = route.request().url();
  return route.fulfill({ contentType: "application/json", body: JSON.stringify(url.includes("/orders/quote") ? { ok: true, quote: { zone: new URL(url).searchParams.get("zone"), fee: 40, feeMin: 35, feeMax: 45, km: 4 } } : { ok: true, user: { ...user, role }, orders: [], entities: [], settings: { courier: {enabled:false}, merchant:{enabled:false}, company:{enabled:false} } }) });
 });
}
async function fields(page: Page) {
 await page.getByLabel("رقم موبايل العميل",{exact:true}).fill("+20 1012345678");
 await page.getByLabel("منطقة التسليم",{exact:true}).fill("المقطم");
 await page.getByLabel("عنوان العميل بالتفصيل",{exact:true}).fill("شارع العميل ١، الدور الثاني");
 await expect(page.getByRole("button", {name:/تأكيد طلب المندوب/})).toBeEnabled();
}
test("restaurant banner button opens authentication while preserving the request intent", async ({page}) => {
 await page.route("**/api/wasl/auth/me",route => route.fulfill({status:401,contentType:"application/json",body:JSON.stringify({ok:false})}));
 await page.goto("/");
 await page.locator("header").getByRole("link",{name:"اطلب مندوب",exact:true}).click();
 await expect(page).toHaveURL(/\/login\?role=merchant&intent=request/);
 await expect(page.getByRole("link",{name:"إنشاء حساب",exact:true})).toHaveAttribute("href","/register?role=merchant&intent=request");
});
test("signed-in restaurant sends once after three fields and explicit fee confirmation", async ({page}) => {
 await mock(page); let writes = 0; let payload: Record<string,unknown> = {};
 await page.route("**/api/wasl/orders", route => {
  if(route.request().method()!=="POST")return route.fallback();
  writes++;payload=route.request().postDataJSON();return route.fulfill({status:201,contentType:"application/json",body:JSON.stringify({ok:true,order:{id:"SX-test-order",fee:40,status:"searching"}})});
 });
 await page.goto("/request");
 await expect(page.getByText("شارع مطعم الاختبار — المعادي",{exact:true})).toBeVisible();
 expect(writes).toBe(0); await fields(page);
 const button=page.getByRole("button",{name:/تأكيد طلب المندوب/}); await expect(button).toContainText("40 ج");
 await button.evaluate(el=>{(el as HTMLButtonElement).click();(el as HTMLButtonElement).click()});
 await expect(page.getByRole("heading",{name:"طلبك اتسجّل على المنصة",exact:true})).toBeVisible();
 expect(writes).toBe(1);expect(payload.customerPhone).toBe("01012345678");expect(payload.fee).toBe(40);expect(payload).not.toHaveProperty("merchant");
 await expect(page.getByText("SX-test-order",{exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
test("uncertain network failure does not invent a saved order or allow duplicate retry", async ({page}) => {
 await mock(page);await page.route("**/api/wasl/orders",route => route.abort());
 await page.goto("/request");await fields(page);await page.getByRole("button",{name:/تأكيد طلب المندوب/}).click();
 await expect(page.locator("form").getByRole("alert")).toContainText("قد يكون الطلب تسجّل بالفعل");
 await expect(page.getByRole("button",{name:/تأكيد طلب المندوب/})).toBeDisabled();
 await expect(page.getByRole("link",{name:"راجع طلباتي أولًا",exact:true})).toHaveAttribute("href","/wasl#merchant?page=orders");
 await expect(page.getByRole("heading",{name:"طلبك اتسجّل على المنصة",exact:true})).toHaveCount(0);
});
test("company session cannot use the restaurant quick-order form",async({page})=>{await mock(page,"company");await page.goto("/request");await expect(page.getByText("طلب مندوب متاح من حساب مطعم أو نشاط تجاري.",{exact:true})).toBeVisible();await expect(page.getByLabel("رقم موبايل العميل")).toHaveCount(0)});
test("successful sign-in returns to the requested courier form",async({page})=>{
 await mock(page);await page.goto("/login?role=merchant&intent=request");
 await page.getByLabel("رقم الموبايل",{exact:true}).fill("01000000001");await page.getByLabel("كلمة المرور",{exact:true}).fill("test-only-strong-password");
 await page.getByRole("button",{name:"تسجيل الدخول",exact:true}).click();await expect(page).toHaveURL(/\/request$/);await expect(page.getByLabel("رقم موبايل العميل",{exact:true})).toBeVisible();
});

test("invalid customer phone does not create an order",async({page})=>{
 await mock(page);let writes=0;await page.route("**/api/wasl/orders",route=>{writes++;return route.fulfill({status:201,contentType:"application/json",body:JSON.stringify({ok:true,order:{id:"unexpected",fee:40}})})});
 await page.goto("/request");await fields(page);await page.getByLabel("رقم موبايل العميل",{exact:true}).fill("123");await page.getByRole("button",{name:/تأكيد طلب المندوب/}).click();
 await expect(page.getByText("أدخل رقم موبايل مصري صحيحًا للعميل",{exact:true})).toBeVisible();expect(writes).toBe(0);
});
test("missing pickup never substitutes a demonstration restaurant address",async({page})=>{
 await page.route("**/api/wasl/auth/me",route=>route.fulfill({contentType:"application/json",body:JSON.stringify({ok:true,user:{...user,address:""}})}));await page.goto("/request");
 await expect(page.getByText("أكمل عنوان ومنطقة نشاطك من لوحة الحساب قبل طلب مندوب.",{exact:false})).toBeVisible();await expect(page.getByRole("button",{name:/تأكيد طلب المندوب/})).toBeDisabled();
});
