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

export async function captureScreenshot(page: Page, url: string, name: string, selector = '#root') {
	await page.goto(url);
	const output = page.locator(selector);
	await output.waitFor();
	await expect(output).toHaveScreenshot(name, screenshotOpts);
}

export async function captureAndCompareScreenshot(
	page: Page,
	url: string,
	name: string,
	selector = '#root',
	interactions: (() => Promise<void>)[] = [],
) {
	await page.goto(url);
	const output = page.locator(selector);
	await output.waitFor();

	for (const interaction of interactions) {
		await interaction();
	}

	await expect(output).toHaveScreenshot(name, screenshotOpts);
}

export async function setupTest(page: Page, url: string, onError: (errors: string[]) => void) {
	const errors: string[] = [];
	page.on('pageerror', (err) => errors.push(err.message));
	page.on('console', (msg) => {
		if (msg.type() === 'error') errors.push(msg.text());
	});

	await page.goto(url);

	onError(errors);
}

export async function addMidiNotes(page: Page, notes: number[]) {
	await page.evaluate((notes) => {
		(window as any).recorder.addMidiNotes(notes);
		(window as any).update();
	}, notes);
}

export { expect };
