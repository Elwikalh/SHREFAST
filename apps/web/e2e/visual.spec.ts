import { test, expect } from "@playwright/test";
test("visual landing loads local photos and preserves device-specific registration links", async ({ page, request }) => {
 const errors: string[] = [];
 page.on("pageerror", error => errors.push(error.message));
 await page.goto("/");
 await expect(page.getByRole("heading", { level: 1 })).toContainText("كل طلب");
 const photo = page.locator('img[src="/media/delivery-scene.svg"]');
 await expect(photo).toBeVisible();
 await expect.poll(() => photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
 await page.locator('[aria-labelledby="work-story-title"]').scrollIntoViewIfNeeded();
 const business = page.locator('img[src="/media/business-scene.svg"]');
 await expect.poll(() => business.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
 for (const filename of ["delivery-scene", "business-scene"]) {
  const response = await request.get(`/media/${filename}.svg`);
  expect(response.status()).toBe(200);
  const content = await response.text();
  expect(content).toContain("data:image/webp;base64,");
  expect(content.length).toBeLessThan(160000);
 }
 await expect(page.locator('a[href="/app?role=courier"]').first()).toBeVisible();
 expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
 expect(errors).toEqual([]);
});
test("reduced motion keeps every section visible and disables hero animation", async ({ page }) => {
 await page.emulateMedia({ reducedMotion: "reduce" });
 await page.goto("/");
 await expect(page.locator('[data-motion="ready"]')).toHaveCount(0);
 expect(await page.locator("[data-reveal]").evaluateAll(elements => elements.every(el => getComputedStyle(el).opacity === "1"))).toBe(true);
 expect(await page.locator("h1").evaluate(el => getComputedStyle(el.parentElement!).animationName)).toBe("none");
 await page.getByRole("link",{name:"ثبّت التطبيق",exact:true}).first().click();
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
