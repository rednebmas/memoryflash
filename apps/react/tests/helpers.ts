import { test as base, expect, Page } from '@playwright/test';

export const screenshotOpts = { maxDiffPixels: 32 };

// If the font does/doesn't load can cause small differences making tests more flaky
const blockFonts = process.env.BLOCK_REMOTE_FONTS === 'true';

export const test = base.extend<{ page: Page }>({
	page: async ({ page }, use) => {
		if (blockFonts) {
			await page.route('https://fonts.googleapis.com/**', (route) => route.abort());
			await page.route('https://fonts.gstatic.com/**', (route) => route.abort());
		}
		await use(page);
	},
});

export async function captureScreenshot(
	page: Page,
	url: string,
	name: string,
	selector = '#output',
) {
	await page.goto(url);
	const output = page.locator(selector);
	await output.waitFor();
	await expect(output).toHaveScreenshot(name, screenshotOpts);
}

export { expect };
