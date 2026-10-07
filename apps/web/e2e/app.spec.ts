import {test,expect} from "@playwright/test";
test("manifest and PNG icons are installable with the correct application scope",async({request})=>{
 const response=await request.get("/manifest.webmanifest");expect(response.status()).toBe(200);const manifest=await response.json();expect(manifest.display).toBe("standalone");expect(manifest.start_url).toBe("/app?launch=installed");expect(manifest.scope).toBe("/");
 for(const icon of manifest.icons){const response=await request.get(icon.src);expect(response.status()).toBe(200);expect(response.headers()["content-type"]).toContain("image/png");expect((await response.body()).subarray(0,8).toString("hex")).toBe("89504e470d0a1a0a")}
});
test("install page offers all roles, real instructions, and only prompts after a click",async({page})=>{
 await page.goto("/app?role=courier");await expect(page.getByRole("link",{name:"إنشاء حساب المندوب",exact:true})).toBeVisible();
 await page.evaluate(async()=>{await navigator.serviceWorker.ready});
 await page.evaluate(()=>{const event=new Event("beforeinstallprompt");Object.assign(event,{prompt:async()=>{(window as unknown as {promptCalled:boolean}).promptCalled=true},userChoice:Promise.resolve({outcome:"accepted"})});window.dispatchEvent(event)});
 await page.getByRole("button",{name:"تثبيت التطبيق",exact:true}).click();
 await expect(page.getByText("التطبيق جاهز على جهازك",{exact:true})).toBeVisible();
 expect(await page.evaluate(()=>(window as unknown as {promptCalled:boolean}).promptCalled)).toBe(true);
 await page.getByRole("button",{name:/مطعم أو نشاط تجاري/}).click();await expect(page.getByRole("link",{name:"إنشاء حساب جديد",exact:true})).toHaveAttribute("href","/register?role=merchant&app=1");
 await page.getByRole("button",{name:/شركة توصيل/}).click();await expect(page.getByRole("link",{name:"إنشاء حساب جديد",exact:true})).toHaveAttribute("href","/register?role=company&app=1");
});
test("service worker never caches account APIs or private navigation HTML",async({page})=>{
 await page.goto("/app");await page.evaluate(async()=>{await navigator.serviceWorker.ready});
 const entries=await page.evaluate(async()=>{const names=await caches.keys();const urls=[];for(const name of names.filter(x=>x.startsWith("share-fast-public-"))){const cache=await caches.open(name);urls.push(...(await cache.keys()).map(r=>new URL(r.url).pathname))}return urls});
 expect(entries).toContain("/offline");expect(entries.some(x=>x.startsWith("/api/")||["/wasl","/register","/login"].includes(x))).toBe(false);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});

test("installed application opens the existing authenticated dashboard",async({page})=>{
 await page.route("**/api/wasl/**",route=>route.fulfill({contentType:"application/json",body:JSON.stringify({ok:true,user:{id:"test",ref:"SX-test",role:"merchant",name:"نشاط الاختبار",phone:"01000000001",zone:"المعادي",governorate:"القاهرة",address:"عنوان اختبار",status:"active"},entities:[],orders:[],settings:{courier:{enabled:false},merchant:{enabled:false},company:{enabled:false}},accounts:[],couriers:[],clients:[],partnerships:[],invites:[],stats:{merchants:0,companies:0,couriers:0,orders:0}})}));
 await page.goto("/app?launch=installed");await expect(page).toHaveURL(/\/wasl$/);await expect(page.locator(".account-session-bar")).toContainText("نشاط الاختبار");
});
