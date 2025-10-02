import { test as base, expect, Page, Locator } from '@playwright/test';

const blockFonts = process.env.BLOCK_REMOTE_FONTS === 'true';

export const test = base.extend<{
	page: Page;
	getButton: (name: string, options?: { exact?: boolean }) => Locator;
	clickButton: (name: string, options?: { exact?: boolean }) => Promise<void>;
}>({
	page: async ({ page }, use) => {
		const errors: string[] = [];
		page.on('pageerror', (err) => errors.push(err.message));
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				const text = msg.text();
				if (text.includes('NotAllowedError')) return;
				if (text.includes('Failed to load resource')) return;
				if (text.includes('Cannot update a component')) return;
				errors.push(text);
			}
		});

		if (blockFonts) {
			await page.route('https://fonts.googleapis.com/**', (route) => route.abort());
			await page.route('https://fonts.gstatic.com/**', (route) => route.abort());
		}

		await page.addInitScript(() => {
			(window as any).__TEST_ENV__ = true;
		});

		await use(page);

		expect(errors).toEqual([]);
	},
	getButton: async ({ page }, use) => {
		await use((name: string, options: { exact?: boolean } = {}) =>
			page.getByRole('button', { name, exact: true, ...options }),
		);
	},
	clickButton: async ({ getButton }, use) => {
		await use(async (name: string, options: { exact?: boolean } = {}) => {
			await getButton(name, options).click();
		});
	},
});

export { expect };
