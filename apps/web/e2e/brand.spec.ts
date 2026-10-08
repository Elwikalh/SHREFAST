import { expect, test } from "@playwright/test";

test("approved geometric identity is shared by landing and installation", async ({ page }) => {
 for (const route of ["/", "/app?role=merchant"]) {
  await page.goto(route);
  const mark=page.getByTestId("share-fast-mark").first();
  await expect(mark).toBeVisible();
  await expect(mark).toHaveAttribute("data-brand-version", "forward-v1");
  await expect(mark.locator("path")).toHaveCount(2);
  await expect(mark.locator("circle")).toHaveCount(0);
  await expect(page.getByTestId("share-fast-wordmark").first()).toHaveAttribute("data-brand-version", "forward-v1");
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 }
});

test("public vector assets and manifest refer to the new identity", async ({ request }) => {
 for(const path of ["/icon.svg","/brand/share-fast-mark.svg","/brand/share-fast-logo.svg","/brand/share-fast-logo-dark.svg"]) {
  const response=await request.get(path);expect(response.ok()).toBe(true);
  const body=await response.text();expect(body).toContain("M25 23H85L72 39");expect(body).not.toContain("<circle");
 }
 const manifest=await (await request.get("/manifest.webmanifest")).json();
 expect(manifest.icons.every((icon:{src:string})=>icon.src.includes("v=forward-v1"))).toBe(true);
 const worker=await(await request.get("/sw.js")).text();expect(worker).toContain("share-fast-public-v2");
});
