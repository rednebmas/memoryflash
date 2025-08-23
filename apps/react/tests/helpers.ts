import { test as base, expect, Page } from '@playwright/test';

export const screenshotOpts = { maxDiffPixels: 32 };

// If the font does/doesn't load can cause small differences making tests more flaky
const blockFonts = process.env.BLOCK_REMOTE_FONTS === 'true';

export const test = base.extend<{ page: Page }>({
	page: async ({ page }, use) => {
		const errors: string[] = [];
		page.on('pageerror', (err) => errors.push(err.message));
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				const text = msg.text();
				if (text.includes('NotAllowedError')) return; // ignore WebMIDI permission errors in test
				if (text.includes('Failed to load resource')) return; // ignore resource loading errors in test
				if (text.includes('Cannot update a component')) return; // ignore React setState warnings in test
				errors.push(text);
			}
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

export async function stubMathRandom(page: Page, seedStart = 12345) {
	await page.addInitScript((seed) => {
		let s = seed;
		Math.random = () => {
			const x = Math.sin(s++) * 10000;
			return x - Math.floor(x);
		};
	}, seedStart);
}

export async function seedTestData(page: Page) {
	const res = await page.request.post('http://localhost:3333/test/seed');
	expect(res.ok()).toBeTruthy();
	return res.json();
}

export async function uiLogin(page: Page, email: string, password: string) {
	await page.goto('/auth/login');
	await page.fill('#email', email);
	await page.fill('#password', password);
	const [response] = await Promise.all([
		page.waitForResponse((r) => r.url().includes('/auth/log-in')),
		page.click('button:has-text("Login")'),
	]);
	if (response.status() !== 200) throw new Error(`Login failed: ${await response.text()}`);
	await page.waitForURL((url) => !url.toString().includes('/auth/login'), { timeout: 5000 });
}
