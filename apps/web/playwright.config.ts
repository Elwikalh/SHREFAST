import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
	testDir: "./e2e",
	timeout: 60_000,
	expect: { timeout: 20_000 },
	fullyParallel: true,
	retries: process.env.CI ? 2 : 0,
	use: {
		baseURL: "http://127.0.0.1:3000",
		trace: "retain-on-failure",
		launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
			? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
			: {},
	},
	projects: [
		{ name: "desktop", use: { ...devices["Desktop Chrome"] } },
		{ name: "mobile", use: { ...devices["Pixel 7"] } },
	],
	webServer: {
		command: "pnpm dev",
		env: { WASL_UI_TEST: "1" },
		url: "http://127.0.0.1:3000",
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
	},
});
