import { expect, test, type Page } from "@playwright/test";
const user = {
	id: "test-account",
	ref: "SX-test",
	role: "merchant",
	name: "نشاط الاختبار",
	phone: "01000000001",
	zone: "المعادي",
	governorate: "القاهرة",
	address: "عنوان اختبار",
	status: "active",
	phoneVerified: false,
};
async function mockApi(page: Page, authStatus = 200, principal = user) {
	await page.route("**/api/wasl/**", (route) =>
		route.fulfill({
			status: route.request().url().includes("auth/me") ? authStatus : 200,
			contentType: "application/json",
			body: JSON.stringify({
				ok: true,
				user: principal,
				account: principal,
				canWork: true,
				entities: [],
				orders: [],
				settings: {
					courier: { enabled: false, monthlyFee: 0 },
					merchant: { enabled: false, monthlyFee: 0 },
					company: { enabled: false, monthlyFee: 0 },
				},
				accounts: [],
				couriers: [],
				clients: [],
				invites: [],
				partnerships: [],
				stats: { merchants: 0, companies: 0, couriers: 0, orders: 0 },
			}),
		}),
	);
}
async function details(page: Page) {
	await page.getByRole("button", { name: "متابعة", exact: true }).click();
	await page
		.getByLabel("اسم المطعم أو النشاط", { exact: true })
		.fill("نشاط الاختبار");
	await page.getByLabel("المنطقة", { exact: true }).fill("المعادي");
	await page
		.getByLabel("عنوان النشاط أو المقر", { exact: true })
		.fill("عنوان اختبار محلي");
}
test("landing is RTL, responsive, with Lucide and real registration links", async ({
	page,
}) => {
	const errors: string[] = [];
	page.on("pageerror", (e) => errors.push(e.message));
	await page.goto("/");
	await expect(page.getByRole("heading", { level: 1 })).toContainText("كل طلب");
	await expect(page.locator("svg.lucide:visible").first()).toBeVisible();
	await expect(page.getByText("معاينة توضيحية", { exact: true })).toBeVisible();
	expect(await page.locator("html").getAttribute("dir")).toBe("rtl");
	expect(
		await page.evaluate(
			() => document.documentElement.scrollWidth <= innerWidth + 1,
		),
	).toBe(true);
	await page.locator("details").first().locator("summary").click();
	await expect(page.locator("details[open]")).toHaveCount(1);
	await page.locator('a[href="/register"]').first().click();
	await expect(page).toHaveURL(/\/register$/);
	expect(errors).toEqual([]);
});
test("simple registration validates details, preserves them backwards, and stops mismatched passwords", async ({page}) => {
 await page.goto("/register");
 await page.getByRole("button",{name:"متابعة",exact:true}).click();
 await page.getByRole("button",{name:"إنشاء حسابي",exact:true}).click();
 await expect(page.getByText("راجع البيانات المعلّمة أدناه.",{exact:true})).toBeVisible();
 await page.getByLabel("اسم المطعم أو النشاط",{exact:true}).fill("نشاط الاختبار");
 await page.getByLabel("المنطقة",{exact:true}).fill("المعادي");
 await page.getByLabel("عنوان النشاط أو المقر",{exact:true}).fill("عنوان الاختبار");
 await page.getByRole("button",{name:"رجوع",exact:true}).click();
 await page.getByRole("button",{name:"متابعة",exact:true}).click();
 await expect(page.getByLabel("المنطقة",{exact:true})).toHaveValue("المعادي");
 await page.getByLabel("رقم الموبايل",{exact:true}).fill("01000000001");
 await page.getByLabel("كلمة المرور",{exact:true}).fill("long-test-password");
 await page.getByLabel("تأكيد كلمة المرور",{exact:true}).fill("different-password");
 await page.getByRole("checkbox").check();
 await page.getByRole("button",{name:"إنشاء حسابي",exact:true}).click();
 await expect(page.getByText("كلمتا المرور غير متطابقتين",{exact:true})).toBeVisible();
});
test("company uses one form with optional coverage and courier starts in the app", async ({page}) => {
 await page.goto("/register?role=company");
 await page.getByText("تفاصيل إضافية (اختياري)",{exact:true}).click();
 await expect(page.getByLabel("نطاق التغطية (اختياري)",{exact:true})).toBeVisible();
 await expect(page.getByRole("button",{name:"إنشاء حسابي",exact:true})).toBeVisible();
 await page.goto("/register?role=courier");
 await expect(page).toHaveURL(/app\?role=courier/);
 await page.getByRole("link",{name:"إنشاء حساب المندوب",exact:true}).click();
 await expect(page.getByLabel("وسيلة التوصيل",{exact:true})).toBeVisible();
 await expect(page.getByLabel("الرقم القومي",{exact:true})).toHaveCount(0);
 await expect(page.getByRole("button",{name:"إنشاء حسابي",exact:true})).toBeVisible();
});
test("duplicate-account response stays on registration with a useful error", async ({
	page,
}) => {
	await page.route("**/api/wasl/auth/register", (route) =>
		route.fulfill({
			status: 409,
			contentType: "application/json",
			body: JSON.stringify({ ok: false, error: "account_exists" }),
		}),
	);
	await page.goto("/register");
	await details(page);
	await page.getByLabel("رقم الموبايل", { exact: true }).fill("01000000001");
	for (const label of ["كلمة المرور", "تأكيد كلمة المرور"])
		await page.getByLabel(label, { exact: true }).fill("long-test-password");
	await page.getByRole("checkbox").check();
	await page.getByRole("button", { name: "إنشاء حسابي", exact: true }).click();
	await expect(
		page.locator('[role="alert"]:not(#__next-route-announcer__)'),
	).toContainText("يوجد حساب");
	await expect(page).toHaveURL(/\/register$/);
});
test("successful registration sends one request and opens only the session's portal", async ({
	page,
}) => {
	await mockApi(page);
	let requests = 0;
	await page.route("**/api/wasl/auth/register", async (route) => {
		requests++;
		await new Promise((r) => setTimeout(r, 150));
		await route.fulfill({
			status: 201,
			contentType: "application/json",
			body: JSON.stringify({ ok: true, user }),
		});
	});
	await page.goto("/register");
	await details(page);
	await page.getByLabel("رقم الموبايل", { exact: true }).fill("01000000001");
	for (const label of ["كلمة المرور", "تأكيد كلمة المرور"])
		await page.getByLabel(label, { exact: true }).fill("long-test-password");
	await page.getByRole("checkbox").check();
	await page
		.getByRole("button", { name: "إنشاء حسابي", exact: true })
		.dblclick();
	await expect(page).toHaveURL(/\/wasl$/);
	await expect(page.locator("aside.side")).toBeVisible();
	expect(requests).toBe(1);
	expect(
		await page.evaluate(() =>
			Object.values(localStorage).some((x) =>
				String(x).includes("long-test-password"),
			),
		),
	).toBe(false);
});
test("login wrong password shows error without navigating", async ({
	page,
}) => {
	await page.route("**/api/wasl/auth/login", (route) =>
		route.fulfill({
			status: 401,
			contentType: "application/json",
			body: JSON.stringify({ ok: false, error: "bad_credentials" }),
		}),
	);
	await page.goto("/login");
	await page.getByLabel("رقم الموبايل", { exact: true }).fill("01000000001");
	await page.getByLabel("كلمة المرور", { exact: true }).fill("wrong-password");
	await page.getByRole("button", { name: "تسجيل الدخول", exact: true }).click();
	await expect(
		page.locator('[role="alert"]:not(#__next-route-announcer__)'),
	).toContainText("غير صحيحين");
	await expect(page).toHaveURL(/\/login$/);
});
test("anonymous legacy deep link goes to login, not a public courier portal", async ({
	page,
}) => {
	await mockApi(page, 401);
	await page.goto("/wasl/index.html#courier");
	await expect(page).toHaveURL(/\/login$/);
});
test("session service failure is retryable and does not expose the portal", async ({
	page,
}) => {
	await mockApi(page, 503);
	await page.goto("/wasl");
	await expect(
		page.locator('[role="alert"]:not(#__next-route-announcer__)'),
	).toContainText("تعذر الاتصال");
	await expect(page.locator("aside.side")).toHaveCount(0);
	await expect(
		page.getByRole("button", { name: "إعادة المحاولة" }),
	).toBeVisible();
});
test("changing URL hash never grants admin privileges or crashes the merchant portal", async ({
	page,
}) => {
	await mockApi(page);
	const errors: string[] = [];
	page.on("pageerror", (e) => errors.push(e.message));
	await page.goto("/wasl#admin");
	await expect(page.locator("aside.side")).toBeVisible();
	await expect(page.locator(".account-session-bar")).toContainText(user.name);
	expect(errors).toEqual([]);
});

for (const role of ["company", "courier", "admin"]) {
	test(`${role} authenticated portal mounts without runtime errors`, async ({
		page,
	}) => {
		await mockApi(page, 200, { ...user, role });
		const errors: string[] = [];
		page.on("pageerror", (e) => errors.push(e.message));
		await page.goto(`/wasl#${role}`);
		await expect(page.locator(".account-session-bar")).toContainText(user.name);
		await expect(page.locator(".portal-loading")).toHaveCount(0);
		await expect(
			page.getByText("حدث خطأ غير متوقع في هذه الشاشة", { exact: true }),
		).toHaveCount(0);
		await expect(page.locator("svg.lucide:visible").first()).toBeVisible();
		await page.waitForTimeout(500);
		expect(errors).toEqual([]);
	});
}

test("SHARE FAST identity, mark and favicon are consistent on public pages", async ({page,request}) => {
 for(const path of ["/","/register","/login","/privacy"]){
  await page.goto(path);
  await expect(page).toHaveTitle(/SHARE FAST/);
  await expect(page.getByRole("link",{name:"SHARE FAST — الرئيسية",exact:true}).first()).toBeVisible();
  await expect(page.getByTestId("share-fast-mark").first()).toBeVisible();
  await expect(page.getByText(/Super X/)).toHaveCount(0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 }
 const favicon=await request.get("/icon.svg");expect(favicon.status()).toBe(200);expect(favicon.headers()["content-type"]).toContain("image/svg+xml");
 const logo=await request.get("/brand/share-fast-logo.svg");expect(logo.status()).toBe(200);expect(await logo.text()).toContain("SHARE FAST");
});


test("header is readable and compact navigation supports keyboard closing", async ({ page }) => {
 await page.goto("/");
 const button = page.locator("header button[aria-controls=site-navigation]");
 if ((page.viewportSize()?.width || 1440) <= 800) {
  await button.click();
  await expect(button).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("link", { name: "خطوات التسجيل", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(button).toHaveAttribute("aria-expanded", "false");
  await expect(button).toBeFocused();
 }
 for (const label of ["تسجيل الدخول", "حساب جديد"]) {
  const link = page.locator("header").getByRole("link", { name: label, exact: true });
  await expect(link).toBeVisible();
  expect(await link.evaluate(e => parseFloat(getComputedStyle(e).fontSize))).toBeGreaterThanOrEqual(16);
  expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
 }
});


test("landing makes restaurant, company and courier device availability explicit",async({page})=>{
 await page.goto("/");
 for(const title of ["مطعم أو نشاط تجاري","شركة توصيل"]){const card=page.locator("article").filter({has:page.getByRole("heading",{name:title,exact:true})});await expect(card.getByText("موبايل + كمبيوتر",{exact:true})).toBeVisible();await expect(card.getByRole("link",{name:/تثبيت تطبيق/})).toHaveAttribute("href",title==="شركة توصيل"?"/app?role=company":"/app?role=merchant")}
 const courier=page.locator("article").filter({has:page.getByRole("heading",{name:"مندوب توصيل",exact:true})});await expect(courier.getByText("تطبيق للموبايل",{exact:true})).toBeVisible();
 await expect(page.getByRole("heading",{name:"حساب واحد. على الموبايل والكمبيوتر.",exact:true})).toBeVisible();
 await page.getByText("هل تطبيق المطعم والشركة للموبايل أم للكمبيوتر؟",{exact:true}).click();await expect(page.getByText("متاح للموبايل والكمبيوتر معًا.",{exact:false})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
