import { test as base, expect, Page } from '@playwright/test';

export const screenshotOpts = { maxDiffPixelRatio: 0.015 };

const blockFonts = process.env.BLOCK_FONTS === 'true';

export const test = base.extend<{ page: Page }>({
	page: async ({ page }, use) => {
		if (blockFonts) {
			await page.route('https://fonts.googleapis.com/**', (route) => route.abort());
			await page.route('https://fonts.gstatic.com/**', (route) => route.abort());
		}
		await use(page);
	},
});

export { expect };
