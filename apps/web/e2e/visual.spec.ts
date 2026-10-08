import { test, expect } from "@playwright/test";
test("restaurant landing has branded banners without photographs and a direct request action",async({page})=>{
 await page.goto("/");await expect(page.getByRole("heading",{level:1})).toContainText("طلبك جاهز");
 await expect(page.locator('img[src^="/media/"]')).toHaveCount(0);
 await expect(page.locator('[aria-label="بنر طلب مندوب من المطعم إلى العميل"]')).toBeVisible();
 await expect(page.locator('header').getByRole('link',{name:'اطلب مندوب',exact:true})).toHaveAttribute('href','/request');
 await page.locator('[aria-labelledby="work-story-title"]').scrollIntoViewIfNeeded();
 await expect(page.locator('#work-story-title')).toContainText('طلب المندوب في 3 بيانات.');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
test("reduced motion keeps every section visible and disables hero animation", async ({ page }) => {
 await page.emulateMedia({ reducedMotion: "reduce" });
 await page.goto("/");
 await expect(page.locator('[data-motion="ready"]')).toHaveCount(0);
 expect(await page.locator("[data-reveal]").evaluateAll(elements => elements.every(el => getComputedStyle(el).opacity === "1"))).toBe(true);
 expect(await page.locator("h1").evaluate(el => getComputedStyle(el.parentElement!).animationName)).toBe("none");
 await page.locator("footer").getByRole("link",{name:"تثبيت التطبيق",exact:true}).click();
 await expect(page).toHaveURL(/\/app$/);
 await expect(page.getByRole("button",{name:"تثبيت التطبيق",exact:true})).toBeVisible();
});
test("scroll reveals content without hiding keyboard focused links", async ({ page }) => {
 await page.emulateMedia({ reducedMotion: "no-preference" });
 await page.goto("/");
 await expect(page.locator('[data-motion="ready"]')).toHaveCount(1);
 const story = page.locator('[aria-labelledby="work-story-title"]');
 await story.scrollIntoViewIfNeeded();
 await expect(story).toHaveAttribute("data-revealed", "true");
 await expect.poll(() => story.evaluate(el => getComputedStyle(el).opacity)).toBe("1");
});
