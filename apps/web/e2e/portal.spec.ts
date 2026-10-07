import { expect, test } from "@playwright/test";
test.beforeEach(async ({ page }) => {
	// Deterministic UI smoke tests; these do not test PostgreSQL integration.
	await page.route("**/api/wasl/**", (route) =>
		route.fulfill({
			contentType: "application/json",
			body: JSON.stringify({
				ok: true,
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
				stats: { merchants: 0, companies: 0, couriers: 0, orders: 0 },
			}),
		}),
	);
});
test("Arabic landing page renders with Lucide icons and no horizontal overflow", async ({
	page,
}) => {
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/");
	await expect(
		page.getByText("بوابة النشاط التجاري", { exact: true }),
	).toBeVisible();
	await expect(page.locator("svg.lucide").first()).toBeVisible();
	expect(await page.locator("html").getAttribute("dir")).toBe("rtl");
	expect(
		await page.evaluate(
			() => document.documentElement.scrollWidth <= innerWidth + 1,
		),
	).toBe(true);
	expect(errors).toEqual([]);
});
test("legacy links preserve courier deep links", async ({ page }) => {
	await page.goto("/wasl/index.html#courier");
	await expect(page).toHaveURL(/\/wasl#courier/);
	await expect(page.locator(".portal-loading")).toHaveCount(0);
	await expect(
		page.getByText("حدث خطأ غير متوقع في هذه الشاشة", { exact: true }),
	).toHaveCount(0);
	await expect(page.locator("svg.lucide").first()).toBeVisible();
});
for (const portal of ["merchant", "company", "admin"]) {
	test(`${portal} portal opens without client runtime errors`, async ({
		page,
	}) => {
		const errors: string[] = [];
		page.on("pageerror", (error) => errors.push(error.message));
		await page.goto(`/wasl#${portal}`);
		await expect(page.locator("aside.side")).toBeVisible();
		await expect(page.locator("button.nav").first()).toHaveAttribute(
			"aria-label",
			/.+/,
		);
		expect(errors).toEqual([]);
	});
}
