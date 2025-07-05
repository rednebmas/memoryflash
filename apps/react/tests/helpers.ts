import { test as base, expect, Page } from '@playwright/test';

export const screenshotOpts = { maxDiffPixels: 32 };

// If the font does/doesn't load can cause small differences making tests more flaky
const blockFonts = process.env.BLOCK_REMOTE_FONTS === 'true';

export const test = base.extend<{ page: Page }>({
	page: async ({ page }, use) => {
		const errors: string[] = [];
		page.on('pageerror', (err) => errors.push(err.message));
		page.on('console', (msg) => {
			if (msg.type() === 'error') errors.push(msg.text());
		});

		if (blockFonts) {
			await page.route('https://fonts.googleapis.com/**', (route) => route.abort());
			await page.route('https://fonts.gstatic.com/**', (route) => route.abort());
		}

		await use(page);

		expect(errors).toEqual([]);
	},
});

export async function captureScreenshot(page: Page, url: string, name: string, selector = '#root') {
	await page.goto(url);
	const output = page.locator(selector);
	await output.waitFor();
	await expect(output).toHaveScreenshot(name, screenshotOpts);
}

export async function runRecorderEvents(
	page: Page,
	url: string,
	events: number[][],
	prefix: string,
	afterStep?: (index: number) => Promise<void> | void,
) {
	await page.goto(url);
	const output = page.locator('#root');

	for (let i = 0; i < events.length; i++) {
		await page.evaluate((n) => {
			(window as any).recorder.addMidiNotes(n);
			(window as any).update();
		}, events[i]);
		await output.waitFor();
		await expect(output).toHaveScreenshot(`${prefix}-${i + 1}.png`, screenshotOpts);
		if (afterStep) await afterStep(i);
	}

	return output;
}

export { expect };
