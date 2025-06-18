import { test, expect } from '@playwright/test';
import { screenshotOpts } from './helpers';

const press = async (page: any, midi: number) => {
	await page.evaluate((n) => {
		(window as any).store.dispatch({ type: 'midi/addNote', payload: n });
	}, midi);
	await page.evaluate((n) => {
		(window as any).store.dispatch({ type: 'midi/removeNote', payload: n });
	}, midi);
};

test('screenshot after each note on', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (err) => errors.push(err.message));
	page.on('console', (msg) => {
		if (msg.type() === 'error') errors.push(msg.text());
	});

	await page.goto('/tests/notation-input-screen-test.html');
	const output = page.locator('#root');
	await output.waitFor();

	await page.waitForTimeout(200);
	await expect(output).toHaveScreenshot('notation-step-0.png', screenshotOpts);

	let idx = 1;
	for (const m of [60, 62, 64]) {
		await press(page, m);
		await page.waitForTimeout(200);
		await expect(output).toHaveScreenshot(`notation-step-${idx}.png`, screenshotOpts);
		idx++;
	}

	expect(errors).toEqual([]);
});
