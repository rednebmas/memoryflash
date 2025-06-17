import { test, expect } from '@playwright/test';

// Regression test for measure overflow crash being fixed

test('NotationInputScreen handles overflow input', async ({ page }) => {
	let errors: string[] = [];
	page.on('pageerror', (err) => errors.push(err.message));
	page.on('console', (msg) => {
		if (msg.type() === 'error') errors.push(msg.text());
	});

	await page.goto('/tests/notation-input-screen-test.html');
	await page.locator('#root').waitFor();

	const press = async (midi: number) => {
		await page.evaluate((n) => {
			(window as any).store.dispatch({ type: 'midi/addNote', payload: n });
		}, midi);
		await page.evaluate((n) => {
			(window as any).store.dispatch({ type: 'midi/removeNote', payload: n });
		}, midi);
	};

	for (const m of [60, 62, 64, 65]) {
		await press(m);
	}
	await press(67);
	await page.waitForTimeout(200);

	expect(errors.some((e) => e.includes('IncompleteVoice'))).toBe(true);
});
